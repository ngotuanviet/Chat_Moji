import PersonalInfoForm from "@/components/profile/PersonalInfoForm";
import PreferencesForm from "@/components/profile/PreferencesForm ";
import PrivacySettings from "@/components/profile/PrivacySettings";
import ProfileCard from "@/components/profile/ProfileCard";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/useAuthStore";
import { type Dispatch, type SetStateAction } from "react";

interface ProfileDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}
const ProfileDialog = ({ open, setOpen }: ProfileDialogProps) => {
  const { user } = useAuthStore();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='max-h-[90svh] overflow-y-auto p-0 bg-transparent border-0 shadow-2xl w-[95vw] sm:max-w-2xl md:max-w-3xl rounded-2xl beautiful-scrollbar'>
        <div className='bg-gradient-glass rounded-2xl overflow-hidden'>
          <div className='max-w-4xl mx-auto p-3 sm:p-5'>
            {/* heading */}
            <div className='mb-4 sm:mb-6'>
              <DialogTitle className='text-xl sm:text-2xl font-bold text-foreground'>
                Profile & Settings
              </DialogTitle>
              <DialogDescription className='sr-only'>
                Chỉnh sửa thông tin cá nhân và cài đặt hình đại diện của bạn.
              </DialogDescription>
            </div>
            <ProfileCard user={user} />
            <Tabs defaultValue='personal' className='my-4'>
              <TabsList className='grid w-full grid-cols-3 glass-light'>
                <TabsTrigger
                  value='personal'
                  className='data-[state=active]:glass-strong text-xs sm:text-sm'
                >
                  Tài khoản
                </TabsTrigger>
                <TabsTrigger
                  value='preferences'
                  className='data-[state=active]:glass-strong text-xs sm:text-sm'
                >
                  Cấu hình
                </TabsTrigger>
                <TabsTrigger
                  value='privacy'
                  className='data-[state=active]:glass-strong text-xs sm:text-sm'
                >
                  Bảo mật
                </TabsTrigger>
              </TabsList>
              <TabsContent value='personal'>
                <PersonalInfoForm userInfo={user} />
              </TabsContent>
              <TabsContent value='preferences'>
                <PreferencesForm />
              </TabsContent>
              <TabsContent value='privacy'>
                <PrivacySettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
