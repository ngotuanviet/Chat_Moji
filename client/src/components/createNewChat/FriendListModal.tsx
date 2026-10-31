import UserAvatar from "@/components/chat/UserAvatar";
import { Card } from "@/components/ui/card";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChatStore } from "@/stores/useChatStore";
import { useFriendStore } from "@/stores/useFriendStore";
import { MessageCircle, Users } from "lucide-react";

interface FriendListModalProps {
  onClose?: () => void;
}

const FriendListModal = ({ onClose }: FriendListModalProps) => {
  const { friends } = useFriendStore();
  const { createConversation } = useChatStore();

  const handleAddConversation = async (friendId: string) => {
    await createConversation("direct", "", [friendId]);
    onClose?.();
  };

  return (
    <DialogContent className='glass max-w-md w-[calc(100vw-2rem)] p-4 sm:p-6'>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-2 text-lg sm:text-xl capitalize'>
          <MessageCircle className='size-5 text-primary' />
          Bắt đầu hội thoại mới
        </DialogTitle>
        <DialogDescription className='sr-only'>
          Chọn một người bạn từ danh sách để bắt đầu trò chuyện.
        </DialogDescription>
      </DialogHeader>
      {/* Friends List */}
      <div className='space-y-3 sm:space-y-4 mt-2'>
        <h2 className='text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
          Danh sách bạn bè
        </h2>
        <div className='space-y-2 max-h-56 sm:max-h-72 overflow-y-auto beautiful-scrollbar pr-1'>
          {friends.map((friend) => (
            <Card
              key={friend._id}
              onClick={() => handleAddConversation(friend._id)}
              className='p-3 cursor-pointer transition-smooth hover:shadow-soft glass hover:bg-muted/30 active:scale-[0.99] group/friendCard select-none'
            >
              <div className='flex items-center gap-3'>
                {/* avatar */}
                <div className='relative shrink-0'>
                  <UserAvatar
                    type='sidebar'
                    name={friend.displayName}
                    avatarUrl={friend.avatarUrl}
                  />
                </div>
                {/* info */}
                <div className='flex-1 min-w-0 flex flex-col'>
                  <h3 className='font-semibold text-sm truncate'>
                    {friend.displayName}
                  </h3>
                  <span className='text-xs sm:text-sm text-muted-foreground truncate'>
                    @{friend.username}
                  </span>
                </div>
              </div>
            </Card>
          ))}
          {friends.length === 0 && (
            <div className='text-center py-8 text-muted-foreground'>
              <Users className='size-10 sm:size-12 mx-auto mb-3 opacity-50' />
              Chưa có bạn bè. Thêm bạn bè vào để nhắn tin!
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
};

export default FriendListModal;
