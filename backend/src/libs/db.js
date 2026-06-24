import mongoose from "mongoose";
export const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.URI_MONGODB);
    console.log("Liên kết CSDL thành công");
  } catch (error) {
    console.log("lỗi: " + error);
    process.exit(1);
  }
};
