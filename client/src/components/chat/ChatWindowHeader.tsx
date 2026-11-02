import { useState } from "react";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import { Separator } from "@radix-ui/react-separator";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import GroupChatAvatar from "./GroupChatAvatar";
import GroupSettingsModal from "./GroupSettingsModal";
import { useSocketStore } from "@/stores/useSocketStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";

const ChatWindowHeader = ({ chat }: { chat?: Conversation }) => {
  const { conversations, activeConversationId, setActiveConversation } =
    useChatStore();
  const { user } = useAuthStore();
  const { onlineUsers } = useSocketStore();
  const isMobile = useIsMobile();
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = useState(false);

  let otherUser;

  chat = chat ?? conversations.find((c) => c._id === activeConversationId);
  if (!chat) {
    return (
      <header className='sticky top-0 z-10 flex w-full shrink-0 items-center gap-2 border-b border-border/60 bg-background px-3 sm:px-4 py-2.5 sm:py-3'>
        <SidebarTrigger className='-ml-1 text-foreground' />
        <span className='text-sm font-semibold text-muted-foreground'>
          Moji
        </span>
      </header>
    );
  }

  if (chat.type === "direct") {
    const otherUsers = chat.participants.filter((p) => p._id !== user?._id);
    otherUser = otherUsers.length > 0 ? otherUsers[0] : null;
    if (!user || !otherUser) return null;
  }

  const directUserStatus =
    chat.type === "direct" && otherUser && onlineUsers.includes(otherUser._id)
      ? "online"
      : "offline";

  return (
    <header className='sticky top-0 z-10 flex shrink-0 items-center border-b border-border/60 bg-background/95 backdrop-blur-md px-2.5 sm:px-4 py-2 sm:py-3'>
      <div className='flex w-full items-center gap-1.5 sm:gap-2 min-w-0'>
        {isMobile ? (
          <Button
            variant='ghost'
            size='icon'
            className='size-9 shrink-0 text-foreground -ml-1 mr-0.5 hover:bg-muted/50 cursor-pointer'
            onClick={() => setActiveConversation(null)}
          >
            <ArrowLeft className='size-5' />
            <span className='sr-only'>Quay lại danh sách chat</span>
          </Button>
        ) : (
          <>
            <SidebarTrigger className='-ml-1 text-foreground' />
            <Separator
              orientation='vertical'
              className='mr-2 data-[orientation=vertical]:h-4'
            />
          </>
        )}

        <div
          className={`flex flex-1 items-center gap-2.5 sm:gap-3 min-w-0 py-0.5 ${
            chat.type === "group" ? "cursor-pointer select-none" : ""
          }`}
          onClick={() => {
            if (chat?.type === "group") setIsGroupSettingsOpen(true);
          }}
        >
          <div className='relative shrink-0'>
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
                avatarUrl={chat.group?.avatarUrl}
                name={chat.group?.name}
              />
            )}
          </div>
          <div className='flex flex-col min-w-0 flex-1'>
            <h2 className='font-semibold text-foreground text-sm sm:text-base truncate leading-snug hover:opacity-90'>
              {chat.type === "direct" ? otherUser?.displayName : chat.group?.name}
            </h2>
            <span className='text-xs text-muted-foreground truncate'>
              {chat.type === "direct"
                ? directUserStatus === "online"
                  ? "Đang hoạt động"
                  : "Ngoại tuyến"
                : `${chat.participants.length} thành viên • Bấm để quản lý nhóm`}
            </span>
          </div>
        </div>

        {chat.type === "group" && (
          <>
            <Button
              variant='ghost'
              size='icon'
              className='size-9 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer ml-auto'
              onClick={() => setIsGroupSettingsOpen(true)}
              title='Quản lý nhóm'
            >
              <Users className='size-5' />
              <span className='sr-only'>Quản lý nhóm</span>
            </Button>
            <GroupSettingsModal
              chat={chat}
              open={isGroupSettingsOpen}
              onOpenChange={setIsGroupSettingsOpen}
            />
          </>
        )}
      </div>
    </header>
  );
};

export default ChatWindowHeader;
