import express from 'express'
import {
  addGroupParticipants,
  createConversation,
  getConversation,
  getMessages,
  markAsSeen,
  removeGroupParticipant,
  updateGroup,
} from '../controllers/conversation.controller.js'
import {
  checkConversationMembership,
  checkFriendShip,
  checkGroupOwner,
} from '../middleware/friend.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = express.Router();
router.post("/", checkFriendShip, createConversation)
router.get("/", getConversation)
router.get("/:conversationId/messages", checkConversationMembership, getMessages)
router.patch("/:conversationId/seen", checkConversationMembership, markAsSeen)
router.patch("/:conversationId/group", checkConversationMembership, checkGroupOwner, upload.single("image"), updateGroup)
router.post("/:conversationId/participants", checkConversationMembership, checkGroupOwner, checkFriendShip, addGroupParticipants)
router.delete("/:conversationId/participants/:userId", checkConversationMembership, removeGroupParticipant)
export default router;
