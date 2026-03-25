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

export const streamGenerate = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).end();

  const limit = user.usageLimit || 5;
  if (user.usageCount >= limit) {
    res.writeHead(429, { "Content-Type": "text/event-stream" });
    res.write(`event: error\ndata: ${JSON.stringify({ message: "Usage limit reached" })}\n\n`);
    return res.end();
  }

  const { value, error } = generateSchema.validate(req.query);
  if (error) {
    res.writeHead(400, { "Content-Type": "text/event-stream" });
    res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
    return res.end();
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  try {
    res.write(`event: status\ndata: "requesting providers"\n\n`);
    const { provider, data } = await generateMarketingContent(value);
    res.write(`event: provider\ndata: "${provider}"\n\n`);

    const chunks = JSON.stringify(data, null, 2).match(/.{1,120}/g) || [];
    for (const chunk of chunks) {
      res.write(`data: ${chunk}\n\n`);
    }

    await Content.create({
      userId: user._id,
      keyword: value.keyword,
      module: value.moduleType,
      provider,
      result: data,
    });

    user.usageCount += 1;
    await user.save();

    res.write(`event: done\ndata: ${JSON.stringify({ remaining: limit - user.usageCount })}\n\n`);
    res.end();
  } catch (err) {
    res.write(`event: error\ndata: ${JSON.stringify({ message: err.message || "AI failed" })}\n\n`);
    res.end();
  }
};
