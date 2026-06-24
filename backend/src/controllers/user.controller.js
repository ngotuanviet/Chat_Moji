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
const test = async (req, res) => {
  res.sendStatus(204);
};
export { authMe, test };
