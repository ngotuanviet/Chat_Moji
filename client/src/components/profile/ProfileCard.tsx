import UserAvatar from "@/components/chat/UserAvatar";
import AvatarUploader from "@/components/profile/AvatarUploader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSocketStore } from "@/stores/useSocketStore";
import type { User } from "@/types/user";

interface ProfileCardProps {
  user: User | null;
}

const ProfileCard = ({ user }: ProfileCardProps) => {
  const { onlineUsers } = useSocketStore();

  if (!user) return null;
  if (!user.bio) {
    user.bio = "Will code for food";
  }

  const isOnline = onlineUsers.includes(user._id);

  return (
    <Card className='overflow-hidden p-0 min-h-48 h-auto sm:h-52 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl'>
      <CardContent className='pt-8 sm:pt-0 sm:mt-20 p-4 sm:p-6 pb-6 sm:pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 text-white'>
        <div className='relative shrink-0'>
          <UserAvatar
            type='profile'
            name={user.displayName}
            avatarUrl={user.avatarUrl || undefined}
            className='ring-4 ring-white shadow-lg size-20 sm:size-24'
          />
          <AvatarUploader />
        </div>
        {/* user Info */}
        <div className='text-center sm:text-left flex-1 min-w-0'>
          <h1 className='text-xl sm:text-2xl font-bold tracking-tight truncate'>
            {user.displayName}
          </h1>
          {user.bio && (
            <p className='text-white/80 text-xs sm:text-sm mt-1 sm:mt-2 max-w-lg line-clamp-2'>
              {user.bio}
            </p>
          )}
        </div>

        <Badge
          className={cn(
            "flex items-center gap-1.5 capitalize shrink-0 self-center sm:self-end px-3 py-1",
            isOnline
              ? "bg-green-100 text-green-700 hover:bg-green-100"
              : "bg-slate-100 text-slate-700 hover:bg-slate-100",
          )}
        >
          <div
            className={cn(
              "size-2 rounded-full",
              isOnline ? "bg-green-500 animate-pulse" : "bg-slate-500",
            )}
          />
          {isOnline ? "Online" : "Offline"}
        </Badge>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
