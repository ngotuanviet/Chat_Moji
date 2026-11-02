import type { Conversation, Message, Participant } from "@/types/chat";
import api from "@/lib/axios";

interface FetchMessageProps {
  messages: Message[];
  cursor?: string;
}

interface RawParticipant {
  userId?: {
    _id: string;
    displayName: string;
    avatarUrl?: string | null;
  } | string;
  _id?: string;
  displayName?: string;
  avatarUrl?: string | null;
  joinedAt: string;
}

interface RawConversation extends Omit<Conversation, "participants"> {
  participants?: (RawParticipant | Participant)[];
  unreadCount?: Record<string, number>;
}

const normalizeConversation = (
  conversation: RawConversation
): Conversation => {
  const participants: Participant[] = (conversation.participants || []).map((p) => {
    if ("userId" in p && p.userId && typeof p.userId === "object") {
      return {
        _id: p.userId._id,
        displayName: p.userId.displayName,
        avatarUrl: p.userId.avatarUrl ?? null,
        joinedAt: p.joinedAt,
      };
    }
    const rawP = p as { _id?: string; displayName?: string; avatarUrl?: string | null; joinedAt: string };
    return {
      _id: rawP._id || "",
      displayName: rawP.displayName || "",
      avatarUrl: rawP.avatarUrl ?? null,
      joinedAt: rawP.joinedAt,
    };
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
    const res = await api.get<RawConversation[] | { conversations: RawConversation[] }>(
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
    image?: File,
    conversationId?: string,
  ) {
    const data = new FormData();
    data.append("recipientId", recipientId);
    data.append("content", content);
    if (conversationId) data.append("conversationId", conversationId);
    if (image) data.append("image", image);
    const res = await api.post("/messages/direct", data);
    return res.data.message;
  },
  async sendGroupMessage(
    conversationId: string,
    content: string = "",
    image?: File,
  ) {
    const data = new FormData();
    data.append("conversationId", conversationId);
    data.append("content", content);
    if (image) data.append("image", image);
    const res = await api.post("/messages/group", data);
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
    const res = await api.post<{ conversation: RawConversation }>("/conversations", {
      type,
      name,
      memberIds,
    });
    return normalizeConversation(res.data.conversation);
  },
  async updateGroup(conversationId: string, name?: string, image?: File) {
    const data = new FormData();
    if (name !== undefined) data.append("name", name);
    if (image) data.append("image", image);
    const res = await api.patch<{ conversation: RawConversation }>(
      `/conversations/${conversationId}/group`,
      data,
    );
    return normalizeConversation(res.data.conversation);
  },
  async addGroupParticipants(conversationId: string, memberIds: string[]) {
    const res = await api.post<{ conversation: RawConversation }>(
      `/conversations/${conversationId}/participants`,
      { memberIds },
    );
    return normalizeConversation(res.data.conversation);
  },
  async removeGroupParticipant(conversationId: string, userId: string) {
    const res = await api.delete(`/conversations/${conversationId}/participants/${userId}`);
    return res.status === 204 ? null : normalizeConversation(res.data.conversation);
  },
};
