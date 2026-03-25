import User from "../models/User.js";
import Content from "../models/Content.js";

export const overview = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalGenerations = await Content.countDocuments();
  const perUser = await Content.aggregate([
    { $group: { _id: "$userId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);

  res.json({
    totalUsers,
    totalGenerations,
    topUsers: perUser,
  });
};
