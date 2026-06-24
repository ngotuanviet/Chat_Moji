import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import { Separator } from "@radix-ui/react-separator";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import GroupChatAvatar from "./GroupChatAvatar";
import { useSocketStore } from "@/stores/useSocketStore";

const ChatWindowHeader = ({ chat }: { chat?: Conversation }) => {
  const { conversations, activeConversationId } = useChatStore();
  const { user } = useAuthStore();
  const { onlineUsers } = useSocketStore();
  let otherUser;

  chat = chat ?? conversations.find((c) => c._id === activeConversationId);
  if (!chat) {
    return (
      <header className='sticky top-0 z-10 flex w-full shrink-0 items-center gap-2 border-b border-border/60 bg-background px-4 py-3 md:hidden'>
        <SidebarTrigger className='-ml-1 text-foreground' />
      </header>
    );
  }

  if (chat.type === "direct") {
    const otherUsers = chat.participants.filter((p) => p._id !== user?._id);
    otherUser = otherUsers.length > 0 ? otherUsers[0] : null;
    if (!user || !otherUser) return;
  }

  const directUserStatus =
    chat.type === "direct" && otherUser && onlineUsers.includes(otherUser._id)
      ? "online"
      : "offline";

  return (
    <header className='sticky top-0 z-10 flex shrink-0 items-center border-b border-border/60 bg-background px-4 py-3'>
      <div className='flex w-full items-center gap-2'>
        <SidebarTrigger className='-ml-1 text-foreground' />
        <Separator
          orientation='vertical'
          className='mr-2 data-[orientation=vertical]:h-4'
        />
        <div className='flex w-full items-center gap-3 p-2'>
          <div className='relative'>
            {chat.type === "direct" ? (
              <>
                <UserAvatar
                  type='sidebar'
                  name={otherUser?.displayName || "moji"}
                  avatarUrl={otherUser?.avatarUrl || undefined}
                />
                <StatusBadge status={directUserStatus} />
              </>
            ) : (
              <GroupChatAvatar
                participants={chat.participants}
                type='sidebar'
              />
            )}
          </div>
          <h2 className='font-semibold text-foreground'>
            {chat.type === "direct" ? otherUser?.displayName : chat.group?.name}
          </h2>
        </div>
      </div>
    </header>
  );
};

export default ChatWindowHeader;
