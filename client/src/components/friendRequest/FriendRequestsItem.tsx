import UserAvatar from "@/components/chat/UserAvatar";
import type { FriendRequest } from "@/types/user";
import type { ReactNode } from "react";

interface RequestItemProps {
  requestInfo: FriendRequest;
  actions: ReactNode;
  type: "sent" | "received";
}

const FriendRequestsItem = ({
  requestInfo,
  actions,
  type,
}: RequestItemProps) => {
  if (!requestInfo) return null;
  const info = type === "sent" ? requestInfo.to : requestInfo.from;
  if (!info) return null;

  return (
    <div className='flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/60 p-3 shadow-xs'>
      <div className='flex items-center gap-3 min-w-0'>
        <UserAvatar type='chat' name={info.displayName} avatarUrl={info.avatarUrl} />
        <div className='min-w-0'>
          <p className='font-medium text-sm text-foreground truncate'>{info.displayName}</p>
          <p className='text-xs text-muted-foreground truncate'>@{info.username}</p>
        </div>
      </div>
      <div className='shrink-0'>{actions}</div>
    </div>
  );
};

export default FriendRequestsItem;
