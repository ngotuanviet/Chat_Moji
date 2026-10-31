import { Card } from "@/components/ui/card";
import { formatOnlineTime, cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";

interface ChatCardProps {
  convoId: string;
  name: string;
  timestamp?: Date;
  isActive: boolean;
  onSelect: (id: string) => void;
  unreadCount?: number;
  leftSection: React.ReactNode;
  subtitle: React.ReactNode;
}

const ChatCard = ({
  convoId,
  name,
  timestamp,
  isActive,
  onSelect,
  unreadCount,
  leftSection,
  subtitle,
}: ChatCardProps) => {
  return (
    <Card
      key={convoId}
      className={cn(
        "border-none p-3 sm:p-4 cursor-pointer transition-smooth glass hover:bg-muted/30 active:scale-[0.99] select-none",
        isActive &&
          "ring-2 ring-primary/50 bg-gradient-to-tr from-primary-glow/10 to-primary-foreground",
      )}
      onClick={() => onSelect(convoId)}
    >
      <div className='flex items-center gap-3 sm:gap-4'>
        <div className='relative shrink-0'>{leftSection}</div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-1'>
            <h3
              className={cn(
                "font-semibold text-sm sm:text-base truncate",
                unreadCount && unreadCount > 0 && "text-foreground",
              )}
            >
              {name}
            </h3>
            <span className='text-xs sm:text-sm text-muted-foreground shrink-0 ml-2'>
              {timestamp ? formatOnlineTime(timestamp) : ""}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1 flex-1 min-w-0 text-xs sm:text-sm'>
              {subtitle}
            </div>
            <MoreHorizontal className='size-5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:size-6 transition-smooth shrink-0' />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChatCard;
