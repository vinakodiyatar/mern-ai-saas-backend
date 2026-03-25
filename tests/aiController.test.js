import { jest } from "@jest/globals";

jest.unstable_mockModule("../models/User.js", () => ({
  default: { findById: jest.fn() },
}));
jest.unstable_mockModule("../models/Content.js", () => ({
  default: { create: jest.fn() },
}));
jest.unstable_mockModule("../services/aiService.js", () => ({
  generateMarketingContent: jest.fn(),
}));

const { default: User } = await import("../models/User.js");
const { default: Content } = await import("../models/Content.js");
const { generateMarketingContent } = await import("../services/aiService.js");
const { generate } = await import("../controllers/aiController.js");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("aiController.generate", () => {
  afterEach(() => jest.clearAllMocks());

  test("blocks when usage limit reached", async () => {
    User.findById.mockResolvedValue({ _id: "u1", usageLimit: 1, usageCount: 1 });
    const res = mockRes();
    await generate({ user: { id: "u1" }, body: { keyword: "seo" } }, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Usage limit reached" });
  });

  test("persists content and returns remaining quota", async () => {
    const save = jest.fn();
    User.findById.mockResolvedValue({ _id: "u1", usageLimit: 5, usageCount: 2, save });
    generateMarketingContent.mockResolvedValue({ provider: "gemini", data: { metaTitle: "t" } });
    Content.create.mockResolvedValue({});

    const res = mockRes();
    await generate({ user: { id: "u1" }, body: { keyword: "seo" } }, res);

    expect(Content.create).toHaveBeenCalledWith(expect.objectContaining({ provider: "gemini" }));
    expect(save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ remaining: 2 }));
  });
});
