import { useAuthStore } from "@/stores/useAuthStore";
import type { Conversation } from "@/types/chat";
import { ImagePlus, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import EmojiPicker from "./EmojiPicker";
import { useChatStore } from "@/stores/useChatStore";
import { toast } from "sonner";

const MessageInput = ({ selectedConvo }: { selectedConvo: Conversation }) => {
  const { user } = useAuthStore();
  const [value, setValue] = useState("");
  const { sendDirectMessage, sendGroupMessage } = useChatStore();

  if (!user) return null;

  const sendMessage = async () => {
    if (!value.trim()) return;
    const currValue = value;
    setValue("");
    try {
      if (selectedConvo.type === "direct") {
        const participants = selectedConvo.participants;
        const otherUser = participants.filter((p) => p._id !== user._id)[0];
        await sendDirectMessage(otherUser._id, currValue);
      } else {
        await sendGroupMessage(selectedConvo._id, currValue);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi gửi tin nhắn vui lòng gửi lại");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className='flex min-h-[60px] sm:min-h-[70px] shrink-0 items-center gap-1.5 sm:gap-2 border-t border-border/60 bg-background/95 backdrop-blur-md px-2.5 sm:px-4 py-2 sm:py-3 pb-[max(0.6rem,env(safe-area-inset-bottom))]'>
      <Button
        variant='ghost'
        size='icon'
        type='button'
        className='size-9 sm:size-10 shrink-0 transition-smooth hover:bg-primary/10'
      >
        <ImagePlus className='size-5 text-muted-foreground' />
        <span className='sr-only'>Đính kèm ảnh</span>
      </Button>

      <div className='relative flex-1 min-w-0'>
        <Input
          onKeyPress={handleKeyPress}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='Soạn tin nhắn...'
          className='h-10 sm:h-11 resize-none border-border/50 bg-muted/40 focus:bg-background pr-11 transition-smooth focus:border-primary/50 text-sm sm:text-base rounded-full px-4'
        />
        <div className='absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center'>
          <EmojiPicker
            onChange={(emoji: string) => setValue((prev) => `${prev}${emoji}`)}
          />
        </div>
      </div>

      <Button
        type='button'
        className='size-10 sm:size-11 sm:w-auto sm:px-4 shrink-0 rounded-full bg-gradient-chat transition-smooth hover:scale-105 hover:shadow-glow cursor-pointer disabled:opacity-50'
        disabled={!value.trim()}
        onClick={sendMessage}
      >
        <Send className='size-4 text-white' />
        <span className='hidden sm:inline text-white text-sm font-medium ml-1'>
          Gửi
        </span>
      </Button>
    </div>
  );
};

export default MessageInput;
