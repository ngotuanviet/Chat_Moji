import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/useAuthStore";

const signinSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});
type SignInFormValues = z.infer<typeof signinSchema>;

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signinSchema),
  });
  const { signIn } = useAuthStore();
  const navigate = useNavigate();
  const onSubmit = async (data: SignInFormValues) => {
    const { username, password } = data;
    await signIn(username, password);
    navigate("/");
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className='overflow-hidden p-0 border-border/60 shadow-xl'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          <form className='p-6 md:p-8' onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col items-center gap-2 text-center'>
                <div className='mx-auto block w-fit text-center'>
                  <img src='/logo.svg' alt='Logo Moji' className='size-12' />
                </div>
                <h1 className='text-2xl font-bold'>Chào mừng quay lại</h1>
                <p className='text-muted-foreground text-sm text-balance'>
                  Đăng nhập để tiếp tục trò chuyện cùng bạn bè.
                </p>
              </div>

              <div className='flex flex-col gap-2'>
                <Label htmlFor='username'>Tên đăng nhập</Label>
                <Input
                  id='username'
                  type='text'
                  placeholder='Nhập tên đăng nhập'
                  {...register("username")}
                />
                {errors.username && (
                  <p className='text-xs text-destructive'>
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className='flex flex-col gap-2'>
                <Label htmlFor='password'>Mật khẩu</Label>
                <Input
                  id='password'
                  type='password'
                  placeholder='Nhập mật khẩu'
                  {...register("password")}
                />
                {errors.password && (
                  <p className='text-xs text-destructive'>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button type='submit' disabled={isSubmitting} className='w-full'>
                {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
              </Button>

              <div className='text-center text-sm'>
                Chưa có tài khoản?{" "}
                <Link to='/signup' className='text-primary font-medium hover:underline'>
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          </form>
          <div className='bg-muted/40 relative hidden md:block'>
            <img
              src='/placeholder.png'
              alt='Illustration'
              className='absolute inset-0 size-full object-cover'
            />
          </div>
        </CardContent>
      </Card>
      <div className='text-xs text-balance px-6 text-center *:[a]:hover:text-primary text-muted-foreground *:[a]:underline *:[a]:underline-offset-4'>
        Bằng cách tiếp tục, bạn đồng ý với <a href='#'>Điều khoản dịch vụ</a> và{" "}
        <a href='#'>Chính sách bảo mật</a> của chúng tôi.
      </div>
    </div>
  );
}
