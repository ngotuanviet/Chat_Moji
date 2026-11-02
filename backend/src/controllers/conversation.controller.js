import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { io } from "../socket/index.js";
import {
  deleteImageByPublicId,
  uploadImageFromBuffer,
} from "../middleware/upload.middleware.js";

const participantPopulate = {
  path: "participants.userId",
  select: "displayName avatarUrl username",
};

export const serializeConversation = (conversation) => {
  const source = conversation?.toObject ? conversation.toObject() : conversation;
  if (!source) return null;

  const participants = (source.participants || []).map((participant) => {
    const user = participant.userId;
    return {
      _id: user?._id?.toString?.() || user?.toString?.(),
      displayName: user?.displayName || "Người dùng",
      avatarUrl: user?.avatarUrl ?? null,
      username: user?.username,
      joinedAt: participant.joinedAt,
    };
  });
  const unreadCounts =
    source.unreadCounts instanceof Map
      ? Object.fromEntries(source.unreadCounts)
      : source.unreadCounts || {};
  const lastMessage = source.lastMessage
    ? {
        ...source.lastMessage,
        sender: source.lastMessage.senderId
          ? {
              _id:
                source.lastMessage.senderId._id?.toString?.() ||
                source.lastMessage.senderId.toString(),
              displayName: source.lastMessage.senderId.displayName || "",
              avatarUrl: source.lastMessage.senderId.avatarUrl ?? null,
            }
          : null,
      }
    : null;

  return {
    ...source,
    _id: source._id.toString(),
    participants,
    unreadCounts,
    lastMessage,
  };
};

const populateConversation = async (conversation) => {
  await conversation.populate([
    participantPopulate,
    { path: "seenBy", select: "displayName avatarUrl" },
    { path: "lastMessage.senderId", select: "displayName avatarUrl" },
  ]);
  return serializeConversation(conversation);
};

export const emitConversationUpdated = async (conversation, event = "conversation-updated") => {
  const formatted = await populateConversation(conversation);
  const participantIds = formatted.participants.map((participant) => participant._id);
  io.to(conversation._id.toString()).to(participantIds).emit(event, formatted);
  return formatted;
};

