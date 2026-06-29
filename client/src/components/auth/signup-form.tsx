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
  firstname: z.string().min(1, "Tên bắt buộc phải có "),
  lastname: z.string().min(1, "Họ bắt buộc phải có "),
  username: z.string().min(3, "Tên đăng nhập bắt buộc phải có "),
  email: z.email("Email không hợp lệ "),
  password: z.string().min(6, "Mật khẩu bắt buộc phải có và ít nhất 6 ký tự "),
});
type SignUpFormValues = z.infer<typeof signupSchema>;
export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signupSchema),
  });
  const { signUp } = useAuthStore();
  const navigate = useNavigate();
  const onSubmit = async (data: SignUpFormValues) => {
    const { firstname, lastname, username, email, password } = data;
    await signUp(username, password, email, firstname, lastname);
    navigate("/signin");
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
                <h1 className='text-2xl font-bold'>Tạo tài khoản</h1>
                <p className='text-muted-foreground text-balance'>
                  Chào mừng bạn! Hãy đăng ký để bắt đầu.
                </p>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-2'>
                  <Label htmlFor='lastname'>Họ</Label>
                  <Input id='lastname' type='text' {...register("lastname")} />
                  {errors.lastname && (
                    <p className='text-sm text-red-600'>
                      {errors.lastname.message}
                    </p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='firstname'>Tên</Label>
                  <Input
                    id='firstname'
                    type='text'
                    {...register("firstname")}
                  />
                  {errors.firstname && (
                    <p className='text-sm text-red-600'>
                      {errors.firstname.message}
                    </p>
                  )}
                </div>
              </div>
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
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='text'
                  placeholder='n@gmail.com'
                  {...register("email")}
                />
                {errors.email && (
                  <p className='text-sm text-red-600'>{errors.email.message}</p>
                )}
              </div>
              <div className='flex flex-col gap-3'>
                <Label htmlFor='password'>Mật khẩu</Label>
                <Input
                  id='password'
                  type='text'
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
                Đăng ký
              </Button>
              <div className='text-center text-sm'>
                Đã có tài khoản?{" "}
                <Link to='/signin' className='text-primary hover:underline '>
                  Đăng nhập
                </Link>
              </div>
            </div>
          </form>
          <div className='bg-muted relative hidden md:block'>
            <img
              src='placeholderSignup.png'
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
