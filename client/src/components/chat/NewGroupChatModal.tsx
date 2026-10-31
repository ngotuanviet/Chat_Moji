import InviteSuggestionList from "@/components/newGroupChat/InviteSuggestionList";
import SelectedUsersList from "@/components/newGroupChat/SelectedUsersList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChatStore } from "@/stores/useChatStore";
import { useFriendStore } from "@/stores/useFriendStore";
import type { Friend } from "@/types/user";
import { UserPlusIcon, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function NewGroupChatModal() {
  const [open, setOpen] = useState(false);
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
      if (!groupName.trim()) {
        toast.warning("Vui lòng nhập tên nhóm");
        return;
      }
      if (invitedUsers.length === 0) {
        toast.warning("Bạn phải mời ít nhất 1 người vào nhóm");
        return;
      }
      await createConversation(
        "group",
        groupName.trim(),
        invitedUsers.map((u) => u._id),
      );
      setSearch("");
      setGroupName("");
      setInvitedUsers([]);
      setOpen(false);
      toast.success("Tạo nhóm chat thành công!");
    } catch (error) {
      console.error("Lỗi xảy ra khi tạo nhóm chat: ", error);
      toast.error("Không thể tạo nhóm chat. Vui lòng thử lại!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          onClick={handleGetFriends}
          className='size-7 sm:size-6 rounded-full hover:bg-sidebar-accent transition cursor-pointer'
        >
          <Users className='size-4' />
          <span className='sr-only'>Tạo nhóm</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px] border-none p-4 sm:p-6'>
        <DialogHeader>
          <DialogTitle className='capitalize text-lg sm:text-xl'>
            Tạo nhóm chat mới
          </DialogTitle>
        </DialogHeader>
        <form className='space-y-4' onSubmit={handleSubmit}>
          {/* tên nhóm */}
          <div className='space-y-2'>
            <Label className='text-sm font-semibold' htmlFor='groupName'>
              Tên nhóm
            </Label>
            <Input
              id='groupName'
              placeholder='Vui lòng nhập tên nhóm'
              className='glass border-border/50 focus:border-primary/50 transition-smooth h-10 sm:h-11'
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
              placeholder='Tìm theo tên hiển thị'
              className='glass border-border/50 focus:border-primary/50 transition-smooth h-10 sm:h-11'
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
          <DialogFooter className='pt-2'>
            <Button
              type='submit'
              disabled={loading}
              className='w-full h-11 bg-gradient-chat text-white hover:opacity-90 transition-smooth cursor-pointer'
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
