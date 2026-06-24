import Friend from "../models/Friend.js";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
export const sendFriendRequest = async (req, res) => {
  try {
    const { to, message } = req.body;
    const from = req.user._id;
    if (from === to) {
      return res.status(400).json({
        message: "Không thể gửi lời mời kết bạn cho chính mình",
      });
    }
    const userExits = await User.exists({ _id: to });
    if (!userExits) {
      return res.status(404).json({
        message: "Người dùng không tồn tại",
      });
    }
    let userA = from.toString();
    let userB = to.toString();
    if (userA > userB) {
      [userA, userB] = [userB, userA];
    }
    const [alreadyFriends, existingRequest] = await Promise.all([
      Friend.findOne({ userA, userB }),
      FriendRequest.findOne({
        $or: [
          { from, to },
          { from: to, to: from },
        ],
      }),
    ]);
    if (alreadyFriends) {
      return res.status(400).json({ message: "Hai người đã là bạn bè" });
    }
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Đã có lời mời kết bạn đang chờ" });
    }
    const request = await FriendRequest.create({
      from,
      to,
      message,
    });
    return res
      .status(201)
      .json({ message: "Gửi lời mời kết bạn thành công", request });
  } catch (error) {
    console.log("lỗi khi gửi lời mời kết bạn", error);
    res.status(500).json({
      message: "lỗi hệ thống",
    });
  }
};
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;
    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lời mời kết bạn" });
    }
    if (request.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền chấp nhận lời mời này" });
    }
    const friend = await Friend.create({
      userA: request.from,
      userB: request.to,
    });

    await FriendRequest.findByIdAndDelete(requestId);
    const from = await User.findById(request.from)
      .select("_id displayName avatarUrl")
      .lean();
    return res.status(200).json({
      message: " chấp nhận lời mời kết bạn thành công",
      newFriend: {
        _id: from?._id,
        displayName: from?.displayName,
        avatarUrl: from?.avatarUrl,
      },
    });
  } catch (error) {
    console.log("lỗi khi chấp nhận lời mời kết bạn", error);
    res.status(500).json({
      message: "lỗi hệ thống",
    });
  }
};
export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params
    const userId = req.user._id
    const request = await FriendRequest.findById(requestId)
    if (!request) {
      return res.status(404).json({
        message: 'Không tìm thấy lời mời kết bạn'
      })
    }
    if (request.to.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền từ chối lời mời này' })

    }
    await FriendRequest.findByIdAndDelete(requestId);
    return res.sendStatus(204)
  } catch (error) {
    console.log("lỗi khi từ chối lời mời kết bạn", error);
    res.status(500).json({
      message: "lỗi hệ thống",
    });
  }
};
export const getAllFriends = async (req, res) => {
  try {
    const userID = req.user._id
    const friendships = await Friend.find({
      $or: [{
        userA: userID
      }, {
        userB: userID
      }]
    }).populate("userA", "_id displayName avatarUrl")
      .populate("userB", "_id displayName avatarUrl")
      .lean();
    if (!friendships.length) {
      return res.status(200).json({
        friends: []
      })
    }
    const friends = friendships.map((f) => f.userA._id.toString() === userID.toString() ? f.userB : f.userA)
    return res.status(200).json({ friends })
  } catch (error) {
    console.log("lỗi khi lấy danh sách bạn bè kết bạn", error);
    res.status(500).json({
      message: "lỗi hệ thống",
    });
  }
};
export const getFriendsRequests = async (req, res) => {
  try {
    const userID = req.user._id
    const populateFields = '_id username displayName avatarUrl';
    const [sent, received] = await Promise.all([
      FriendRequest.find({ from: userID }).populate("to", populateFields),
      FriendRequest.find({ from: userID }).populate("from", populateFields)

    ])
    res.status(200).json({
      sent,
      received
    })
  } catch (error) {
    console.log("lỗi khi lấy danh sách yêu cầu kết bạn", error);
    res.status(500).json({
      message: "lỗi hệ thống",
    });
  }
};
