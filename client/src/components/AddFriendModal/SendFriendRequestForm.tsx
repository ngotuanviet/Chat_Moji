import type { IFormValues } from "@/components/chat/AddFriendModal";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus } from "lucide-react";
import type { UseFormRegister } from "react-hook-form";

interface SendRequestProps {
  register: UseFormRegister<IFormValues>;
  loading: boolean;
  searchUsername: string;
  onSubmit?: (e?: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}
const SendFriendRequestForm = ({
  register,
  loading,
  searchUsername,
  onSubmit,
  onBack,
}: SendRequestProps) => {
  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      <div>
        <span className='success-message'>
          Tìm thấy <span className='font-semibold'>@{searchUsername}</span> rồi
          nè 🎉
        </span>
        <div className='space-y-2'>
          <Label htmlFor='message' className='text-sm font-semibold'>
            Giới thiệu
          </Label>
          <Textarea
            id='message'
            rows={3}
            placeholder='Chào bạn, bạn có thể kết bạn được không?...'
            className='glass border-border/50 focus:border-primary/50 transition-smooth resize-none'
            {...register("message")}
          />
        </div>
        <DialogFooter className='mt-5'>
          <Button
            type='button'
            variant={"outline"}
            className='flex-1 glass hover:text-destructive'
            onClick={onBack}
          >
            Quay lại
          </Button>
          <Button
            type='submit'
            disabled={loading}
            className='flex-1 bg-gradient-chat text-white hover:opacity-90 transition-smooth'
          >
            {loading ? (
              <span>Đang gửi....</span>
            ) : (
              <>
                <UserPlus className='size-4 mr-2' /> Kết bạn
              </>
            )}
          </Button>
        </DialogFooter>
      </div>
    </form>
  );
};

export default SendFriendRequestForm;
