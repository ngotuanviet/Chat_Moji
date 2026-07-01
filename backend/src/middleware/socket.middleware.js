import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Unauthorized - Token không tồn tại'));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded || !decoded.userId) {
      return next(new Error('Unauthorized - Token không hợp lệ'));
    }

    const user = await User.findById(decoded.userId).select('-hashedPassword');
    if (!user) {
      return next(new Error('User không tồn tại'));
    }

    socket.user = user;
    return next();
  } catch (error) {
    console.error('Lỗi verify trong JWT trong socketmiddleware', error);

    if (error.name === 'TokenExpiredError') {
      return next(new Error('Unauthorized - Token đã hết hạn'));
    }

    return next(new Error('Unauthorized - Token không hợp lệ'));
  }
}