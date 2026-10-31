import FriendListModal from "@/components/createNewChat/FriendListModal";
import { Card } from "@/components/ui/card";
import { useFriendStore } from "@/stores/useFriendStore";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

function CreateNewChat() {
  const [open, setOpen] = useState(false);
  const { getFriends } = useFriendStore();
  const handleGetFriends = async () => {
    await getFriends();
  };

  return (
    <div className='flex gap-2'>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Card
            className='flex-1 p-3 glass hover:shadow-soft transition-smooth cursor-pointer group/card'
            onClick={handleGetFriends}
          >
            <div className='flex items-center gap-3 sm:gap-4'>
              <div className='size-8 bg-gradient-chat rounded-full flex items-center justify-center group-hover/card:scale-110 transition-bounce shrink-0'>
                <MessageCircle className='size-4 text-white' />
              </div>
              <span className='text-sm font-medium capitalize truncate'>
                Gửi tin nhắn mới
              </span>
            </div>
          </Card>
        </DialogTrigger>
        <FriendListModal onClose={() => setOpen(false)} />
      </Dialog>
    </div>
  );
}

export default CreateNewChat;
