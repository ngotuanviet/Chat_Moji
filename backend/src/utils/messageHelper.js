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
      imgUrl: message.imgUrl || null,
      senderId,
      createdAt: message.createdAt,
    },
  });

  conversation.participants.forEach((participant) => {
    const memberId = participant.userId.toString();
    const isSender = memberId === senderId.toString();
    const prevCount = conversation.unreadCounts.get(memberId) || 0;
    conversation.unreadCounts.set(memberId, isSender ? 0 : prevCount + 1);
  });
};

export const emitNewMessage = async (io, conversation, message) => {
  try {
    // Đảm bảo tất cả participants đã join conversation room trong socket
    conversation.participants.forEach((p) => {
      const pId = (p.userId?._id || p.userId || p).toString();
      try {
        io.in(pId).socketsJoin(conversation._id.toString());
      } catch (err) {
        console.error("socketsJoin error:", err);
      }
    });

    // Populate conversation để có đầy đủ thông tin cho client
    await conversation.populate([
      { path: "participants.userId", select: "displayName avatarUrl username" },
      { path: "seenBy", select: "displayName avatarUrl" },
      { path: "lastMessage.senderId", select: "displayName avatarUrl" },
    ]);

    const convoObj = conversation.toObject ? conversation.toObject() : conversation;
    const participants = (convoObj.participants || []).map((p) => {
      const userObj = p.userId && typeof p.userId === "object" ? p.userId : null;
      return {
        _id: userObj?._id || p.userId || p._id,
        displayName: userObj?.displayName || p.displayName || "",
        avatarUrl: userObj?.avatarUrl ?? p.avatarUrl ?? null,
        username: userObj?.username,
        joinedAt: p.joinedAt,
      };
    });

    const unreadCounts =
      convoObj.unreadCounts instanceof Map
        ? Object.fromEntries(convoObj.unreadCounts)
        : convoObj.unreadCounts && typeof convoObj.unreadCounts === "object"
          ? convoObj.unreadCounts
          : {};

    const lastMessage = convoObj.lastMessage
      ? {
          ...convoObj.lastMessage,
          sender: convoObj.lastMessage.senderId
            ? {
                _id: convoObj.lastMessage.senderId._id || convoObj.lastMessage.senderId,
                displayName: convoObj.lastMessage.senderId.displayName || "",
                avatarUrl: convoObj.lastMessage.senderId.avatarUrl ?? null,
              }
            : null,
        }
      : null;

    const formattedConvo = {
      ...convoObj,
      _id: convoObj._id.toString(),
      type: convoObj.type,
      lastMessage,
      lastMessageAt: convoObj.lastMessageAt,
      unreadCounts,
      participants,
    };

    // Broadcast tới conversation room và cả các participant room (Socket.IO tự khử trùng lặp socket)
    let broadcast = io.to(conversation._id.toString());
    conversation.participants.forEach((p) => {
      const pId = (p.userId?._id || p.userId || p).toString();
      broadcast = broadcast.to(pId);
    });

    broadcast.emit("new-message", {
      message,
      conversation: formattedConvo,
      unreadCounts: formattedConvo.unreadCounts,
    });
  } catch (error) {
    console.error("Lỗi khi emitNewMessage: ", error);
  }
};
