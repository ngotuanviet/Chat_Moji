import express from 'express'
import {
  sendDirectMessage,
  sendGroupMessage,
} from '../controllers/message.controller.js'
import { checkFriendShip, checkGroupMembership } from '../middleware/friend.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
const router = express.Router();
router.post('/direct', upload.single('image'), checkFriendShip, sendDirectMessage)
router.post('/group', upload.single('image'), checkGroupMembership, sendGroupMessage)
export default router
