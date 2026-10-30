import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "@/stores/useChatStore";
import { useFriendStore } from "@/stores/useFriendStore";
import { toast } from "sonner";

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
      const currentUserId = useAuthStore.getState().user?._id;

      // Đảm bảo client đã join socket room của conversation này
      if (conversation?._id) {
        socket.emit("join-conversation", conversation._id);
      }

      const lastMessage = {
        _id: message?._id || conversation?.lastMessage?._id,
        content: message?.content || conversation?.lastMessage?.content,
        createdAt: message?.createdAt || conversation?.lastMessage?.createdAt,
        sender: {
          _id: message?.senderId || conversation?.lastMessage?.senderId,
          displayName: "",
          avatarUrl: null,
        },
      };

      const updatedConversation = {
        ...conversation,
        lastMessage,
        unreadCounts: unreadCounts ?? conversation?.unreadCounts,
      };

      // Tự động thêm hoặc cập nhật hộp chat vào sidebar danh sách cuộc trò chuyện
      useChatStore.getState().upsertConversation(updatedConversation);

      // Nếu chính mình gửi thì bỏ qua vì đã thêm qua HTTP response
      if (message.senderId === currentUserId) {
        return;
      }

      useChatStore.getState().addMessage(message);

      if (
        useChatStore.getState().activeConversationId === message.conversationId
      ) {
        useChatStore.getState().markAsSeen();
      }
    });

    // Cuộc trò chuyện direct mới
    socket.on("new-direct-conversation", ({ conversation, message }) => {
      if (conversation?._id) {
        socket.emit("join-conversation", conversation._id);
      }
      useChatStore.getState().upsertConversation(conversation);
      if (message) {
        const currentUserId = useAuthStore.getState().user?._id;
        if (message.senderId !== currentUserId) {
          useChatStore.getState().addMessage(message);
        }
      }
    });

    // read Message
    socket.on("read-message", ({ conversation, lastMessage }) => {
      const updated = {
        _id: conversation._id,
        lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCounts: conversation.unreadCounts,
        seenBy: conversation.seenBy,
      };
      useChatStore.getState().updateConversaton(updated);
    });

    // new group
    socket.on("new-group", (conversation) => {
      useChatStore.getState().addConvo(conversation);
      socket.emit("join-conversation", conversation._id);
    });

    // Lời mời kết bạn mới
    socket.on("friend-request", ({ request, from }) => {
      // Cập nhật lại danh sách lời mời
      useFriendStore.getState().getAllFriendRequests();

      const senderName = from?.displayName || "Một người dùng";
      const messagePreview = request?.message
        ? `"${request.message}"`
        : "Nhấn vào đây để xem và phản hồi lời mời kết bạn.";

      toast.info(`${senderName} đã gửi lời mời kết bạn!`, {
        description: messagePreview,
        duration: 8000,
        action: {
          label: "Xem lời mời",
          onClick: () => {
            useFriendStore.getState().setIncomingRequestModal({
              open: true,
              request: request,
            });
          },
        },
      });
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
