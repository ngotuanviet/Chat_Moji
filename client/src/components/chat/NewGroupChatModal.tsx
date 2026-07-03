import InviteSuggestionList from "@/components/newGroupChat/InviteSuggestionList";
import SelectedUsersList from "@/components/newGroupChat/SelectedUsersList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChatStore } from "@/stores/useChatStore";
import { useFriendStore } from "@/stores/useFriendStore";
import type { Friend } from "@/types/user";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { UserPlusIcon, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function NewGroupChatModal() {
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [invitedUsers, setInvitedUsers] = useState<Friend[]>([]);
  const { friends, getFriends } = useFriendStore();
  const { loading, createConversation } = useChatStore();
  const handleGetFriends = async () => {
    await getFriends();
  };
  const filteredFriends = friends.filter(
    (friend) =>
      friend.displayName.toLowerCase().includes(search.toLowerCase()) &&
      !invitedUsers.some((u) => u._id === friend._id),
  );
  const handleSelectFriend = (friend: Friend) => {
    setInvitedUsers([...invitedUsers, friend]);
    setSearch("");
  };
  const handleRemoveFriend = (friend: Friend) => {
    setInvitedUsers(invitedUsers.filter((user) => user._id !== friend._id));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (invitedUsers.length === 0) {
        toast.warning("Bạn phải mời ít nhất 1 người vào nhóm");
        return;
      }
      await createConversation(
        "group",
        groupName,
        invitedUsers.map((u) => u._id),
      );
      setSearch("");
      setInvitedUsers([]);
    } catch (error) {
      console.error("Lỗi xẩy ra khi handleSubmit trong newgroupchat:  ", error);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"ghost"}
          onClick={handleGetFriends}
          className='flex z-10 justify-center size-5 rounded-full hover:bg-sidebar-accent transition cursor-pointer'
        >
          <Users className='size-4 ' />
          <span className='sr-only'>Tạo nhóm</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px] border-none'>
        <DialogHeader>
          <DialogTitle className='capitalize'> tạo nhóm chat mới</DialogTitle>
        </DialogHeader>
        <form className='space-y-4' onSubmit={handleSubmit}>
          {/* têm nhóm */}
          <div className='space-y-2'>
            <Label className='text-sm font-semibold' htmlFor='groupName'>
              Tên nhóm
            </Label>
            <Input
              id='groupName'
              placeholder='Vui lòng nhập tên nhóm'
              className=' glass border-border/50 focus:border-primary/50 transition-smooth'
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>
          {/* mời thành viên */}
          <div className='space-y-2'>
            <Label htmlFor='invite' className='text-sm font-semibold'>
              Mời thành viên
            </Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id='invite'
              placeholder='Tìm theo tên hiện thị'
            />
            {/* danh sách gợi ý bạn bè theo tên */}
            {search && filteredFriends.length > 0 && (
              <InviteSuggestionList
                filteredFriends={filteredFriends}
                onSelect={handleSelectFriend}
              />
            )}

            {/* danh sách user đã chọn vào nhóm */}
            <SelectedUsersList
              invitedUsers={invitedUsers}
              onRemove={handleRemoveFriend}
            />
          </div>
          <DialogFooter>
            <Button
              type='submit'
              disabled={loading}
              className='flex-1 bg-gradient-chat text-white hover:opacity-90 transition-smooth '
            >
              {loading ? (
                <span>Đang tạo...</span>
              ) : (
                <>
                  <UserPlusIcon className='size-4 mr-2' />
                  Tạo nhóm
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default NewGroupChatModal;
