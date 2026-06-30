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
export { authMe, test };
