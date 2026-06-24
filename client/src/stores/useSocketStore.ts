import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "@/stores/useChatStore";
const baseUrl = import.meta.env.VITE_SOCKET_URL;
export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],
  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    const existingSocket = get().socket;
    if (existingSocket) return; // tránh tạo nhiều socket
    const socket: Socket = io(baseUrl, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });
    set({ socket });
    socket.on("connect", () => {
      console.log("====================================");
      console.log("Đã kết nối socket");
      console.log("====================================");
    });
    socket.on("online-users", (userIds) => {
      set({ onlineUsers: userIds });
    });
    // new Message
    socket.on("new-message", ({ message, conversation, unreadCounts }) => {
      useChatStore.getState().addMessage(message);
      const LastMessage = {
        _id: conversation.lastMessage._id,
        content: conversation.lastMessage.content,
        createAt: conversation.lastMessage.createAt,
        sender: {
          _id: conversation.lastMessage.senderId,
          displayName: "",
          avatarUrl: null,
        },
      };
      const updateConversaton = {
        ...conversation,
        LastMessage,
        unreadCounts,
      };
      if (
        useChatStore.getState().activeConversationId === message.conversationId
      ) {
        // đánh dấu đã đọc
      }
      useChatStore.getState().updateConversaton(updateConversaton);
    });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
