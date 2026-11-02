import { useState } from "react";
import { Eye, EyeOff, AlertTriangle, KeyRound, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserStore } from "@/stores/useUserStore";
import { toast } from "sonner";

const PrivacySettings = () => {
  const { changePassword, deleteAccount } = useUserStore();

  // Change Password state
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

  // Delete Account state
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePass, setShowDeletePass] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.warning("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.warning("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warning("Xác nhận mật khẩu không khớp");
      return;
    }
    if (currentPassword === newPassword) {
      toast.warning("Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }

    try {
      setLoadingPass(true);
      await changePassword(currentPassword, newPassword);
      setOpenChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      // error handled in store
    } finally {
      setLoadingPass(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) {
      toast.warning("Vui lòng nhập mật khẩu để xác nhận xoá tài khoản");
      return;
    }

    try {
      setLoadingDelete(true);
      await deleteAccount(deletePassword);
      setOpenDeleteModal(false);
      setDeletePassword("");
    } catch {
      // error handled in store
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <>
      <div className='space-y-4 pt-1'>
        {/* Change password card */}
        <div className='p-3.5 sm:p-4 rounded-xl border border-border/70 bg-card/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
          <div>
            <h4 className='font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2'>
              <KeyRound className='size-4 text-primary' />
              Mật khẩu đăng nhập
            </h4>
            <p className='text-[11px] sm:text-xs text-muted-foreground mt-0.5'>
              Thay đổi mật khẩu định kỳ giúp tăng cường an toàn tài khoản.
            </p>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setOpenChangePassword(true)}
            className='h-8 text-xs shrink-0 border-border/80 hover:text-primary'
          >
            Đổi mật khẩu
          </Button>
        </div>

        {/* Danger zone card */}
        <div className='p-3.5 sm:p-4 rounded-xl border border-destructive/30 bg-destructive/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
          <div>
            <h4 className='font-semibold text-xs sm:text-sm text-destructive flex items-center gap-1.5'>
              <AlertTriangle className='size-4' />
              Khu vực nguy hiểm
            </h4>
            <p className='text-[11px] sm:text-xs text-muted-foreground mt-0.5'>
              Xoá tài khoản và tất cả dữ liệu hội thoại vĩnh viễn. Không thể khôi phục.
            </p>
          </div>
          <Button
            variant='destructive'
            size='sm'
            onClick={() => setOpenDeleteModal(true)}
            className='h-8 text-xs shrink-0 font-medium'
          >
            <Trash2 className='size-3.5 mr-1.5' />
            Xoá tài khoản
          </Button>
        </div>
      </div>

      {/* Dialog Đổi mật khẩu */}
      <Dialog open={openChangePassword} onOpenChange={setOpenChangePassword}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base sm:text-lg'>
              <KeyRound className='size-4 text-primary' />
              Đổi mật khẩu
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Nhập mật khẩu hiện tại và mật khẩu mới. Sau khi đổi, bạn sẽ được chuyển về trang đăng nhập.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleChangePassword} className='space-y-3.5 py-1'>
            <div className='space-y-1.5'>
              <Label htmlFor='current-pass' className='text-xs font-medium'>
                Mật khẩu hiện tại
              </Label>
              <div className='relative'>
                <Input
                  id='current-pass'
                  type={showCurrentPass ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder='Nhập mật khẩu đang dùng'
                  className='h-9 text-xs sm:text-sm'
                  required
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground'
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                >
                  {showCurrentPass ? <EyeOff className='size-3.5' /> : <Eye className='size-3.5' />}
                </Button>
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='new-pass' className='text-xs font-medium'>
                Mật khẩu mới
              </Label>
              <div className='relative'>
                <Input
                  id='new-pass'
                  type={showNewPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder='Tối thiểu 6 ký tự'
                  className='h-9 text-xs sm:text-sm'
                  required
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground'
                  onClick={() => setShowNewPass(!showNewPass)}
                >
                  {showNewPass ? <EyeOff className='size-3.5' /> : <Eye className='size-3.5' />}
                </Button>
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='confirm-pass' className='text-xs font-medium'>
                Xác nhận mật khẩu mới
              </Label>
              <Input
                id='confirm-pass'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Nhập lại mật khẩu mới'
                className='h-9 text-xs sm:text-sm'
                required
              />
            </div>

            <DialogFooter className='gap-2 sm:gap-0 pt-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setOpenChangePassword(false)}
                disabled={loadingPass}
                className='h-8.5 text-xs'
              >
                Huỷ
              </Button>
              <Button type='submit' size='sm' disabled={loadingPass} className='h-8.5 text-xs'>
                {loadingPass ? "Đang lưu..." : "Đổi mật khẩu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Xoá tài khoản */}
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-destructive text-base sm:text-lg'>
              <AlertTriangle className='size-4 text-destructive' />
              Xác nhận xoá tài khoản
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              Hành động này mang tính <strong className='text-destructive'>vĩnh viễn</strong>. Toàn bộ tin nhắn trực tiếp và thông tin cá nhân của bạn sẽ bị xoá hoàn toàn.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDeleteAccount} className='space-y-3.5 py-1'>
            <div className='space-y-1.5'>
              <Label htmlFor='delete-pass' className='text-xs font-medium'>
                Nhập mật khẩu để xác nhận
              </Label>
              <div className='relative'>
                <Input
                  id='delete-pass'
                  type={showDeletePass ? "text" : "password"}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder='Mật khẩu tài khoản'
                  className='h-9 text-xs sm:text-sm'
                  required
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground'
                  onClick={() => setShowDeletePass(!showDeletePass)}
                >
                  {showDeletePass ? <EyeOff className='size-3.5' /> : <Eye className='size-3.5' />}
                </Button>
              </div>
            </div>

            <DialogFooter className='gap-2 sm:gap-0 pt-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setOpenDeleteModal(false)}
                disabled={loadingDelete}
                className='h-8.5 text-xs'
              >
                Huỷ bỏ
              </Button>
              <Button
                type='submit'
                variant='destructive'
                size='sm'
                disabled={loadingDelete}
                className='h-8.5 text-xs'
              >
                {loadingDelete ? "Đang xoá..." : "Xác nhận xoá"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrivacySettings;
