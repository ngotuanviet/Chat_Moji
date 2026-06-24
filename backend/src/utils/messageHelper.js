export const updateConversationAfterCreateMessage = (
  conversation,
  message,
  senderId
) => {
  conversation.set({
    seenBy: [],
    lastMessageAt: message.createdAt,
    lastMessage: {
      _id: message._id,
      content: message.content,
      senderId,
      createdAt: message.createdAt,
    },
  });

  conversation.participants.forEach((participant) => {
    const memberId = participant.userId.toString();
    const isSender = memberId === senderId.toString();
    const prevCount = conversation.unreadCount.get(memberId) || 0;
    conversation.unreadCount.set(memberId, isSender ? 0 : prevCount + 1);
  });
};
export const emitNewMessage = (io, conversation, message) => {
  io.to(conversation._id.toString()).emit("new-message", {
    message,
    conversation: {
      _id: conversation._id,
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt
    },
    unreadCounts: conversation.unreadCounts,
  })
}