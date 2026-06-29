import { persist } from "zustand/middleware";
import { create } from "zustand";
import type { ChatState } from "@/types/store";
import { chatService } from "@/services/chatService";

import { useAuthStore } from "./useAuthStore";
import { PawPrint } from "lucide-react";
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null,
      convoLoading: false,
      messageLoading: false,
      setActiveConversation: (id) => set({ activeConversationId: id }),
      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          convoLoading: false,
          messageLoading: false,
        });
      },
      fetchConversations: async () => {
        try {
          set({ convoLoading: true });
          const conversations = await chatService.fetchConversations();
          set({ conversations, convoLoading: false });
        } catch (error) {
          console.error("Lỗi xảy ra khi fetchConversations:", error);
          set({ convoLoading: false });
        }
      },
      fetchMessages: async (conversationId) => {
        const { activeConversationId, messages } = get();
        const { user } = useAuthStore.getState();
        const convoId = conversationId || activeConversationId;
        if (!convoId) return;
        const current = messages?.[convoId];
        const nextCursor =
          current?.nextCursor === undefined ? "" : current?.nextCursor;
        if (nextCursor === null) return; // đã hết trang
        set({ messageLoading: true });
        try {
          const { messages: fetched, cursor } = await chatService.fetchMessages(
            convoId,
            nextCursor,
          );
          const processed = fetched.map((m) => ({
            ...m,
            isOwn: m.senderId === user?._id,
          }));
          set((state) => {
            const prev = state.messages[convoId]?.items ?? [];
            const merged =
              prev.length > 0 ? [...processed, ...prev] : processed; // nếu đã có tin nhắn thì ghép, nếu chưa thì dùng luôn
            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: merged,
                  hasMore: !!cursor,
                  nextCursor: cursor || undefined,
                },
              },
            };
          });
        } catch (error) {
          console.error("Lỗi xảy ra khi fetchMessages:", error);
        } finally {
          set({ messageLoading: false });
        }
      },
      sendDirectMessage: async (recipientId, content, imgUrl) => {
        try {
          const { activeConversationId } = get();
          const sentMessage = await chatService.sendDirectMessage(
            recipientId,
            content,
            imgUrl,
            activeConversationId || undefined,
          );
          set((state) => {
            const conversations = state.conversations.map((c) =>
              c._id === activeConversationId ? { ...c, seenBy: [] } : c,
            );
            const messages = { ...state.messages };
            const convoId = activeConversationId || sentMessage.conversationId;
            if (convoId) {
              const currentMessages = messages[convoId]?.items || [];
              messages[convoId] = {
                ...messages[convoId],
                items: [...currentMessages, { ...sentMessage, isOwn: true }],
              };
            }
            return { conversations, messages };
          });
        } catch (error) {
          console.error("Lỗi xảy ra khi gửi directMessage: " + error);
        }
      },
      sendGroupMessage: async (conversationId, content, imgUrl) => {
        try {
          const sentMessage = await chatService.sendGroupMessage(
            conversationId,
            content,
            imgUrl,
          );
          set((state) => {
            const conversations = state.conversations.map((c) =>
              c._id === get().activeConversationId ? { ...c, seenBy: [] } : c,
            );
            const messages = { ...state.messages };
            if (conversationId) {
              const currentMessages = messages[conversationId]?.items || [];
              messages[conversationId] = {
                ...messages[conversationId],
                items: [...currentMessages, { ...sentMessage, isOwn: true }],
              };
            }
            return { conversations, messages };
          });
        } catch (error) {
          console.error("Lỗi xảy ra gửi group Message: " + error);
        }
      },
      addMessage: async (message) => {
        try {
          const { user } = useAuthStore.getState();
          const { fetchMessages } = get();
          message.isOwn = message.senderId === user?._id;
          const convoId = message.conversationId;

          if (!get().messages[convoId]?.items?.length) {
            await fetchMessages(convoId);
          }

          set((state) => {
            const currentItems = state.messages[convoId]?.items ?? [];
            if (currentItems.some((m) => m._id === message._id)) {
              return state;
            }
            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: [...currentItems, message],
                  hasMore: state.messages[convoId]?.hasMore ?? false,
                  nextCursor: state.messages[convoId]?.nextCursor,
                },
              },
            };
          });
        } catch (error) {
          console.error("Lỗi xảy ra khi add message: ", error);
        }
      },
      updateConversaton: (conversation) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === conversation._id ? { ...c, ...conversation } : c,
          ),
        }));
      },
      markAsSeen: async () => {
        try {
          const { user } = useAuthStore.getState();
          const { activeConversationId, conversations } = get();
          if (!activeConversationId || !user) {
            return;
          }
          const convo = conversations.find(
            (c) => c._id === activeConversationId,
          );
          if (!convo) {
            return;
          }
          if ((convo.unreadCounts?.[user._id] ?? 0) === 0) {
            return;
          }
          await chatService.markAsSeen(activeConversationId);
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId && c.lastMessage
                ? {
                    ...c,
                    unreadCounts: {
                      ...c.unreadCounts,
                      [user._id]: 0,
                    },
                  }
                : c,
            ),
          }));
        } catch (error) {
          console.error("Lỗi xảy ra khi gọi markAsSeen trong store", error);
        }
      },
    }),

    {
      name: "chat-storage",
      partialize: (state) => ({ conversations: state.conversations }),
    },
  ),
);
