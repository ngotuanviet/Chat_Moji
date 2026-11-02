import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  getAllFriends,
  getFriendsRequests,
} from "../controllers/friend.controller.js";
const router = express.Router();
router.post("/requests", sendFriendRequest);
router.post("/requests/:requestId/accept", acceptFriendRequest);
router.post("/requests/:requestId/decline", declineFriendRequest);
router.delete("/requests/:requestId", cancelFriendRequest);
router.get("/", getAllFriends);
router.get("/requests", getFriendsRequests);
export default router;
