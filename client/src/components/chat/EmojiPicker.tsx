import { useThemeStore } from "@/stores/useThemeStore";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Smile } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

interface EmojiPickerProps {
  onChange: (value: string) => void;
}

interface EmojiItem {
  native?: string;
  shortcodes?: string;
}

const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
  const { isDark } = useThemeStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type='button'
          className='flex size-8 items-center justify-center rounded-full text-muted-foreground transition-smooth hover:bg-muted/60 hover:text-foreground cursor-pointer'
          title='Chọn biểu tượng cảm xúc'
        >
          <Smile className='size-5' />
          <span className='sr-only'>Chọn biểu tượng cảm xúc</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side='top'
        align='end'
        sideOffset={8}
        className='w-auto p-0 border-none shadow-2xl max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl z-50'
      >
        <Picker
          theme={isDark ? "dark" : "light"}
          data={data}
          onEmojiSelect={(emoji: EmojiItem) =>
            onChange(emoji?.native || emoji?.shortcodes || "")
          }
          emojiSize={22}
          perLine={8}
          previewPosition='none'
          skinTonePosition='none'
          maxFrequentRows={1}
        />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
