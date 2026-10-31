import { cn } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import { formatMessageTime } from "../../lib/utils";
import { Badge } from "../ui/badge";

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  selectedConvo: Conversation;
  lastMessageStatus: "delivered" | "seen";
}

const MessageItem = ({
  message,
  index,
  messages,
  selectedConvo,
  lastMessageStatus,
}: MessageItemProps) => {
  const prev = index + 1 < messages.length ? messages[index + 1] : undefined;
  const isShowTime =
    index === 0 ||
    new Date(message.createdAt || 0).getTime() -
      new Date(prev?.createdAt || 0).getTime() >
      300000; // 5p
  const isGroupBreak = isShowTime || message.senderId !== prev?.senderId;

  const participant = selectedConvo.participants.find(
    (p: Participant) => p._id.toString() === message.senderId.toString(),
  );

  return (
    <>
      {/* time */}
      {isShowTime && (
        <span className='text-xs text-center text-muted-foreground px-1 py-1'>
          {formatMessageTime(new Date(message.createdAt))}
        </span>
      )}
      <div
        className={cn(
          "flex gap-2 message-bounce mt-1",
          message.isOwn ? "justify-end" : "justify-start",
        )}
      >
        {/* avatar */}
        {!message.isOwn && (
          <div className='w-8 shrink-0'>
            {isGroupBreak && (
              <UserAvatar
                type='chat'
                name={participant?.displayName ?? "Moji"}
                avatarUrl={participant?.avatarUrl ?? undefined}
              />
            )}
          </div>
        )}
        {/* tin nhắn */}
        <div
          className={cn(
            "max-w-[85%] sm:max-w-[78%] md:max-w-[70%] lg:max-w-md space-y-1 flex flex-col",
            message.isOwn ? "items-end" : "items-start",
          )}
        >
          <Card
            className={cn(
              "p-2.5 sm:p-3 rounded-2xl",
              message.isOwn
                ? "chat-bubble-sent border-0 rounded-br-xs"
                : "bg-chat-bubble-received rounded-bl-xs",
            )}
          >
            <p className='text-sm sm:text-base leading-relaxed break-words'>
              {message.content}
            </p>
          </Card>

          {/* seen / delivered */}
          {message.isOwn && message._id === selectedConvo.lastMessage?._id && (
            <Badge
              variant='outline'
              className={cn(
                "text-[10px] sm:text-xs px-1.5 py-0.5 h-4 border-0",
                lastMessageStatus === "seen"
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {lastMessageStatus}
            </Badge>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageItem;
