import User from "../models/User.js";
import Content from "../models/Content.js";
import { generateMarketingContent } from "../services/aiService.js";
import { buildPdf, buildDocx } from "../services/exportService.js";
import { generateSchema } from "../utils/validate.js";

export const generate = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    const limit = user.usageLimit || 5;
    if (user.usageCount >= limit) {
      return res.status(403).json({ message: "Usage limit reached" });
    }

    const { value, error } = generateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details?.[0]?.message || error.message });

    const { keyword, url, moduleType, product, audience } = value;

    const { provider, data } = await generateMarketingContent({
      moduleType,
      keyword,
      url,
      product,
      audience,
    });

    await Content.create({
      userId: user._id,
      keyword,
      module: moduleType,
      provider,
      result: data,
    });

    user.usageCount += 1;
    await user.save();

    res.json({
      provider,
      result: data,
      remaining: Math.max(0, limit - user.usageCount),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Something went wrong. Try again." });
  }
};

export const history = async (req, res) => {
  const data = await Content.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(data);
};

export const exportPdf = async (req, res) => {
  const content = await Content.findOne({ _id: req.params.id, userId: req.user.id });
  if (!content) return res.status(404).json({ message: "Not found" });
  const buffer = await buildPdf(content);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=content-${content._id}.pdf`);
  res.send(buffer);
};

export const exportDocx = async (req, res) => {
  const content = await Content.findOne({ _id: req.params.id, userId: req.user.id });
  if (!content) return res.status(404).json({ message: "Not found" });
  const buffer = await buildDocx(content);
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
  res.setHeader("Content-Disposition", `attachment; filename=content-${content._id}.docx`);
  res.send(buffer);
};

