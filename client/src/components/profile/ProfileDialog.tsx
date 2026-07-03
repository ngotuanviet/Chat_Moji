import ProfileCard from "@/components/profile/ProfileCard";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Dispatch, SetStateAction } from "react";

interface ProfileDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}
const ProfileDialog = ({ open, setOpen }: ProfileDialogProps) => {
  const { user } = useAuthStore();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='overflow-y-auto p-0 bg-transparent border-0 shadow-2xl'>
        <div className='bg-gradient-glass'>
          <div className='max-w-4xl mx-auto p-4 '>
            {/* heading */}
            <div className='mb-6'>
              <DialogTitle className='text-2xl font-bold text-foreground '>
                Profile & Settings
              </DialogTitle>
              <DialogDescription className="sr-only">
                Chỉnh sửa thông tin cá nhân và cài đặt hình đại diện của bạn.
              </DialogDescription>
            </div>
            <ProfileCard user={user} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
