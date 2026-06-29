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
const signupSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập bắt buộc phải có "),
  password: z.string().min(6, "Mật khẩu bắt buộc phải có và ít nhất 6 ký tự "),
});
type SignInFormValues = z.infer<typeof signupSchema>;
export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signupSchema),
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
      <Card className='overflow-hidden p-0 border-border'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          <form className='p-6 md:p-8' onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col items-center gap-2 text-center'>
                <a href='' className='mx-auto block w-fit text-center'>
                  <img src='public/logo.svg' alt='Logo' />
                </a>
                <h1 className='text-2xl font-bold'>Chào mừng quay lại</h1>
                <p className='text-muted-foreground text-balance'>
                  Chào mừng bạn! Hãy đăng nhập để bắt đầu.
                </p>
              </div>
              <div className='grid grid-cols-2 gap-3'></div>
              <div className='flex flex-col gap-3'>
                <Label htmlFor='username'>Tên đăng nhập</Label>
                <Input
                  id='username'
                  type='text'
                  placeholder='username'
                  {...register("username")}
                />
                {errors.username && (
                  <p className='text-sm text-red-600'>
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div className='flex flex-col gap-3'>
                <Label htmlFor='password'>Mật khẩu</Label>
                <Input
                  id='password'
                  type='password'
                  placeholder='password'
                  {...register("password")}
                />
                {errors.password && (
                  <p className='text-sm text-red-600'>
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button type='submit' disabled={isSubmitting}>
                Đăng nhập
              </Button>
              <div className='text-center text-sm'>
                chưa có tài khoản?{" "}
                <Link to='/signup' className='text-primary hover:underline '>
                  Đăng ký
                </Link>
              </div>
            </div>
          </form>
          <div className='bg-muted relative hidden md:block'>
            <img
              src='public/placeholderSignup.png'
              alt='Image'
              className='absolute top-1/2 -translate-y-1/2 object-cover'
            />
          </div>
        </CardContent>
      </Card>
      <div className='text-xs text-balance px-6 text-center *:[a]:hover:text-primary text-muted-foreground *:[a]:underline *:[a]:underline-offset-4'>
        Bằng cách tiếp tục, bạn đồng ý với <a href='#'>Điều khoản dịch vụ</a> và
        <a href='#'>Chính sách bảo mật</a> của chúng tôi.
      </div>
    </div>
  );
}
