import { useRef, useState } from "react";
import UserAvatar from "@/components/chat/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSocketStore } from "@/stores/useSocketStore";
import { useUserStore } from "@/stores/useUserStore";
import type { User } from "@/types/user";
import { Camera, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProfileCardProps {
  user: User | null;
}

const ProfileCard = ({ user }: ProfileCardProps) => {
  const { onlineUsers } = useSocketStore();
  const { updateAvatarUrl } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (!user) return null;
  const isOnline = onlineUsers.includes(user._id);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warning("Vui lòng chọn tệp hình ảnh");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.warning("Kích thước ảnh tối đa là 10MB");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      await updateAvatarUrl(formData);
      toast.success("Cập nhật ảnh đại diện thành công!");
    } catch {
      toast.error("Không thể cập nhật ảnh đại diện");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("vi-VN", {
        month: "2-digit",
        year: "numeric",
      })
    : null;

  return (
    <div className='relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-primary/5 p-4 sm:p-5 shadow-xs'>
      {/* Decorative ambient glow */}
      <div className='pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-primary/10 blur-3xl' />

      <div className='relative flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5'>
        {/* Avatar with hover upload overlay */}
        <div className='relative group/avatar shrink-0'>
          <UserAvatar
            type='profile'
            name={user.displayName}
            avatarUrl={user.avatarUrl}
            className='size-18 sm:size-20 ring-2 ring-primary/20 shadow-md text-xl sm:text-2xl'
          />

          <button
            type='button'
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className='absolute inset-0 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 cursor-pointer backdrop-blur-xs'
            title='Nhấp để đổi ảnh đại diện'
          >
            {uploading ? (
              <Loader2 className='size-5 animate-spin' />
            ) : (
              <>
                <Camera className='size-4' />
                <span className='text-[10px] font-medium mt-0.5'>Đổi ảnh</span>
              </>
            )}
          </button>

          {/* Mini camera badge for mobile/accessibility */}
          <Button
            type='button'
            size='icon'
            variant='secondary'
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className='absolute -bottom-1 -right-1 size-6 rounded-full shadow-md sm:hidden border border-border'
          >
            <Camera className='size-3' />
          </Button>

          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileChange}
            accept='image/*'
            className='hidden'
          />
        </div>

        {/* User Details */}
        <div className='flex flex-1 flex-col items-center sm:items-start min-w-0 text-center sm:text-left'>
          <div className='flex flex-wrap items-center justify-center sm:justify-start gap-2'>
            <h2 className='text-lg sm:text-xl font-bold text-foreground truncate'>
              {user.displayName}
            </h2>
            <Badge
              variant='outline'
              className={cn(
                "px-2 py-0.5 text-[11px] font-medium rounded-full flex items-center gap-1.5",
                isOnline
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-muted text-muted-foreground border-border/60",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  isOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground",
                )}
              />
              {isOnline ? "Trực tuyến" : "Ngoại tuyến"}
            </Badge>
          </div>

          <p className='text-xs text-muted-foreground mt-0.5'>
            @{user.username}
          </p>

          <p className='text-xs sm:text-sm text-foreground/80 mt-1.5 line-clamp-2 max-w-lg'>
            {user.bio || "Chưa có lời giới thiệu bản thân."}
          </p>

          {formattedDate && (
            <p className='text-[11px] text-muted-foreground flex items-center gap-1 mt-2'>
              <Calendar className='size-3' />
              <span>Tham gia từ tháng {formattedDate}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
