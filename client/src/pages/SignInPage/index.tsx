import { SigninForm } from "@/components/auth/signin-form";

const SignInPage = () => {
  return (
    <div className='flex min-h-svh w-full flex-col items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto bg-gradient-purple beautiful-scrollbar'>
      <div className='w-full max-w-sm md:max-w-4xl py-6'>
        <SigninForm />
      </div>
    </div>
  );
};

export default SignInPage;
