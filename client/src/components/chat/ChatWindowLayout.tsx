import { useChatStore } from "@/stores/useChatStore";
import ChatWelComeScreen from "./ChatWelComeScreen";
import ChatWindowSkeleton from "./ChatWindowSkeleton";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowBody from "./ChatWindowBody";
import MessageInput from "./MessageInput";

const ChatWindowLayout = () => {
  const {
    activeConversationId,
    conversations,
    messageLoading: loading,
  } = useChatStore();
  const safeConversations = Array.isArray(conversations) ? conversations : [];

  const selectedConvo =
    safeConversations.find((c) => c._id === activeConversationId) ?? null;

  if (!selectedConvo) {
    return <ChatWelComeScreen />;
  }
  if (loading) {
    return <ChatWindowSkeleton />;
  }
  return (
    <div className='grid h-full min-h-0 w-full min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-xl border border-border/60 bg-background shadow-md'>
      <ChatWindowHeader chat={selectedConvo} />
      <div className='min-h-0 overflow-hidden bg-primary-foreground'>
        <ChatWindowBody />
      </div>
      <MessageInput selectedConvo={selectedConvo} />
    </div>
  );
};

export default ChatWindowLayout;
