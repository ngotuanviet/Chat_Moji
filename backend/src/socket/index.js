import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import express from "express";
import Conversation from "../models/Conversation.js";
import { socketAuthMiddleware } from "../middleware/socket.middleware.js";
import { getUserConversationForSocketIO } from "../controllers/conversation.controller.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

// A user can have more than one tab/device connected at once.
const onlineUsers = new Map();
const emitOnlineUsers = () => {
  const visibleIds = [...onlineUsers.entries()]
    .filter(([, entry]) => entry.visible && entry.socketIds.size > 0)
    .map(([userId]) => userId);
  io.emit("online-users", visibleIds);
};

export const setUserOnlineVisibility = (userId, visible) => {
  const entry = onlineUsers.get(userId);
  if (entry) entry.visible = visible;
  emitOnlineUsers();
};

io.on("connection", async (socket) => {
  const user = socket.user;
  const userId = user._id.toString();
  const entry = onlineUsers.get(userId) || {
    socketIds: new Set(),
    visible: user.showOnline !== false,
  };
  entry.socketIds.add(socket.id);
  entry.visible = user.showOnline !== false;
  onlineUsers.set(userId, entry);

  socket.join(userId);
  emitOnlineUsers();

  const conversationIds = await getUserConversationForSocketIO(user._id);
  conversationIds.forEach((id) => socket.join(id));

  socket.on("join-conversation", async (conversationId) => {
    if (!conversationId) return;
    const conversation = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": user._id,
    }).select("_id");
    if (conversation) socket.join(conversation._id.toString());
  });

  socket.on("disconnect", () => {
    const current = onlineUsers.get(userId);
    if (!current) return;
    current.socketIds.delete(socket.id);
    if (!current.socketIds.size) onlineUsers.delete(userId);
    emitOnlineUsers();
  });
});

export { io, app, server };
