import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Session from "../models/Session.js";
import crypto from "crypto";

const DEFAULT_ACCESS_TOKEN_TTL = "30s";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 1000;

const resolveAccessTokenTtl = () => {
  const ttl = process.env.ACCESS_TOKEN_TTL?.trim();
  return ttl || DEFAULT_ACCESS_TOKEN_TTL;
};

const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;

    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        message:
          "Khong the thieu username, password, email, firstName, lastName",
      });
    }

    const duplicateUser = await User.findOne({ username });
    if (duplicateUser) {
      return res.status(409).json({
        message: "Username da ton tai",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${lastName} ${firstName}`,
    });

    return res.status(201).json({
      message: "Dang ky thanh cong",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Loi server goi signUp",
    });
  }
};

const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Khong the thieu username, password",
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        message: "Tai khoan khong ton tai",
      });
    }

    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);


    if (!passwordCorrect) {
      return res.status(401).json({
        message: "Mat khau khong dung",
      });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: resolveAccessTokenTtl(),
      },
    );

    const refreshToken = crypto.randomBytes(64).toString("hex");
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL,
    });

    return res.status(200).json({
      message: `Dang nhap thanh cong nguoi dung ${user.displayName}`,
      accessToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Loi server goi signIn",
    });
  }
};

const signOut = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await Session.deleteOne({ refreshToken: token });
    }

    res.clearCookie("refreshToken");
    return res.status(200).json({
      message: "Dang xuat thanh cong",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Loi server goi signOut",
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Token khong ton tai." });
    }

    const session = await Session.findOne({ refreshToken: token });
    if (!session) {
      return res.status(403).json({
        message: "Token khong hop le hoac da het han",
      });
    }

    if (session.expiresAt < new Date()) {
      return res.status(403).json({
        message: "Token da het han",
      });
    }

    const accessToken = jwt.sign(
      {
        userId: session.userId,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: resolveAccessTokenTtl() },
    );

    return res.status(200).json({
      accessToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Loi he thong",
    });
  }
};

export { signUp, signIn, signOut, refreshToken };
