import { useChatStore } from "@/stores/useChatStore";
import ChatWelComeScreen from "./ChatWelComeScreen";
import MessageItem from "./MessageItem";
import { useEffect, useState } from "react";

const ChatWindowBody = () => {
  const {
    activeConversationId,
    conversations,
    messages: allMessages,
  } = useChatStore();
  const [lastMessageStatus, setLastMessageStatus] = useState<
    "delivered" | "seen"
  >("delivered");
  const messages = allMessages[activeConversationId!]?.items ?? [];
  const selectedConvo = conversations.find(
    (c) => c._id === activeConversationId,
  );
  useEffect(() => {
    const lastMessage = selectedConvo?.lastMessage;
    if (!lastMessage) {
      return;
    }
    const seenBy = selectedConvo?.seenBy ?? [];
    setLastMessageStatus(seenBy.length > 0 ? "seen" : "delivered");
  }, [selectedConvo]);
  if (!selectedConvo) {
    return <ChatWelComeScreen />;
  }

  if (!messages?.length) {
    return (
      <div className='flex h-full items-center justify-center text-muted-foreground'>
        {"Chưa có cuộc trò chuyện nào"}
      </div>
    );
  }

  return (
    <div className='flex h-full w-full min-h-0 flex-col overflow-hidden bg-primary-foreground p-4'>
      <div className='beautiful-scrollbar flex flex-1 flex-col space-y-4 overflow-x-hidden overflow-y-auto'>
        {messages.map((message, i) => (
          <MessageItem
            key={message._id || i}
            message={message}
            index={i}
            messages={messages}
            selectedConvo={selectedConvo}
            lastMessageStatus={lastMessageStatus}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatWindowBody;
