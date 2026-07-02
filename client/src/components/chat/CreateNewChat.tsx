import FriendListModal from "@/components/createNewChat/FriendListModal";
import { Card } from "@/components/ui/card";
import { useFriendStore } from "@/stores/useFriendStore";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { MessageCircle } from "lucide-react";

function CreateNewChat() {
  const { getFriends } = useFriendStore();
  const handleGetFriends = async () => {
    await getFriends();
  };
  return (
    <div className='flex gap-2'>
      <Dialog>
        <DialogTrigger asChild>
          <Card
            className='flex-1 p-3 glass hover:shadow-soft transition-smooth cursor-pointer group/card'
            onClick={handleGetFriends}
          >
            <div className='flex items-center gap-4'>
              <div className='size-8 bg-gradient-chat rounded-full flex items-center justify-center group-hover/card:scale-110 transition-bounce'>
                <MessageCircle className='size-4 text-white' />
              </div>
              <span className='text-sm font-medium capitalize'>
                Gửi tin nhắn mới
              </span>
            </div>
          </Card>
        </DialogTrigger>
        <FriendListModal />
      </Dialog>
    </div>
  );
}

export default CreateNewChat;
