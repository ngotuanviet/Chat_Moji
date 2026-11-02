import PersonalInfoForm from "@/components/profile/PersonalInfoForm";
import PreferencesForm from "@/components/profile/PreferencesForm ";
import PrivacySettings from "@/components/profile/PrivacySettings";
import ProfileCard from "@/components/profile/ProfileCard";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/useAuthStore";
import { type Dispatch, type SetStateAction } from "react";
import { ShieldCheck, SlidersHorizontal, User, UserCircle } from "lucide-react";

interface ProfileDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const ProfileDialog = ({ open, setOpen }: ProfileDialogProps) => {
  const { user } = useAuthStore();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='max-h-[90svh] overflow-y-auto sm:max-w-xl md:max-w-2xl p-4 sm:p-6 beautiful-scrollbar rounded-2xl border-border/80 shadow-2xl'>
        <DialogHeader className='pb-1'>
          <DialogTitle className='flex items-center gap-2 text-lg sm:text-xl font-bold text-foreground'>
            <UserCircle className='size-5 text-primary' />
            Hồ sơ & Cài đặt
          </DialogTitle>
          <DialogDescription className='text-xs sm:text-sm text-muted-foreground'>
            Quản lý thông tin cá nhân, tuỳ chỉnh ứng dụng và quyền riêng tư của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 pt-1'>
          {/* Compact Bento Profile Summary */}
          <ProfileCard user={user} />

          {/* Navigation Tabs */}
          <Tabs defaultValue='personal' className='w-full'>
            <TabsList className='grid w-full grid-cols-3 bg-muted/60 p-1 rounded-xl h-10'>
              <TabsTrigger
                value='personal'
                className='text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all'
              >
                <User className='size-3.5 mr-1.5' />
                Tài khoản
              </TabsTrigger>
              <TabsTrigger
                value='preferences'
                className='text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all'
              >
                <SlidersHorizontal className='size-3.5 mr-1.5' />
                Cấu hình
              </TabsTrigger>
              <TabsTrigger
                value='privacy'
                className='text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all'
              >
                <ShieldCheck className='size-3.5 mr-1.5' />
                Bảo mật
              </TabsTrigger>
            </TabsList>

            <TabsContent value='personal' className='mt-3 focus-visible:outline-none'>
              <PersonalInfoForm userInfo={user} />
            </TabsContent>
            <TabsContent value='preferences' className='mt-3 focus-visible:outline-none'>
              <PreferencesForm />
            </TabsContent>
            <TabsContent value='privacy' className='mt-3 focus-visible:outline-none'>
              <PrivacySettings />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
