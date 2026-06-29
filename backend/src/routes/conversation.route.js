import express from 'express'
import { createConversation, getConversation, getMessages, markAsSeen } from '../controllers/conversation.controller.js'
import { checkFriendShip } from '../middleware/friend.Middleware.js'

const router = express.Router();
router.post("/", checkFriendShip, createConversation)
router.get("/", getConversation)
router.get("/:conversationId/messages", getMessages)
router.patch("/:conversationId/seen", markAsSeen)
export default router;