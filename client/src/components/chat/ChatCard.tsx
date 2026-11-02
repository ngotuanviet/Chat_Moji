import { Card } from "@/components/ui/card";
import { formatOnlineTime, cn } from "@/lib/utils";

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
        "border-none p-2.5 sm:p-3 cursor-pointer transition-smooth glass hover:bg-muted/40 active:scale-[0.99] select-none shadow-none",
        isActive &&
          "ring-1.5 ring-primary/60 bg-primary/10 shadow-xs",
      )}
      onClick={() => onSelect(convoId)}
    >
      <div className='flex items-center gap-2.5 sm:gap-3'>
        <div className='relative shrink-0'>{leftSection}</div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-0.5'>
            <h3
              className={cn(
                "font-semibold text-sm truncate",
                unreadCount && unreadCount > 0 ? "text-foreground font-bold" : "text-foreground/90",
              )}
            >
              {name}
            </h3>
            <span className='text-[11px] sm:text-xs text-muted-foreground shrink-0 ml-1.5'>
              {timestamp ? formatOnlineTime(timestamp) : ""}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1 flex-1 min-w-0'>
              {subtitle}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChatCard;
