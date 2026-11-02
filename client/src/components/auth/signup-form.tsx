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
  firstname: z.string().min(1, "Vui lòng nhập tên"),
  lastname: z.string().min(1, "Vui lòng nhập họ"),
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  email: z.string().email("Vui lòng nhập đúng định dạng email"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
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
      <Card className='overflow-hidden p-0 border-border/60 shadow-xl'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          <form className='p-6 md:p-8' onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-5'>
              <div className='flex flex-col items-center gap-2 text-center'>
                <div className='mx-auto block w-fit text-center'>
                  <img src='/logo.svg' alt='Logo Moji' className='size-12' />
                </div>
                <h1 className='text-2xl font-bold'>Tạo tài khoản</h1>
                <p className='text-muted-foreground text-sm text-balance'>
                  Đăng ký tài khoản để bắt đầu kết nối cùng Moji.
                </p>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label htmlFor='lastname'>Họ</Label>
                  <Input id='lastname' type='text' placeholder='Nguyễn' {...register("lastname")} />
                  {errors.lastname && (
                    <p className='text-xs text-destructive'>
                      {errors.lastname.message}
                    </p>
                  )}
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='firstname'>Tên</Label>
                  <Input
                    id='firstname'
                    type='text'
                    placeholder='Văn A'
                    {...register("firstname")}
                  />
                  {errors.firstname && (
                    <p className='text-xs text-destructive'>
                      {errors.firstname.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='username'>Tên đăng nhập</Label>
                <Input
                  id='username'
                  type='text'
                  placeholder='username'
                  {...register("username")}
                />
                {errors.username && (
                  <p className='text-xs text-destructive'>
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='email@domain.com'
                  {...register("email")}
                />
                {errors.email && (
                  <p className='text-xs text-destructive'>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='password'>Mật khẩu</Label>
                <Input
                  id='password'
                  type='password'
                  placeholder='Tối thiểu 6 ký tự'
                  {...register("password")}
                />
                {errors.password && (
                  <p className='text-xs text-destructive'>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button type='submit' disabled={isSubmitting} className='w-full mt-1'>
                {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
              </Button>

              <div className='text-center text-sm'>
                Đã có tài khoản?{" "}
                <Link to='/signin' className='text-primary font-medium hover:underline'>
                  Đăng nhập
                </Link>
              </div>
            </div>
          </form>
          <div className='bg-muted/40 relative hidden md:block'>
            <img
              src='/placeholderSignUp.png'
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
