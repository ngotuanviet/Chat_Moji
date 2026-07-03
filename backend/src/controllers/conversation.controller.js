import Conversation from "../models/Conversation.js"
import Message from "../models/Message.js"
import { io } from "../socket/index.js"


export const createConversation = async (req, res) => {
  try {
    const { type, name, memberIds } = req.body
    const userId = req.user._id
    if (!type || (type === "group" && !name) || !memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: "Tên nhóm và danh sách thành viên là bắt buộc" })
    }
    let conversation = null
    if (type === 'direct') {
      const participantId = memberIds[0]

      if (!participantId) {
        return res.status(400).json({ message: "Conversation direct cá nhân cần 1 người tham gia" })
      }

      conversation = await Conversation.findOne({
        type: 'direct',
        "participants.userId": { $all: [userId, participantId] }
      })

      if (!conversation) {
        conversation = new Conversation({
          type: 'direct',
          participants: [{ userId }, { userId: participantId }],
          lastMessageAt: new Date()
        })
        await conversation.save()
      }
    } else if (type === 'group') {
      conversation = new Conversation({
        type: 'group',
        participants: [
          { userId },
          ...memberIds.map((id) => ({ userId: id }))
        ],
        group: {
          name,
          createdBy: userId
        },
        lastMessageAt: new Date()
      })
      await conversation.save()

    }
    if (!conversation) {
      return res.status(400).json({ message: 'Conversation type không hợp lệ' })
    }
    await conversation.populate([
      { path: 'participants.userId', select: 'displayName avatarUrl' },
      { path: 'seenBy', select: "displayName avatarUrl" },
      { path: "lastMessage.senderId", select: "displayName avatarUrl" }
    ])
    if (type === "group") {
      memberIds.forEach(userId => {
        io.to(userId).emit('new-group', conversation)
      });
    }
    return res.status(201).json({ conversation })

  } catch (error) {
    console.error("Lỗi khi tạo conversation", error);
    return res.status(500).json({ message: "Lỗi server" })

  }
}
export const getConversation = async (req, res) => {
  try {


    const userId = req.user._id
    const conversations = await Conversation.find({
      'participants.userId': userId
    }).sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate({
        path: 'participants.userId',
        select: 'displayName avatarUrl'
      }).populate({
        path: 'lastMessage.senderId',
        select: "displayName avatarUrl"
      }).populate({
        path: "seenBy",
        select: "displayName avatarUrl"
      }).lean()
    const formatted = conversations.map((convo) => {
      const participants = (convo.participants || []).map((p) => ({
        _id: p.userId?._id,
        displayName: p.userId?.displayName,
        avatarUrl: p.userId?.avatarUrl ?? null,
        joinedAt: p.joinedAt,
      }))
      const unreadCounts =
        convo.unreadCounts instanceof Map
          ? Object.fromEntries(convo.unreadCounts)
          : convo.unreadCounts && typeof convo.unreadCounts === "object"
            ? convo.unreadCounts
            : {}

      const lastMessage =
        convo.lastMessage
          ? {
            ...convo.lastMessage,
            sender: convo.lastMessage.senderId
              ? {
                _id: convo.lastMessage.senderId._id,
                displayName: convo.lastMessage.senderId.displayName,
                avatarUrl: convo.lastMessage.senderId.avatarUrl ?? null,
              }
              : null,
          }
          : null

      return {
        ...convo,
        lastMessage,
        unreadCounts,
        participants,
      }
    })

    return res.status(200).json({ conversations: formatted });
  } catch (error) {
    console.error("Lỗi xảy ra khi lấy conversations", error);
    return res.status(500).json({ message: "Lỗi hệ thống" })


  }
}

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, cursor } = req.query;
    const query = { conversationId };
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }
    let messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) + 1);
    let nextCursor = null;
    if (messages.length > Number(limit)) {
      const nextMessage = messages[messages.length - 1];
      nextCursor = nextMessage.createdAt.toISOString();
      messages.pop();
    }
    messages = messages.reverse();
    return res.status(200).json({
      messages,
      nextCursor
    });
  } catch (error) {
    console.error("Lỗi xảy ra khi lấy messages", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
}
export const getUserConversationForSocketIO = async (userId) => {
  try {
    const conversations = await Conversation.find({
      "participants.userId": userId
    }, { _id: 1 })
    return conversations.map((c) => c._id.toString())
  } catch (error) {
    console.error("Lỗi khi fetch conversations: ", error);
    return [];
  }
}
export const markAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();
    const conversation = await Conversation.findById(conversationId).lean()
    if (!conversation) {
      return res.status(404).json({ message: "Conversation không tồn tại" })
    }
    const last = conversation.lastMessage;
    if (!last) {
      return res.status(200).json({ message: "Không có tin nhắn để mark as seen" })
    }
    if (last.senderId.toString() === userId) {
      return res.status(200).json({ message: 'Sender không cần mark as seen' })
    }
    const updated = await Conversation.findByIdAndUpdate(conversationId, {
      $addToSet: { seenBy: userId },
      $set: { [`unreadCounts.${userId}`]: 0 }
    }, {
      new: true
    });

    const unreadCounts = updated?.unreadCounts
      ? Object.fromEntries(updated.unreadCounts)
      : {};

    const formattedConversation = {
      ...updated?.toObject(),
      unreadCounts,
    };

    io.to(conversationId).emit("read-message", {
      conversation: formattedConversation,
      lastMessage: {
        _id: updated?.lastMessage?._id,
        content: updated?.lastMessage?.content,
        createdAt: updated?.lastMessage?.createdAt,
        sender: {
          _id: updated?.lastMessage?.senderId
        }
      }
    })
    res.status(200).json({
      message: "Marked as seen",
      seenBy: updated?.seenBy || [],
      myUnreadCount: unreadCounts[userId] || 0,
    })
  } catch (error) {
    console.error(" Lỗi khi mark as seen", error);
    res.status(500).json({
      message: "Lỗi hệ thống "
    })
  }
}