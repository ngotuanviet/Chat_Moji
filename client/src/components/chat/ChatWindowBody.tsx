import { useChatStore } from "@/stores/useChatStore";
import ChatWelComeScreen from "./ChatWelComeScreen";
import MessageItem from "./MessageItem";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
const ChatWindowBody = () => {
  const {
    activeConversationId,
    conversations,
    messages: allMessages,
    fetchMessages,
  } = useChatStore();
  const [lastMessageStatus, setLastMessageStatus] = useState<
    "delivered" | "seen"
  >("delivered");
  const messages = allMessages[activeConversationId!]?.items ?? [];
  const hasMore = allMessages[activeConversationId!]?.hasMore ?? false;
  const reversedMessages = [...messages].reverse();
  const key = `chat-scroll-${activeConversationId}`;
  const selectedConvo = conversations.find(
    (c) => c._id === activeConversationId,
  );
  // ref
  const messageEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const lastMessage = selectedConvo?.lastMessage;
    if (!lastMessage) {
      return;
    }
    const seenBy = selectedConvo?.seenBy ?? [];
    setLastMessageStatus(seenBy.length > 0 ? "seen" : "delivered");
  }, [selectedConvo]);
  const fetchMoreMessages = async () => {
    if (!activeConversationId) {
      return;
    }
    try {
      await fetchMessages(activeConversationId);
    } catch (error) {
      console.error("Lỗi xẩy ra khi fetch thêm tin nhắn", error);
    }
  };
  // Kéo xuống dưới khi load convo
  useLayoutEffect(() => {
    if (!messageEndRef.current) {
      return;
    }
    messageEndRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [activeConversationId]);
  if (!selectedConvo) {
    return <ChatWelComeScreen />;
  }
  const handleScrollSave = () => {
    const container = containerRef.current;
    if (!container || !activeConversationId) return;

    sessionStorage.setItem(
      key,
      JSON.stringify({
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight,
      }),
    );
  };
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const item = sessionStorage.getItem(key);
    if (item) {
      const { scrollTop } = JSON.parse(item);
      requestAnimationFrame(() => {
        container.scrollTop = scrollTop;
      });
    }
  }, [messages.length]);
  if (!messages?.length) {
    return (
      <div className='flex h-full items-center justify-center text-muted-foreground'>
        {"Chưa có cuộc trò chuyện nào"}
      </div>
    );
  }

  return (
    <div className='flex h-full w-full min-h-0 flex-col overflow-hidden bg-primary-foreground p-4'>
      <div
        id='scrollablediv'
        ref={containerRef}
        onScroll={handleScrollSave}
        className='beautiful-scrollbar flex flex-1 flex-col-reverse  space-y-4 overflow-x-hidden overflow-y-auto'
      >
        <div ref={messageEndRef}></div>
        <InfiniteScroll
          dataLength={messages.length}
          next={fetchMoreMessages}
          hasMore={hasMore}
          scrollableTarget='scrollablediv'
          loader={<p>Đang tải...</p>}
          inverse={true}
          style={{
            display: "flex",
            flexDirection: "column-reverse",
            overflow: "visible",
          }}
        >
          {reversedMessages.map((message, i) => (
            <MessageItem
              key={message._id || i}
              message={message}
              index={i}
              messages={reversedMessages}
              selectedConvo={selectedConvo}
              lastMessageStatus={lastMessageStatus}
            />
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default ChatWindowBody;
