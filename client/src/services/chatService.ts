import type { Conversation, ConversationResponse, Message } from "@/types/chat";
import api from "@/lib/axios";

interface FetchMessageProps {
  messages: Message[];
  cursor?: string;
}

const normalizeConversation = (
  conversation: any
): Conversation => {
  const participants = (conversation.participants || []).map((p: any) => {
    if (p.userId && typeof p.userId === "object") {
      return {
        _id: p.userId._id,
        displayName: p.userId.displayName,
        avatarUrl: p.userId.avatarUrl ?? null,
        joinedAt: p.joinedAt,
      };
    }
    return p;
  });

  return {
    ...conversation,
    participants,
    unreadCounts: conversation.unreadCounts ?? conversation.unreadCount ?? {},
  };
};

const pageLimit = 50;
export const chatService = {
  async fetchConversations(): Promise<Conversation[]> {
    const res = await api.get<Conversation[] | ConversationResponse>(
      "/conversations",
    );

    if (Array.isArray(res.data)) {
      return res.data.map(normalizeConversation);
    }

    return Array.isArray(res.data?.conversations)
      ? res.data.conversations.map(normalizeConversation)
      : [];
  },
  async fetchMessages(
    id?: string,
    cursor?: string,
  ): Promise<FetchMessageProps> {
    const res = await api.get(
      `/conversations/${id}/messages?limit=${pageLimit}&cursor=${cursor}`,
    );
    return {
      messages: res.data.messages,
      cursor: res.data.nextCursor,
    };
  },
  async sendDirectMessage(
    recipientId: string,
    content: string = "",
    imgUrl?: string,
    conversationId?: string,
  ) {
    const res = await api.post("/messages/direct", {
      recipientId,
      content,
      imgUrl,
      conversationId,
    });
    return res.data.message;
  },
  async sendGroupMessage(
    conversationId: string,
    content: string = "",
    imgUrl?: string,
  ) {
    const res = await api.post("/messages/group", {
      conversationId,
      content,
      imgUrl,
    });
    return res.data.message;
  },
  async markAsSeen(conversationId: string) {
    const res = await api.patch(`/conversations/${conversationId}/seen`);
    return res.data;
  },
  async createConversation(
    type: "direct" | "group",
    name: string,
    memberIds: string[],
  ) {
    const res = await api.post<{ conversation: any }>("/conversations", {
      type,
      name,
      memberIds,
    });
    return normalizeConversation(res.data.conversation);
  },
};
