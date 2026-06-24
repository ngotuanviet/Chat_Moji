import jwt from "jsonwebtoken";
import User from "../models/User.js";
// authorization - xacs minh user là ai
const protectedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({
        message: "Không có token",
      });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        console.error(err);
        return res.status(403).json({
          message: "Token hết hạn hoặc không đúng",
        });
      }

      const user = await User.findById(decoded.userId).select(
        "-hashedPassword"
      );
      if (!user) {
        return res.status(404).json({
          message: "Người dùng không tồn tại",
        });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi server gọi protectedRoute",
    });
  }
};
export { protectedRoute };