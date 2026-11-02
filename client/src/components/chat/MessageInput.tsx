import { useAuthStore } from "@/stores/useAuthStore";
import type { Conversation } from "@/types/chat";
import { ImagePlus, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import EmojiPicker from "./EmojiPicker";
import { useChatStore } from "@/stores/useChatStore";
import { toast } from "sonner";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const MessageInput = ({ selectedConvo }: { selectedConvo: Conversation }) => {
  const { user } = useAuthStore();
  const [value, setValue] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendDirectMessage, sendGroupMessage } = useChatStore();

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  if (!user) return null;

  const clearImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedImage = event.target.files?.[0];
    if (!selectedImage) return;
    if (!selectedImage.type.startsWith("image/")) {
      toast.error("Chỉ có thể đính kèm tệp hình ảnh");
      clearImage();
      return;
    }
    if (selectedImage.size > MAX_IMAGE_SIZE) {
      toast.error("Ảnh đính kèm tối đa 10MB");
      clearImage();
      return;
    }
    setImage(selectedImage);
  };

  const sendMessage = async () => {
    const content = value.trim();
    if ((!content && !image) || sending) return;
    setSending(true);
    try {
      if (selectedConvo.type === "direct") {
        const otherUser = selectedConvo.participants.find((participant) => participant._id !== user._id);
        if (!otherUser) throw new Error("Không tìm thấy người nhận");
        await sendDirectMessage(otherUser._id, content, image || undefined);
      } else {
        await sendGroupMessage(selectedConvo._id, content, image || undefined);
      }
      setValue("");
      clearImage();
    } catch (error) {
      console.error(error);
      toast.error("Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div className='shrink-0 border-t border-border/60 bg-background/95 px-2.5 py-2 backdrop-blur-md sm:px-4 sm:py-3 pb-[max(0.6rem,env(safe-area-inset-bottom))]'>
      {previewUrl && (
        <div className='mb-2 flex items-start gap-2'>
          <div className='relative size-16 overflow-hidden rounded-lg border border-border bg-muted'>
            <img src={previewUrl} alt='Ảnh sắp gửi' className='size-full object-cover' />
            <Button
              type='button'
              size='icon'
              variant='destructive'
              className='absolute -right-1 -top-1 size-5 rounded-full'
              onClick={clearImage}
              disabled={sending}
            >
              <X className='size-3' />
              <span className='sr-only'>Bỏ ảnh</span>
            </Button>
          </div>
          <span className='pt-1 text-xs text-muted-foreground'>{image?.name}</span>
        </div>
      )}
      <div className='flex min-h-[44px] items-center gap-1.5 sm:gap-2'>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          className='sr-only'
          onChange={handleImageChange}
        />
        <Button
          variant='ghost'
          size='icon'
          type='button'
          className='size-9 shrink-0 transition-smooth hover:bg-primary/10 sm:size-10'
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
        >
          <ImagePlus className='size-5 text-muted-foreground' />
          <span className='sr-only'>Đính kèm ảnh</span>
        </Button>

        <div className='relative min-w-0 flex-1'>
          <Input
            onKeyDown={handleKeyDown}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder='Soạn tin nhắn...'
            disabled={sending}
            className='h-10 rounded-full border-border/50 bg-muted/40 px-4 pr-11 text-sm transition-smooth focus:border-primary/50 focus:bg-background sm:h-11 sm:text-base'
          />
          <div className='absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center'>
            <EmojiPicker onChange={(emoji: string) => setValue((previous) => `${previous}${emoji}`)} />
          </div>
        </div>

        <Button
          type='button'
          className='size-10 shrink-0 rounded-full bg-gradient-chat transition-smooth hover:scale-105 hover:shadow-glow sm:size-11 sm:w-auto sm:px-4'
          disabled={sending || (!value.trim() && !image)}
          onClick={() => void sendMessage()}
        >
          <Send className='size-4 text-white' />
          <span className='ml-1 hidden text-sm font-medium text-white sm:inline'>
            {sending ? "Đang gửi" : "Gửi"}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
