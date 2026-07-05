import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { User } from "@/types/user";
import { Heart } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserStore } from "@/stores/useUserStore";
import { useEffect } from "react";

type Props = {
  userInfo: User | null;
};
type EditableField = {
  key: keyof Pick<User, "displayName" | "username" | "email" | "phone">;
  label: string;
  type?: string;
};
const PERSONAL_FIELDS: EditableField[] = [
  { key: "displayName", label: "Tên hiện thị" },
  { key: "username", label: "Tên người dùng" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Số điện thoại" },
];
const userInfoSchema = z.object({
  displayName: z.string(),
  username: z.string(),
  email: z.string().email("Vui lòng nhập đúng địng dạng email"),
  phone: z.string(),
  bio: z.string().optional(),
});
type userInfoValues = z.infer<typeof userInfoSchema>;

const PersonalInfoForm = ({ userInfo }: Props) => {
  const { updateInfo } = useUserStore();
  const { register, handleSubmit, reset } = useForm<userInfoValues>({
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

  const onSubmit = async (data: userInfoValues) => {
    await updateInfo(data);
  };
  if (!userInfo) return null;
  return (
    <Card className='glass-strong border-border/30'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Heart className='size-5 text-primary' />
          Thông tin cá nhân
        </CardTitle>
        <CardDescription>
          Cập nhật chi tiết cá nhân và thông tin hồ sơ của bạn
        </CardDescription>
        <CardContent className='space-y-4'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {PERSONAL_FIELDS.map(({ key, label, type }) => (
                <div key={key} className='space-y-2'>
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    type={type ?? "text"}
                    className='glass-light border-border/30'
                    {...register(key)}
                  />
                </div>
              ))}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='bio'>Giới thiệu</Label>
              <Textarea
                id='bio'
                rows={3}
                className='glass-light border-border/30 resize-none'
                {...register("bio")}
              />
            </div>
            <Button
              type='submit'
              className='w-full md:w-auto bg-gradient-primary hover:opacity-90 transition-opacity mt-2'
            >
              Lưu thay đổi
            </Button>
          </form>
        </CardContent>
      </CardHeader>
    </Card>
  );
};

export default PersonalInfoForm;
