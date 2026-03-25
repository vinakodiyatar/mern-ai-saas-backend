import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const header = req.headers.authorization || "";
  // EventSource (SSE) cannot set headers, so token arrives as ?token= query param for /stream
  const token = header.startsWith("Bearer ")
    ? header.split(" ")[1]
    : header || req.query.token || "";
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}
