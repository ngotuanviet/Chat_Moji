import { persist } from "zustand/middleware";
import { create } from "zustand";
import type { ChatState } from "@/types/store";
import type { Conversation } from "@/types/chat";
import { chatService } from "@/services/chatService";

import { useAuthStore } from "./useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null,
      convoLoading: false,
      messageLoading: false,
      loading: false,
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
        if (current?.items.length && !current.hasMore) return;
        const nextCursor = current?.nextCursor || undefined;
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
                  hasMore: Boolean(cursor),
                  nextCursor: cursor ?? null,
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
      sendDirectMessage: async (recipientId, content, image) => {
        try {
          const { activeConversationId } = get();
          const sentMessage = await chatService.sendDirectMessage(
            recipientId,
            content,
            image,
            activeConversationId || undefined,
          );
          const convoId = activeConversationId || sentMessage.conversationId;
          if (!activeConversationId && sentMessage.conversationId) {
            set({ activeConversationId: sentMessage.conversationId });
          }
          set((state) => {
            const safeConversations = Array.isArray(state.conversations)
              ? state.conversations
              : [];
            const conversations = safeConversations.map((c) =>
              c._id === convoId ? { ...c, seenBy: [] } : c,
            );
            const messages = { ...state.messages };
            if (convoId) {
              const currentMessages = messages[convoId]?.items || [];
              if (currentMessages.some((m) => m._id === sentMessage._id)) {
                return { conversations };
              }
              messages[convoId] = {
                ...messages[convoId],
                items: [...currentMessages, { ...sentMessage, isOwn: true }],
              };
            }
            return { conversations, messages };
          });
        } catch (error) {
          console.error("Lỗi xảy ra khi gửi directMessage: " + error);
          throw error;
        }
      },
      sendGroupMessage: async (conversationId, content, image) => {
        try {
          const sentMessage = await chatService.sendGroupMessage(
            conversationId,
            content,
            image,
          );
          set((state) => {
            const safeConversations = Array.isArray(state.conversations)
              ? state.conversations
              : [];
            const conversations = safeConversations.map((c) =>
              c._id === get().activeConversationId ? { ...c, seenBy: [] } : c,
            );
            const messages = { ...state.messages };
            if (conversationId) {
              const currentMessages = messages[conversationId]?.items || [];
              if (currentMessages.some((m) => m._id === sentMessage._id)) {
                return { conversations };
              }
              messages[conversationId] = {
                ...messages[conversationId],
                items: [...currentMessages, { ...sentMessage, isOwn: true }],
              };
            }
            return { conversations, messages };
          });
        } catch (error) {
          console.error("Lỗi xảy ra gửi group Message: " + error);
          throw error;
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
                  nextCursor: state.messages[convoId]?.nextCursor ?? null,
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
          conversations: (Array.isArray(state.conversations)
            ? state.conversations
            : []
          ).map((c) =>
            c._id === conversation._id
              ? { ...c, ...conversation }
              : c,
          ),
        }));
      },
      upsertConversation: (convo) => {
        set((state) => {
          const safeConversations = Array.isArray(state.conversations)
            ? state.conversations
            : [];
          const existingIndex = safeConversations.findIndex(
            (c) => c._id === convo._id,
          );
          let updatedConversations: Conversation[];
          if (existingIndex > -1) {
            const existing = safeConversations[existingIndex];
            const merged: Conversation = { ...existing, ...convo };
            updatedConversations = [
              merged,
              ...safeConversations.filter((c) => c._id !== convo._id),
            ];
          } else {
            updatedConversations = [convo, ...safeConversations];
          }
          return { conversations: updatedConversations };
        });
      },
      removeConversation: (conversationId) => {
        set((state) => {
          const remainingMessages = { ...state.messages };
          delete remainingMessages[conversationId];
          return {
            conversations: state.conversations.filter((conversation) => conversation._id !== conversationId),
            messages: remainingMessages,
            activeConversationId:
              state.activeConversationId === conversationId
                ? null
                : state.activeConversationId,
          };
        });
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
      addConvo: async (convo) => {
        set((state) => {
          const safeConversations = Array.isArray(state.conversations)
            ? state.conversations
            : [];
          const exits = safeConversations.some((c) => c._id === convo._id);
          return {
            conversations: exits
              ? safeConversations
              : [convo, ...safeConversations],
            activeConversationId: convo._id,
          };
        });
      },
      createConversation: async (type, name, memberIds) => {
        try {
          set({ loading: true });
          const conversation = await chatService.createConversation(
            type,
            name,
            memberIds,
          );
          get().addConvo(conversation);
          useSocketStore
            .getState()
            .socket?.emit("join-conversation", conversation._id);
        } catch (error) {
          console.error(
            "Lỗi xảy ra khi gọi createConversation trong store",
            error,
          );
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      updateGroup: async (conversationId, name, image) => {
        try {
          const conversation = await chatService.updateGroup(conversationId, name, image);
          get().upsertConversation(conversation);
        } catch (error) {
          console.error("Lỗi khi cập nhật nhóm", error);
          throw error;
        }
      },
      addGroupParticipants: async (conversationId, memberIds) => {
        try {
          const conversation = await chatService.addGroupParticipants(conversationId, memberIds);
          get().upsertConversation(conversation);
        } catch (error) {
          console.error("Lỗi khi thêm thành viên nhóm", error);
          throw error;
        }
      },
      removeGroupParticipant: async (conversationId, userId) => {
        try {
          const currentUserId = useAuthStore.getState().user?._id;
          const conversation = await chatService.removeGroupParticipant(conversationId, userId);
          if (userId === currentUserId || !conversation) {
            get().removeConversation(conversationId);
          } else {
            get().upsertConversation(conversation);
          }
        } catch (error) {
          console.error("Lỗi khi rời/xoá thành viên nhóm", error);
          throw error;
        }
      },
    }),

    {
      name: "chat-storage",
      partialize: (state) => ({ conversations: state.conversations }),
    },
  ),
);
