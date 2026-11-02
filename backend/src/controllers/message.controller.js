import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { emitNewMessage, updateConversationAfterCreateMessage } from "../utils/messageHelper.js";
import { io } from "../socket/index.js";
import { uploadImageFromBuffer } from "../middleware/upload.middleware.js";

const normaliseContent = (content) => (typeof content === "string" ? content.trim() : "");

const uploadMessageImage = async (file) => {
  if (!file) return null;
  const uploaded = await uploadImageFromBuffer(file.buffer, {
    folder: "moji_chat/messages",
    transformation: [{ width: 1600, height: 1600, crop: "limit" }],
  });
  return uploaded.secure_url;
};

const validateMessage = (content, file) => {
  if (!content && !file) return "Tin nhắn không được để trống";
  if (content.length > 4000) return "Tin nhắn tối đa 4000 ký tự";
  return null;
};

export const sendDirectMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const recipientId = req.body.recipientId?.toString();
    const conversationId = req.body.conversationId;
    const content = normaliseContent(req.body.content);
    const validationError = validateMessage(content, req.file);
    if (validationError) return res.status(400).json({ message: validationError });

    let conversation;
    let actualRecipientId = recipientId;
    if (conversationId) {
      if (!mongoose.isValidObjectId(conversationId)) {
        return res.status(400).json({ message: "ID cuộc trò chuyện không hợp lệ" });
      }
      conversation = await Conversation.findById(conversationId);
      const isMember = conversation?.participants.some(
        (participant) => participant.userId.toString() === senderId.toString(),
      );
      if (!conversation || conversation.type !== "direct" || !isMember) {
        return res.status(403).json({ message: "Bạn không thể gửi tin nhắn vào cuộc trò chuyện này" });
      }
      actualRecipientId = conversation.participants
        .find((participant) => participant.userId.toString() !== senderId.toString())
        ?.userId?.toString();
      if (recipientId && recipientId !== actualRecipientId) {
        return res.status(400).json({ message: "Người nhận không khớp với cuộc trò chuyện" });
      }
    }

    if (!conversation) {
      if (!actualRecipientId || !mongoose.isValidObjectId(actualRecipientId)) {
        return res.status(400).json({ message: "Người nhận không hợp lệ" });
      }
      conversation = await Conversation.findOne({
        type: "direct",
        participants: { $size: 2 },
        "participants.userId": { $all: [senderId, actualRecipientId] },
      });
      if (!conversation) {
        conversation = await Conversation.create({
          type: "direct",
          participants: [{ userId: senderId }, { userId: actualRecipientId }],
          lastMessageAt: new Date(),
        });
      }
    }

    const imgUrl = await uploadMessageImage(req.file);
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      content,
      imgUrl,
    });
    updateConversationAfterCreateMessage(conversation, message, senderId);
    await conversation.save();
    await emitNewMessage(io, conversation, message);
    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn trực tiếp", error);
    return res.status(500).json({ message: "Không thể gửi tin nhắn" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation;
    const content = normaliseContent(req.body.content);
    const validationError = validateMessage(content, req.file);
    if (validationError) return res.status(400).json({ message: validationError });

    const imgUrl = await uploadMessageImage(req.file);
    const message = await Message.create({
      conversationId,
      senderId,
      content,
      imgUrl,
    });
    updateConversationAfterCreateMessage(conversation, message, senderId);
    await conversation.save();
    await emitNewMessage(io, conversation, message);
    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn nhóm", error);
    return res.status(500).json({ message: "Không thể gửi tin nhắn" });
  }
};
