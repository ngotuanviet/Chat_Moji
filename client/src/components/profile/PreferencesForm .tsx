import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/stores/useAuthStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { useUserStore } from "@/stores/useUserStore";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";

const PreferencesForm = () => {
  const { isDark, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { updatePreferences } = useUserStore();
  const [updating, setUpdating] = useState(false);

  const showOnline = user?.showOnline ?? true;
  const notificationsEnabled = user?.notificationsEnabled ?? true;

  const handleToggleOnline = async (checked: boolean) => {
    try {
      setUpdating(true);
      await updatePreferences({ showOnline: checked });
    } catch {
      // toast already handled in store
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleNotifications = async (checked: boolean) => {
    try {
      setUpdating(true);
      await updatePreferences({ notificationsEnabled: checked });
    } catch {
      // toast already handled in store
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className='space-y-3 pt-1'>
      <div className='flex items-center justify-between p-3 sm:p-3.5 rounded-xl border border-border/70 bg-card/60 transition-colors'>
        <div className='pr-4'>
          <Label htmlFor='theme-toggle' className='text-xs sm:text-sm font-medium cursor-pointer'>
            Chế độ tối
          </Label>
          <p className='text-[11px] sm:text-xs text-muted-foreground mt-0.5'>
            Chuyển đổi giữa giao diện sáng và tối
          </p>
        </div>
        <div className='flex items-center gap-1.5 shrink-0'>
          <Sun className='size-3.5 text-muted-foreground' />
          <Switch
            id='theme-toggle'
            checked={isDark}
            onCheckedChange={toggleTheme}
          />
          <Moon className='size-3.5 text-muted-foreground' />
        </div>
      </div>

      <div className='flex items-center justify-between p-3 sm:p-3.5 rounded-xl border border-border/70 bg-card/60 transition-colors'>
        <div className='pr-4'>
          <Label htmlFor='online-status' className='text-xs sm:text-sm font-medium cursor-pointer'>
            Hiển thị trạng thái trực tuyến
          </Label>
          <p className='text-[11px] sm:text-xs text-muted-foreground mt-0.5'>
            Cho phép bạn bè thấy khi bạn đang hoạt động
          </p>
        </div>
        <Switch
          id='online-status'
          disabled={updating}
          checked={showOnline}
          onCheckedChange={handleToggleOnline}
        />
      </div>

      <div className='flex items-center justify-between p-3 sm:p-3.5 rounded-xl border border-border/70 bg-card/60 transition-colors'>
        <div className='pr-4'>
          <Label htmlFor='notification-status' className='text-xs sm:text-sm font-medium cursor-pointer'>
            Thông báo ứng dụng
          </Label>
          <p className='text-[11px] sm:text-xs text-muted-foreground mt-0.5'>
            Nhận thông báo khi có tin nhắn hoặc lời mời kết bạn mới
          </p>
        </div>
        <Switch
          id='notification-status'
          disabled={updating}
          checked={notificationsEnabled}
          onCheckedChange={handleToggleNotifications}
        />
      </div>
    </div>
  );
};

export default PreferencesForm;
