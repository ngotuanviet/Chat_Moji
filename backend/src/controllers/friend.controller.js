import mongoose from "mongoose";
import Friend from "../models/Friend.js";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import { io } from "../socket/index.js";

const pair = (first, second) => {
  const a = first.toString();
  const b = second.toString();
  return a < b ? [a, b] : [b, a];
};

const publicUserFields = "_id displayName username avatarUrl";

export const sendFriendRequest = async (req, res) => {
  try {
    const { to, message } = req.body;
    const from = req.user._id;
    if (!mongoose.isValidObjectId(to)) {
      return res.status(400).json({ message: "Người dùng không hợp lệ" });
    }
    if (from.toString() === to.toString()) {
      return res.status(400).json({ message: "Bạn không thể gửi lời mời cho chính mình" });
    }
    if (typeof message === "string" && message.length > 300) {
      return res.status(400).json({ message: "Lời nhắn tối đa 300 ký tự" });
    }

    const recipient = await User.exists({ _id: to });
    if (!recipient) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    const [userA, userB] = pair(from, to);
    const [alreadyFriends, existingRequest] = await Promise.all([
      Friend.exists({ userA, userB }),
      FriendRequest.exists({
        $or: [{ from, to }, { from: to, to: from }],
      }),
    ]);
    if (alreadyFriends) {
      return res.status(409).json({ message: "Hai người đã là bạn bè" });
    }
    if (existingRequest) {
      return res.status(409).json({ message: "Đã có lời mời kết bạn đang chờ" });
    }

    const request = await FriendRequest.create({
      from,
      to,
      message: typeof message === "string" ? message.trim() : "",
    });
    const populatedRequest = await FriendRequest.findById(request._id)
      .populate("from", publicUserFields)
      .populate("to", publicUserFields)
      .lean();
    io.to(to.toString()).emit("friend-request", {
      request: populatedRequest,
      from: populatedRequest.from,
    });
    return res.status(201).json({ message: "Đã gửi lời mời kết bạn", request: populatedRequest });
  } catch (error) {
    console.error("Lỗi khi gửi lời mời kết bạn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({ message: "ID lời mời không hợp lệ" });
    }
    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy lời mời kết bạn" });
    }
    if (request.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền chấp nhận lời mời này" });
    }

    const [userA, userB] = pair(request.from, request.to);
    await Friend.updateOne(
      { userA, userB },
      { $setOnInsert: { userA, userB } },
      { upsert: true },
    );
    await FriendRequest.findByIdAndDelete(requestId);
    const [sender, recipient] = await Promise.all([
      User.findById(request.from).select(publicUserFields).lean(),
      User.findById(request.to).select(publicUserFields).lean(),
    ]);

    io.to(request.from.toString()).emit("friend-request-accepted", {
      friend: recipient,
    });
    io.to(request.to.toString()).emit("friend-request-accepted", {
      friend: sender,
    });
    return res.status(200).json({
      message: "Đã chấp nhận lời mời kết bạn",
      newFriend: sender,
    });
  } catch (error) {
    console.error("Lỗi khi chấp nhận lời mời kết bạn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({ message: "ID lời mời không hợp lệ" });
    }
    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy lời mời kết bạn" });
    }
    if (request.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền từ chối lời mời này" });
    }
    await FriendRequest.findByIdAndDelete(requestId);
    io.to(request.from.toString()).emit("friend-request-declined", { requestId });
    return res.status(204).send();
  } catch (error) {
    console.error("Lỗi khi từ chối lời mời kết bạn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const cancelFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({ message: "ID lời mời không hợp lệ" });
    }
    const request = await FriendRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Không tìm thấy lời mời kết bạn" });
    if (request.from.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền huỷ lời mời này" });
    }
    await FriendRequest.findByIdAndDelete(requestId);
    io.to(request.to.toString()).emit("friend-request-cancelled", { requestId });
    return res.status(204).send();
  } catch (error) {
    console.error("Lỗi khi huỷ lời mời kết bạn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getAllFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    const friendships = await Friend.find({
      $or: [{ userA: userId }, { userB: userId }],
    })
      .populate("userA", publicUserFields)
      .populate("userB", publicUserFields)
      .lean();
    const friends = friendships.map((friendship) =>
      friendship.userA._id.toString() === userId.toString()
        ? friendship.userB
        : friendship.userA,
    );
    return res.status(200).json({ friends });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bạn bè", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getFriendsRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const [sent, received] = await Promise.all([
      FriendRequest.find({ from: userId }).populate("to", publicUserFields).lean(),
      FriendRequest.find({ to: userId }).populate("from", publicUserFields).lean(),
    ]);
    return res.status(200).json({ sent, received });
  } catch (error) {
    console.error("Lỗi khi lấy lời mời kết bạn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