export const createConversation = async (req, res) => {
  try {
    const { type, name, memberIds } = req.body;
    const userId = req.user._id;
    const me = userId.toString();
    const ids = Array.isArray(memberIds)
      ? [...new Set(memberIds.map(String))].filter((id) => id !== me)
      : [];

    if (!['direct', 'group'].includes(type)) {
      return res.status(400).json({ message: "Loại cuộc trò chuyện không hợp lệ" });
    }
    if (!ids.length || ids.some((id) => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({ message: "Danh sách thành viên không hợp lệ" });
    }
    if (type === "direct" && ids.length !== 1) {
      return res.status(400).json({ message: "Chat riêng chỉ có thể có một người nhận" });
    }
    if (type === "group" && (!name?.trim() || name.trim().length > 100)) {
      return res.status(400).json({ message: "Tên nhóm phải có từ 1 đến 100 ký tự" });
    }

    const users = await User.countDocuments({ _id: { $in: ids } });
    if (users !== ids.length) {
      return res.status(404).json({ message: "Một hoặc nhiều thành viên không tồn tại" });
    }

    let conversation;
    if (type === "direct") {
      conversation = await Conversation.findOne({
        type: "direct",
        participants: { $size: 2 },
        "participants.userId": { $all: [userId, ids[0]] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          type: "direct",
          participants: [{ userId }, { userId: ids[0] }],
          lastMessageAt: new Date(),
        });
      }
    } else {
      conversation = await Conversation.create({
        type: "group",
        participants: [{ userId }, ...ids.map((id) => ({ userId: id }))],
        group: { name: name.trim(), createdBy: userId },
        lastMessageAt: new Date(),
      });
    }

    const formatted = await populateConversation(conversation);
    if (type === "group") {
      const participantIds = formatted.participants.map((participant) => participant._id);
      io.to(participantIds).emit("new-group", formatted);
    }
    return res.status(201).json({ conversation: formatted });
  } catch (error) {
    console.error("Lỗi khi tạo cuộc trò chuyện", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getConversation = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      "participants.userId": req.user._id,
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate([
        participantPopulate,
        { path: "lastMessage.senderId", select: "displayName avatarUrl" },
        { path: "seenBy", select: "displayName avatarUrl" },
      ])
      .lean();

    return res.status(200).json({
      conversations: conversations.map(serializeConversation),
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách cuộc trò chuyện", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 50;
    const query = { conversationId };
    if (req.query.cursor) {
      const cursor = new Date(req.query.cursor);
      if (Number.isNaN(cursor.getTime())) {
        return res.status(400).json({ message: "Con trỏ phân trang không hợp lệ" });
      }
      query.createdAt = { $lt: cursor };
    }

    let messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();
    const hasMore = messages.length > limit;
    if (hasMore) messages = messages.slice(0, limit);
    const nextCursor = hasMore
      ? messages[messages.length - 1]?.createdAt?.toISOString() || null
      : null;

    return res.status(200).json({ messages: messages.reverse(), nextCursor });
  } catch (error) {
    console.error("Lỗi khi lấy tin nhắn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getUserConversationForSocketIO = async (userId) => {
  try {
    const conversations = await Conversation.find(
      { "participants.userId": userId },
      { _id: 1 },
    ).lean();
    return conversations.map((conversation) => conversation._id.toString());
  } catch (error) {
    console.error("Lỗi khi tải rooms socket:", error);
    return [];
  }
};

export const markAsSeen = async (req, res) => {
  try {
    const conversation = req.conversation;
    const userId = req.user._id.toString();
    const lastMessage = conversation.lastMessage;
    if (!lastMessage || lastMessage.senderId?.toString() === userId) {
      return res.status(200).json({ message: "Không có tin nhắn mới để đánh dấu đã xem" });
    }

    conversation.seenBy = [req.user._id];
    conversation.unreadCounts.set(userId, 0);
    await conversation.save();
    const formatted = await emitConversationUpdated(conversation);

    return res.status(200).json({
      message: "Đã đánh dấu đã xem",
      seenBy: formatted.seenBy || [],
      myUnreadCount: 0,
    });
  } catch (error) {
    console.error("Lỗi khi đánh dấu đã xem", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const conversation = req.conversation;
    if (conversation.type !== "group") {
      return res.status(400).json({ message: "Chỉ có thể cập nhật nhóm trò chuyện" });
    }
    const { name } = req.body;
    if (name !== undefined) {
      if (!name?.trim() || name.trim().length > 100) {
        return res.status(400).json({ message: "Tên nhóm phải có từ 1 đến 100 ký tự" });
      }
      conversation.group.name = name.trim();
    }
    if (req.file) {
      const uploaded = await uploadImageFromBuffer(req.file.buffer, {
        folder: "moji_chat/group-avatars",
        transformation: [{ width: 400, height: 400, crop: "fill" }],
      });
      const previousImageId = conversation.group.avatarId;
      conversation.group.avatarUrl = uploaded.secure_url;
      conversation.group.avatarId = uploaded.public_id;
      if (previousImageId) {
        deleteImageByPublicId(previousImageId).catch((error) =>
          console.error("Không thể xoá ảnh nhóm cũ", error),
        );
      }
    }
    if (name === undefined && !req.file) {
      return res.status(400).json({ message: "Không có thay đổi nào để lưu" });
    }
    await conversation.save();
    return res.status(200).json({ conversation: await emitConversationUpdated(conversation) });
  } catch (error) {
    console.error("Lỗi khi cập nhật nhóm", error);
    return res.status(500).json({ message: "Không thể cập nhật nhóm" });
  }
};

export const addGroupParticipants = async (req, res) => {
  try {
    const conversation = req.conversation;
    const memberIds = Array.isArray(req.body.memberIds)
      ? [...new Set(req.body.memberIds.map(String))]
      : [];
    if (!memberIds.length || memberIds.some((id) => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({ message: "Danh sách thành viên không hợp lệ" });
    }
    const existingIds = new Set(conversation.participants.map((item) => item.userId.toString()));
    const newIds = memberIds.filter((id) => !existingIds.has(id));
    if (!newIds.length) {
      return res.status(200).json({ conversation: await populateConversation(conversation) });
    }
    const users = await User.countDocuments({ _id: { $in: newIds } });
    if (users !== newIds.length) {
      return res.status(404).json({ message: "Một hoặc nhiều thành viên không tồn tại" });
    }
    conversation.participants.push(...newIds.map((userId) => ({ userId })));
    newIds.forEach((userId) => conversation.unreadCounts.set(userId, 0));
    await conversation.save();
    const formatted = await emitConversationUpdated(conversation);
    io.to(newIds).emit("new-group", formatted);
    return res.status(200).json({ conversation: formatted });
  } catch (error) {
    console.error("Lỗi khi thêm thành viên nhóm", error);
    return res.status(500).json({ message: "Không thể thêm thành viên" });
  }
};

export const removeGroupParticipant = async (req, res) => {
  try {
    const conversation = req.conversation;
    const targetId = req.params.userId;
    const requesterId = req.user._id.toString();
    if (!mongoose.isValidObjectId(targetId)) {
      return res.status(400).json({ message: "ID thành viên không hợp lệ" });
    }
    const isOwner = conversation.group.createdBy?.toString() === requesterId;
    const isSelf = targetId === requesterId;
    if (!isOwner && !isSelf) {
      return res.status(403).json({ message: "Bạn không có quyền xoá thành viên này" });
    }
    if (targetId === conversation.group.createdBy?.toString() && conversation.participants.length > 1) {
      return res.status(400).json({ message: "Quản trị viên không thể rời nhóm khi còn thành viên" });
    }
    const existed = conversation.participants.some((item) => item.userId.toString() === targetId);
    if (!existed) {
      return res.status(404).json({ message: "Thành viên không có trong nhóm" });
    }
    conversation.participants = conversation.participants.filter(
      (item) => item.userId.toString() !== targetId,
    );
    conversation.unreadCounts.delete(targetId);

    if (!conversation.participants.length) {
      await Message.deleteMany({ conversationId: conversation._id });
      await Conversation.deleteOne({ _id: conversation._id });
      io.to(targetId).emit("conversation-removed", conversation._id.toString());
      return res.status(204).send();
    }

    await conversation.save();
    const formatted = await emitConversationUpdated(conversation);
    io.to(targetId).emit("conversation-removed", conversation._id.toString());
    return res.status(200).json({ conversation: formatted });
  } catch (error) {
    console.error("Lỗi khi xoá thành viên nhóm", error);
    return res.status(500).json({ message: "Không thể cập nhật thành viên nhóm" });
  }
};
