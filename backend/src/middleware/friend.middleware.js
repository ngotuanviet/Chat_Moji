import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Friend from "../models/Friend.js";

const pair = (first, second) => {
  const a = first.toString();
  const b = second.toString();
  return a < b ? [a, b] : [b, a];
};

const isValidId = (value) => mongoose.isValidObjectId(value);

/** Ensures every invited/direct-message recipient is already a friend. */
export const checkFriendShip = async (req, res, next) => {
  try {
    const me = req.user._id.toString();
    const recipientId = req.body?.recipientId;
    const rawMemberIds = Array.isArray(req.body?.memberIds)
      ? req.body.memberIds
      : [];
    const targetIds = [
      ...(recipientId ? [recipientId] : []),
      ...rawMemberIds,
    ].map(String);
    const uniqueTargetIds = [...new Set(targetIds)].filter((id) => id !== me);

    if (!uniqueTargetIds.length) {
      return res.status(400).json({
        message: "Cần cung cấp người nhận hoặc thành viên hợp lệ",
      });
    }
    if (uniqueTargetIds.some((id) => !isValidId(id))) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }

    const checks = await Promise.all(
      uniqueTargetIds.map(async (id) => {
        const [userA, userB] = pair(me, id);
        const friendship = await Friend.exists({ userA, userB });
        return friendship ? null : id;
      }),
    );
    const notFriends = checks.filter(Boolean);
    if (notFriends.length) {
      return res.status(403).json({
        message: "Bạn chỉ có thể trò chuyện cùng bạn bè",
        notFriends,
      });
    }

    next();
  } catch (error) {
    console.error("Lỗi khi kiểm tra quan hệ bạn bè:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const checkGroupMembership = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    if (!isValidId(conversationId)) {
      return res.status(400).json({ message: "ID cuộc trò chuyện không hợp lệ" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.type !== "group") {
      return res.status(404).json({ message: "Không tìm thấy nhóm trò chuyện" });
    }
    const isMember = conversation.participants.some(
      (participant) => participant.userId.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      return res.status(403).json({ message: "Bạn không ở trong nhóm này" });
    }

    req.conversation = conversation;
    next();
  } catch (error) {
    console.error("Lỗi khi kiểm tra thành viên nhóm:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

/** Protects message history, read receipts and group-management routes. */
export const checkConversationMembership = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    if (!isValidId(conversationId)) {
      return res.status(400).json({ message: "ID cuộc trò chuyện không hợp lệ" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Cuộc trò chuyện không tồn tại" });
    }
    const isMember = conversation.participants.some(
      (participant) => participant.userId.toString() === req.user._id.toString(),
    );
    if (!isMember) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập cuộc trò chuyện này" });
    }

    req.conversation = conversation;
    next();
  } catch (error) {
    console.error("Lỗi khi kiểm tra cuộc trò chuyện:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const checkGroupOwner = (req, res, next) => {
  const conversation = req.conversation;
  if (
    !conversation ||
    conversation.type !== "group" ||
    conversation.group?.createdBy?.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: "Chỉ quản trị viên nhóm mới có quyền này" });
  }
  next();
};
