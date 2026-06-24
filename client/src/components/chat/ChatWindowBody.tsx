import { useChatStore } from "@/stores/useChatStore";
import ChatWelComeScreen from "./ChatWelComeScreen";
import MessageItem from "./MessageItem";

const ChatWindowBody = () => {
  const {
    activeConversationId,
    conversations,
    messages: allMessages,
  } = useChatStore();
  const messages = allMessages[activeConversationId!]?.items ?? [];
  const selectedConvo = conversations.find(
    (c) => c._id === activeConversationId,
  );

  if (!selectedConvo) {
    return <ChatWelComeScreen />;
  }

  if (!messages?.length) {
    return (
      <div className='flex h-full items-center justify-center text-muted-foreground'>
        {"Ch\u01b0a c\u00f3 tin nh\u1eafn n\u00e0o trong cu\u1ed9c tr\u00f2 chuy\u1ec7n"}
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
            lastMessageStatus='delivered'
          />
        ))}
      </div>
    </div>
  );
};

export default ChatWindowBody;
