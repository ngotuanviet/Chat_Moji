import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/chat/UserAvatar";
import { useFriendStore } from "@/stores/useFriendStore";
import { toast } from "sonner";
import { useState } from "react";

export const IncomingFriendRequestDialog = () => {
  const { incomingRequestModal, setIncomingRequestModal, acceptRequest, declineRequest } =
    useFriendStore();
  const [submitting, setSubmitting] = useState(false);

  const { open, request } = incomingRequestModal;
  const sender = request?.from;

  const handleClose = () => {
    setIncomingRequestModal({ open: false, request: null });
  };

  const handleAccept = async () => {
    if (!request?._id) return;
    try {
      setSubmitting(true);
      await acceptRequest(request._id);
      toast.success(`Đã đồng ý kết bạn với ${sender?.displayName || "người dùng"}!`);
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error("Không thể chấp nhận lời mời. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!request?._id) return;
    try {
      setSubmitting(true);
      await declineRequest(request._id);
      toast.info("Đã từ chối lời mời kết bạn");
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error("Không thể từ chối lời mời. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-center text-lg font-bold'>
            Lời mời kết bạn
          </DialogTitle>
        </DialogHeader>

        {sender && (
          <div className='flex flex-col items-center justify-center gap-4 py-4'>
            <UserAvatar
              type='profile'
              name={sender.displayName}
              avatarUrl={sender.avatarUrl}
              className='size-20'
            />
            <div className='text-center'>
              <h3 className='font-semibold text-lg'>{sender.displayName}</h3>
              <p className='text-sm text-muted-foreground'>@{sender.username}</p>
            </div>

            {request.message && (
              <div className='w-full rounded-lg bg-muted/50 p-3 text-center text-sm italic text-foreground border border-border/50'>
                "{request.message}"
              </div>
            )}
          </div>
        )}

        <DialogFooter className='flex flex-row gap-3 sm:justify-end'>
          <Button
            variant='outline'
            className='flex-1 sm:flex-none border-destructive text-destructive hover:bg-destructive/10'
            onClick={handleDecline}
            disabled={submitting}
          >
            Từ chối
          </Button>
          <Button
            className='flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground font-medium'
            onClick={handleAccept}
            disabled={submitting}
          >
            Chấp nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IncomingFriendRequestDialog;

