import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectedRoute = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Không có token xác thực" });

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId).select("-hashedPassword -avatarId");
    if (!user) return res.status(401).json({ message: "Người dùng không tồn tại" });
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
    console.error("Lỗi xác thực", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
