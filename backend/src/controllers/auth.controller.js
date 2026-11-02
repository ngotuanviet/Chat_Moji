import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Session from "../models/Session.js";

const DEFAULT_ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

const accessTokenTtl = () => process.env.ACCESS_TOKEN_TTL?.trim() || DEFAULT_ACCESS_TOKEN_TTL;
const createAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: accessTokenTtl() });
const createRefreshToken = () => crypto.randomBytes(64).toString("hex");
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: REFRESH_TOKEN_TTL,
  path: "/api/auth",
};
const clearCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/api/auth",
};

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;
    const normalizedUsername = username?.trim().toLowerCase();
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedUsername || !password || !normalizedEmail || !firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
    }
    if (normalizedUsername.length < 3 || normalizedUsername.length > 30 || password.length < 6) {
      return res.status(400).json({ message: "Username hoặc mật khẩu không hợp lệ" });
    }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }
    const duplicateUser = await User.exists({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });
    if (duplicateUser) {
      return res.status(409).json({ message: "Username hoặc email đã được sử dụng" });
    }

    await User.create({
      username: normalizedUsername,
      hashedPassword: await bcrypt.hash(password, 12),
      email: normalizedEmail,
      displayName: `${firstName.trim()} ${lastName.trim()}`,
    });
    return res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Username hoặc email đã được sử dụng" });
    }
    console.error("Lỗi đăng ký", error);
    return res.status(500).json({ message: "Không thể đăng ký tài khoản" });
  }
};

export const signIn = async (req, res) => {
  try {
    const username = req.body.username?.trim().toLowerCase();
    const { password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Vui lòng nhập username và mật khẩu" });
    }
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
      return res.status(401).json({ message: "Username hoặc mật khẩu không đúng" });
    }

    const refreshToken = createRefreshToken();
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });
    res.cookie("refreshToken", refreshToken, cookieOptions);
    return res.status(200).json({
      message: `Đăng nhập thành công`,
      accessToken: createAccessToken(user._id),
    });
  } catch (error) {
    console.error("Lỗi đăng nhập", error);
    return res.status(500).json({ message: "Không thể đăng nhập" });
  }
};

export const signOut = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) await Session.deleteOne({ refreshToken: token });
    res.clearCookie("refreshToken", clearCookieOptions);
    return res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.error("Lỗi đăng xuất", error);
    return res.status(500).json({ message: "Không thể đăng xuất" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: "Không có phiên đăng nhập" });
    const session = await Session.findOne({ refreshToken: token });
    if (!session || session.expiresAt <= new Date()) {
      if (session) await Session.deleteOne({ _id: session._id });
      res.clearCookie("refreshToken", clearCookieOptions);
      return res.status(403).json({ message: "Phiên đăng nhập đã hết hạn" });
    }

    session.refreshToken = createRefreshToken();
    session.expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL);
    await session.save();
    res.cookie("refreshToken", session.refreshToken, cookieOptions);
    return res.status(200).json({ accessToken: createAccessToken(session.userId) });
  } catch (error) {
    console.error("Lỗi làm mới phiên", error);
    return res.status(500).json({ message: "Không thể làm mới phiên đăng nhập" });
  }
};
