import { Server } from 'socket.io'
import http from "http"
import express from "express"
import { socketAuthMiddleware } from '../middleware/socket.middleware.js';
import { getUserConversationForSocketIO } from '../controllers/conversation.controller.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  }
})
io.use(socketAuthMiddleware);
const onlineUsers = new Map(); // {userId: socketId}
io.on("connection", async (socket) => {
  const user = socket.user
  const userId = user._id.toString();
  console.log(`${user.displayName} online với socket  ${socket.id}`);
  onlineUsers.set(userId, socket.id);
  io.emit("online-users", Array.from(onlineUsers.keys()))

  const conversationIds = await getUserConversationForSocketIO(user._id);
  conversationIds.forEach(id => {
    socket.join(id);
  });
  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    io.emit("online-users", Array.from(onlineUsers.keys()))
    console.log(`socket disconnected: ${socket.id}`);

  })

})
export { io, app, server };