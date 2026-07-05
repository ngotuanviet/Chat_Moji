import { uploadImageFromBuffer } from "../middleware/upload.middleware.js";
import User from "../models/User.js";

const authMe = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "lỗi hệ thống",
    });
  }
};
export const searchUserByUsername = async (req, res) => {
  try {
    const { username } = req.query
    if (!username || username.trim() === "") {
      return res.status(400).json({
        message: "Cần cung cấp username trong query"
      })
    }
    const user = await User.findOne({ username }).select("_id displayName username avatarUrl")


    return res.status(200).json({
      user
    })
  } catch (error) {
    console.error("Lỗi xảy ra khi tìm kiếm username: ", error);
    return res.status(500).json({
      message: "Lỗi hệ thống"
    })
  }
}
const test = async (req, res) => {
  res.sendStatus(204);
};
const uploadAvatar = async (req, res) => {
  try {
    const file = req.file
    const userId = req.user._id
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" })
    }
    const result = await uploadImageFromBuffer(file.buffer)
    const updatedUser = await User.findByIdAndUpdate(userId, {
      avatarUrl: result.secure_url,
      avatarId: result.public_id
    }, {
      new: true
    }).select("avatarUrl")
    if (!updatedUser.avatarUrl) {
      return res.status(400).json({ message: "Avatar trả về null" })
    }
    return res.status(200).json({
      message: "Cập nhật avatar thành công",
      avatarUrl: updatedUser.avatarUrl
    })
  } catch (error) {
    console.error("Lỗi xảy ra khi upload avatar", error);
    return res.status(500).json("Upload failed")
  }
}
const updatedUserInfo = async (req, res) => {
  try {
    const userId = req.user._id
    const { displayName, username, email, phone, bio } = req.body
    const updatedUserInfo = await User.findByIdAndUpdate(userId, {
      displayName, username, email, phone, bio
    }).select("displayName, username, email, phone, bio")
    res.status(200).json({
      userInfo: {
        displayName, username, email, phone, bio
      }
    })
  } catch (error) {
    console.error("Lỗi cập nhật thông tin user", error);
    res.status(500).json({
      message: `Thay đổi thông tin user lỗi`
    })

  }
}
export { authMe, test, uploadAvatar, updatedUserInfo };
