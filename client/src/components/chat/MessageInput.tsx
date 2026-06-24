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

  if (!user) return;

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
    <div className='flex min-h-[72px] shrink-0 items-center gap-2 border-t border-border/60 bg-background p-3'>
      <Button
        variant='ghost'
        size='icon'
        className='transition-smooth hover:bg-primary/10'
      >
        <ImagePlus className='size-4' />
      </Button>
      <div className='relative flex-1'>
        <Input
          onKeyPress={handleKeyPress}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={"So\u1ea1n tin nh\u1eafn"}
          className='h-11 resize-none border-border/50 bg-white pr-20 transition-smooth focus:border-primary/50'
        />
        <div className='absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1'>
          <Button
            asChild
            variant='ghost'
            size='icon'
            className='size-8 transition-smooth hover:bg-primary/10'
          >
            <div>
              <EmojiPicker
                onChange={(emoji: string) => setValue(`${value}${emoji}`)}
              />
            </div>
          </Button>
        </div>
      </div>
      <Button
        className='bg-gradient-chat transition-smooth hover:scale-105 hover:shadow-glow'
        disabled={!value.trim()}
        onClick={sendMessage}
      >
        <Send className='size-4 text-white' />
      </Button>
    </div>
  );
};

export default MessageInput;
