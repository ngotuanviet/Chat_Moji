import multer from "multer"
import { v2 as cloudinary } from 'cloudinary'

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype?.startsWith("image/")) {
      callback(null, true);
      return;
    }
    callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "file"));
  },
})
export const uploadImageFromBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({
      folder: "moji_chat",
      resource_type: "image",
      ...options
    },
      (error, result) => {
        if (error) {
          reject(error)

        } else {
          resolve(result)
        }
      })
    uploadStream.end(buffer)
  })
}

export const deleteImageByPublicId = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};
