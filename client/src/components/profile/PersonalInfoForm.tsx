import { Button } from "@/components/ui/button";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { User } from "@/types/user";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserStore } from "@/stores/useUserStore";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

type Props = {
  userInfo: User | null;
};

const userInfoSchema = z.object({
  displayName: z.string().min(1, "Vui lòng nhập tên hiển thị"),
  username: z.string().min(1, "Vui lòng nhập tên người dùng"),
  email: z.string().email("Vui lòng nhập đúng định dạng email"),
  phone: z.string().optional(),
  bio: z.string().optional(),
});
type UserInfoValues = z.infer<typeof userInfoSchema>;

const PersonalInfoForm = ({ userInfo }: Props) => {
  const { updateInfo } = useUserStore();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UserInfoValues>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      displayName: userInfo?.displayName ?? "",
      username: userInfo?.username ?? "",
      email: userInfo?.email ?? "",
      phone: userInfo?.phone ?? "",
      bio: userInfo?.bio ?? "",
    },
  });

  useEffect(() => {
    if (userInfo) {
      reset({
        displayName: userInfo.displayName ?? "",
        username: userInfo.username ?? "",
        email: userInfo.email ?? "",
        phone: userInfo.phone ?? "",
        bio: userInfo.bio ?? "",
      });
    }
  }, [userInfo, reset]);

  const onSubmit = async (data: UserInfoValues) => {
    try {
      setSubmitting(true);
      await updateInfo(data);
    } catch {
      toast.error("Không thể lưu thông tin");
    } finally {
      setSubmitting(false);
    }
  };

  if (!userInfo) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-1'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
        <div className='space-y-1.5'>
          <Label htmlFor='displayName' className='text-xs font-semibold text-foreground/90'>
            Tên hiển thị <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='displayName'
            placeholder='Họ và tên của bạn'
            className='h-9.5 text-xs sm:text-sm bg-background border-border/80 focus:border-primary'
            {...register("displayName")}
          />
          {errors.displayName && (
            <p className='text-[11px] text-destructive'>{errors.displayName.message}</p>
          )}
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='username' className='text-xs font-semibold text-foreground/90'>
            Tên người dùng <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='username'
            placeholder='username'
            className='h-9.5 text-xs sm:text-sm bg-background border-border/80 focus:border-primary'
            {...register("username")}
          />
          {errors.username && (
            <p className='text-[11px] text-destructive'>{errors.username.message}</p>
          )}
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='email' className='text-xs font-semibold text-foreground/90'>
            Email <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='email'
            type='email'
            placeholder='you@example.com'
            className='h-9.5 text-xs sm:text-sm bg-background border-border/80 focus:border-primary'
            {...register("email")}
          />
          {errors.email && (
            <p className='text-[11px] text-destructive'>{errors.email.message}</p>
          )}
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='phone' className='text-xs font-semibold text-foreground/90'>
            Số điện thoại
          </Label>
          <Input
            id='phone'
            type='tel'
            placeholder='0912 345 678'
            className='h-9.5 text-xs sm:text-sm bg-background border-border/80 focus:border-primary'
            {...register("phone")}
          />
        </div>
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='bio' className='text-xs font-semibold text-foreground/90'>
          Giới thiệu bản thân
        </Label>
        <Textarea
          id='bio'
          rows={2}
          placeholder='Viết vài dòng ngắn giới thiệu về bạn...'
          className='text-xs sm:text-sm bg-background border-border/80 focus:border-primary resize-none'
          {...register("bio")}
        />
      </div>

      <div className='pt-2 flex justify-end'>
        <Button
          type='submit'
          disabled={submitting || !isDirty}
          className='h-9 px-4 text-xs sm:text-sm cursor-pointer'
        >
          {submitting ? (
            <>
              <Loader2 className='size-3.5 animate-spin mr-1.5' />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className='size-3.5 mr-1.5' />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default PersonalInfoForm;
