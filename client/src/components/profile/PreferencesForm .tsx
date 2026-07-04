import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useThemeStore } from "@/stores/useThemeStore";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";

const PreferencesForm = () => {
  const { isDark, toggleTheme } = useThemeStore();
  const [onlineStatus, setOnlineStatus] = useState();

  return (
    <Card className='glass-strong border-border/30'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Sun className='h-5 w-5 text-primary' />
          Tuỳ chỉnh ứng dụng
        </CardTitle>
        <CardDescription>
          Cá nhân hoá trải nghiệm trò chuyện của bạn
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-2'>
        <div className='flex items-center justify-between'>
          <div>
            <Label htmlFor='theme-toggle' className='text-base font-medium'>
              Chế độ tối
            </Label>
            <p className='text-sm text-muted-foreground'>
              Chuyển đổi giữa giao diện sáng và tối
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Sun className='h-4 w-4 text-muted-foreground' />
            <Switch
              id='theme-toggle'
              checked={isDark}
              onCheckedChange={toggleTheme}
              className='data-[state=checked]:bg-primary-glow'
            />
            <Moon className='h-4 w-4 text-muted-foreground' />
          </div>
        </div>
        <div className='flex items-center justify-between'>
          <div>
            <Label htmlFor='online-status' className='text-base font-medium'>
              Hiện thị trạng thái online
            </Label>
            <p className='text-sm text-muted-foreground'>
              Cho phép người khác thấy khi bạn đang online
            </p>
          </div>
          <Switch
            id='online-status'
            checked={onlineStatus}
            onCheckedChange={setOnlineStatus}
            className='data-[state=checked]:bg-primary-glow'
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferencesForm;
