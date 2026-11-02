import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { deleteImageByPublicId, uploadImageFromBuffer } from "../middleware/upload.middleware.js";
import User from "../models/User.js";
import Session from "../models/Session.js";
import Friend from "../models/Friend.js";
import FriendRequest from "../models/FriendRequest.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { emitConversationUpdated } from "./conversation.controller.js";
import { setUserOnlineVisibility } from "../socket/index.js";

const PUBLIC_FIELDS = "_id username email displayName avatarUrl bio phone showOnline notificationsEnabled createdAt updatedAt";

export const authMe = async (req, res) => {
  return res.status(200).json({ user: req.user });
};

export const searchUserByUsername = async (req, res) => {
  try {
    const username = req.query.username?.trim().toLowerCase();
    if (!username) {
      return res.status(400).json({ message: "Cần cung cấp username" });
    }
    const user = await User.findOne({ username }).select("_id displayName username avatarUrl").lean();
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Lỗi khi tìm người dùng:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn một ảnh" });
    }
    const uploaded = await uploadImageFromBuffer(req.file.buffer, {
      folder: "moji_chat/avatars",
      transformation: [{ width: 400, height: 400, crop: "fill" }],
    });
    const previousUser = await User.findById(req.user._id).select("avatarId");
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl: uploaded.secure_url, avatarId: uploaded.public_id },
      { new: true, runValidators: true },
    ).select(PUBLIC_FIELDS);
    if (previousUser?.avatarId) {
      deleteImageByPublicId(previousUser.avatarId).catch((error) =>
        console.error("Không thể xoá avatar cũ", error),
      );
    }
    return res.status(200).json({ message: "Đã cập nhật ảnh đại diện", avatarUrl: user.avatarUrl, user });
  } catch (error) {
    console.error("Lỗi khi upload avatar", error);
    return res.status(500).json({ message: "Không thể upload ảnh đại diện" });
  }
};

export const updatedUserInfo = async (req, res) => {
  try {
    const { displayName, username, email, phone, bio } = req.body;
    const update = {};
    if (displayName !== undefined) update.displayName = displayName?.trim();
    if (username !== undefined) update.username = username?.trim().toLowerCase();
    if (email !== undefined) update.email = email?.trim().toLowerCase();
    if (phone !== undefined) update.phone = phone?.trim() || undefined;
    if (bio !== undefined) update.bio = bio?.trim();

    if (!update.displayName || !update.username || !update.email) {
      return res.status(400).json({ message: "Tên hiển thị, username và email là bắt buộc" });
    }
    if (!/^\S+@\S+\.\S+$/.test(update.email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }
    if (update.username.length < 3 || update.username.length > 30) {
      return res.status(400).json({ message: "Username phải từ 3 đến 30 ký tự" });
    }
    if (update.displayName.length > 80 || (update.bio && update.bio.length > 500)) {
      return res.status(400).json({ message: "Thông tin hồ sơ quá dài" });
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      runValidators: true,
    }).select(PUBLIC_FIELDS);
    return res.status(200).json({ userInfo: user });
  } catch (error) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "Thông tin";
      return res.status(409).json({ message: `${field} đã được sử dụng` });
    }
    console.error("Lỗi khi cập nhật thông tin người dùng", error);
    return res.status(500).json({ message: "Không thể cập nhật thông tin" });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const update = {};
    if (typeof req.body.showOnline === "boolean") update.showOnline = req.body.showOnline;
    if (typeof req.body.notificationsEnabled === "boolean") {
      update.notificationsEnabled = req.body.notificationsEnabled;
    }
    if (!Object.keys(update).length) {
      return res.status(400).json({ message: "Không có tuỳ chọn hợp lệ để cập nhật" });
    }
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true })
      .select(PUBLIC_FIELDS);
    if (update.showOnline !== undefined) {
      setUserOnlineVisibility(req.user._id.toString(), update.showOnline);
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Lỗi khi cập nhật tuỳ chọn", error);
    return res.status(500).json({ message: "Không thể cập nhật tuỳ chọn" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }
    const user = await User.findById(req.user._id).select("hashedPassword");
    const matches = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!matches) return res.status(401).json({ message: "Mật khẩu hiện tại không đúng" });
    user.hashedPassword = await bcrypt.hash(newPassword, 12);
    await user.save();
    await Session.deleteMany({ userId: req.user._id });
    return res.status(200).json({ message: "Đã đổi mật khẩu. Vui lòng đăng nhập lại." });
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu", error);
    return res.status(500).json({ message: "Không thể đổi mật khẩu" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Cần nhập mật khẩu để xoá tài khoản" });
    const user = await User.findById(req.user._id).select("hashedPassword avatarId");
    if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
      return res.status(401).json({ message: "Mật khẩu không đúng" });
    }
    const conversations = await Conversation.find({ "participants.userId": req.user._id });
    await Promise.all(
      conversations.map(async (conversation) => {
        if (conversation.type === "direct") {
          await Message.deleteMany({ conversationId: conversation._id });
          await Conversation.deleteOne({ _id: conversation._id });
          const otherUserId = conversation.participants
            .find((participant) => participant.userId.toString() !== req.user._id.toString())
            ?.userId;
          if (otherUserId) {
            // The other client removes the conversation when it next receives the list update.
            // A dedicated event prevents stale cached conversations in the meantime.
            const { io } = await import("../socket/index.js");
            io.to(otherUserId.toString()).emit("conversation-removed", conversation._id.toString());
          }
          return;
        }
        conversation.participants = conversation.participants.filter(
          (participant) => participant.userId.toString() !== req.user._id.toString(),
        );
        conversation.unreadCounts.delete(req.user._id.toString());
        if (!conversation.participants.length) {
          await Message.deleteMany({ conversationId: conversation._id });
          await Conversation.deleteOne({ _id: conversation._id });
          return;
        }
        if (conversation.group.createdBy?.toString() === req.user._id.toString()) {
          conversation.group.createdBy = conversation.participants[0].userId;
        }
        await conversation.save();
        await emitConversationUpdated(conversation);
      }),
    );
    await Promise.all([
      Session.deleteMany({ userId: req.user._id }),
      Friend.deleteMany({ $or: [{ userA: req.user._id }, { userB: req.user._id }] }),
      FriendRequest.deleteMany({ $or: [{ from: req.user._id }, { to: req.user._id }] }),
      User.deleteOne({ _id: req.user._id }),
    ]);
    if (user.avatarId) deleteImageByPublicId(user.avatarId).catch(() => undefined);
    return res.status(204).send();
  } catch (error) {
    console.error("Lỗi khi xoá tài khoản", error);
    return res.status(500).json({ message: "Không thể xoá tài khoản" });
  }
};

export const test = (_req, res) => res.sendStatus(204);
