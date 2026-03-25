import bcrypt from "bcryptjs";
import { jest } from "@jest/globals";

// Mock modules before importing controllers
jest.unstable_mockModule("../models/User.js", () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const { default: User } = await import("../models/User.js");
const { register, login } = await import("../controllers/authController.js");

process.env.JWT_SECRET = "test-secret";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("authController", () => {
  afterEach(() => jest.clearAllMocks());

  test("register creates user and returns token", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: "u1",
      email: "new@example.com",
      plan: "free",
      role: "user",
      usageLimit: 5,
      usageCount: 0,
    });

    const res = mockRes();
    await register({ body: { email: "new@example.com", password: "secret" } }, res);

    expect(User.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({ email: "new@example.com" }),
        token: expect.any(String),
      })
    );
  });

  test("login fails for wrong password", async () => {
    const hash = await bcrypt.hash("correct", 10);
    User.findOne.mockResolvedValue({
      _id: "u1",
      email: "a@b.com",
      password: hash,
      plan: "free",
      role: "user",
      usageLimit: 5,
      usageCount: 0,
      save: jest.fn(),
    });
    const res = mockRes();
    await login({ body: { email: "a@b.com", password: "wrong" } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Wrong password" });
  });

  test("login returns token on success", async () => {
    const hash = await bcrypt.hash("correct", 10);
    const save = jest.fn();
    User.findOne.mockResolvedValue({
      _id: "u1",
      email: "a@b.com",
      password: hash,
      plan: "free",
      role: "user",
      usageLimit: 5,
      usageCount: 1,
      save,
    });

    const res = mockRes();
    await login({ body: { email: "a@b.com", password: "correct" } }, res);

    expect(save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({ email: "a@b.com" }),
      })
    );
  });
});
