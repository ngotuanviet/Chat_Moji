import express from "express";
import {
  authMe,
  changePassword,
  deleteAccount,
  searchUserByUsername,
  test,
  updatedUserInfo,
  updatePreferences,
  uploadAvatar,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/upload.middleware.js"
const router = express.Router();
router.get("/me", authMe);
router.get("/test", test);
router.get("/search", searchUserByUsername)
router.post("/uploadAvatar", upload.single("file"), uploadAvatar)
router.post("/update", updatedUserInfo)
router.patch("/preferences", updatePreferences)
router.post("/change-password", changePassword)
router.delete("/me", deleteAccount)
export default router;
