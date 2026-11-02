import { useState, useRef, useEffect, useMemo } from "react";
import type { Conversation } from "@/types/chat";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useFriendStore } from "@/stores/useFriendStore";
import { useSocketStore } from "@/stores/useSocketStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserAvatar from "./UserAvatar";
import GroupChatAvatar from "./GroupChatAvatar";
import StatusBadge from "./StatusBadge";
import {
  Camera,
  Crown,
  Edit2,
  LogOut,
  Plus,
  Search,
  Trash2,
  Users,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface GroupSettingsModalProps {
  chat: Conversation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GroupSettingsModal = ({
  chat,
  open,
  onOpenChange,
}: GroupSettingsModalProps) => {
  const { user } = useAuthStore();
  const { updateGroup, addGroupParticipants, removeGroupParticipant } =
    useChatStore();
  const { friends, getFriends } = useFriendStore();
  const { onlineUsers } = useSocketStore();

  const isOwner = chat.group?.createdBy === user?._id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit group state
  const [groupName, setGroupName] = useState(chat.group?.name || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Search & add members state
  const [memberSearch, setMemberSearch] = useState("");
  const [friendSearch, setFriendSearch] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [addingMembers, setAddingMembers] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [leavingGroup, setLeavingGroup] = useState(false);

  useEffect(() => {
    if (chat.group?.name) {
      setGroupName(chat.group.name);
    }
  }, [chat.group?.name]);

  useEffect(() => {
    if (open) {
      getFriends();
      setSelectedFriendIds([]);
      setFriendSearch("");
      setMemberSearch("");
    }
  }, [open, getFriends]);

  // Friends not yet in the group
  const existingMemberIds = useMemo(
    () => new Set(chat.participants.map((p) => p._id)),
    [chat.participants],
  );

  const eligibleFriends = useMemo(() => {
    return friends.filter(
      (f) =>
        !existingMemberIds.has(f._id) &&
        f.displayName.toLowerCase().includes(friendSearch.toLowerCase()),
    );
  }, [friends, existingMemberIds, friendSearch]);

  const filteredMembers = useMemo(() => {
    return chat.participants.filter((p) =>
      p.displayName.toLowerCase().includes(memberSearch.toLowerCase()),
    );
  }, [chat.participants, memberSearch]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = groupName.trim();
    if (!trimmed) {
      toast.warning("Tên nhóm không được để trống");
      return;
    }
    if (trimmed === chat.group?.name) {
      setIsEditingName(false);
      return;
    }
    try {
      setSavingName(true);
      await updateGroup(chat._id, trimmed);
      setIsEditingName(false);
      toast.success("Cập nhật tên nhóm thành công");
    } catch {
      toast.error("Không thể cập nhật tên nhóm");
    } finally {
      setSavingName(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warning("Vui lòng chọn tệp hình ảnh");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.warning("Dung lượng ảnh tối đa là 10MB");
      return;
    }

    try {
      setUploadingAvatar(true);
      await updateGroup(chat._id, undefined, file);
      toast.success("Đổi avatar nhóm thành công");
    } catch {
      toast.error("Không thể tải lên ảnh đại diện nhóm");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleSelectFriend = (id: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleAddMembers = async () => {
    if (!selectedFriendIds.length) {
      toast.warning("Vui lòng chọn ít nhất một người bạn");
      return;
    }
    try {
      setAddingMembers(true);
      await addGroupParticipants(chat._id, selectedFriendIds);
      toast.success("Đã thêm thành viên vào nhóm");
      setSelectedFriendIds([]);
    } catch {
      toast.error("Không thể thêm thành viên");
    } finally {
      setAddingMembers(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (
      !window.confirm(`Bạn có chắc chắn muốn xoá ${memberName} khỏi nhóm không?`)
    ) {
      return;
    }
    try {
      setRemovingId(memberId);
      await removeGroupParticipant(chat._id, memberId);
      toast.success(`Đã xoá ${memberName} khỏi nhóm`);
    } catch {
      toast.error("Không thể xoá thành viên khỏi nhóm");
    } finally {
      setRemovingId(null);
    }
  };

  const handleLeaveGroup = async () => {
    if (!user) return;
    if (isOwner && chat.participants.length > 1) {
      toast.error(
        "Trưởng nhóm không thể rời nhóm khi còn thành viên. Vui lòng xoá các thành viên khác trước khi giải tán nhóm.",
      );
      return;
    }
    if (
      !window.confirm(
        isOwner
          ? "Bạn là trưởng nhóm. Rời nhóm đồng nghĩa với việc giải tán nhóm. Bạn có chắc chắn không?"
          : "Bạn có chắc chắn muốn rời khỏi nhóm này không?",
      )
    ) {
      return;
    }
    try {
      setLeavingGroup(true);
      await removeGroupParticipant(chat._id, user._id);
      onOpenChange(false);
      toast.success("Đã rời nhóm thành công");
    } catch {
      toast.error("Không thể rời nhóm");
    } finally {
      setLeavingGroup(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90svh] overflow-y-auto sm:max-w-md p-4 sm:p-6 beautiful-scrollbar'>
        <DialogHeader className='pb-2'>
          <DialogTitle className='flex items-center gap-2 text-lg sm:text-xl'>
            <Users className='size-5 text-primary' />
            Quản lý nhóm trò chuyện
          </DialogTitle>
        </DialogHeader>

        {/* Group Header Info */}
        <div className='flex flex-col items-center gap-3 p-4 rounded-xl bg-card border border-border/40 shadow-xs'>
          <div className='relative'>
            {chat.group?.avatarUrl ? (
              <UserAvatar
                type='profile'
                name={chat.group?.name || "Nhóm"}
                avatarUrl={chat.group.avatarUrl}
                className='size-20 text-2xl ring-2 ring-primary/20'
              />
            ) : (
              <GroupChatAvatar
                participants={chat.participants}
                type='sidebar'
                name={chat.group?.name}
              />
            )}

            {isOwner && (
              <>
                <Button
                  size='icon'
                  variant='secondary'
                  disabled={uploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className='absolute -bottom-1 -right-1 size-7 rounded-full shadow-md hover:scale-105 transition cursor-pointer'
                  title='Đổi ảnh đại diện nhóm'
                >
                  {uploadingAvatar ? (
                    <Loader2 className='size-3.5 animate-spin' />
                  ) : (
                    <Camera className='size-3.5' />
                  )}
                </Button>
                <input
                  type='file'
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept='image/*'
                  className='hidden'
                />
              </>
            )}
          </div>

          <div className='w-full text-center'>
            {isEditingName ? (
              <form
                onSubmit={handleUpdateName}
                className='flex items-center gap-1.5 justify-center max-w-xs mx-auto mt-1'
              >
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder='Nhập tên nhóm'
                  maxLength={100}
                  className='h-8 text-sm'
                  autoFocus
                />
                <Button
                  type='submit'
                  size='sm'
                  disabled={savingName || !groupName.trim()}
                  className='h-8 px-2.5 text-xs'
                >
                  {savingName ? <Loader2 className='size-3.5 animate-spin' /> : "Lưu"}
                </Button>
                <Button
                  type='button'
                  size='sm'
                  variant='ghost'
                  disabled={savingName}
                  onClick={() => {
                    setGroupName(chat.group?.name || "");
                    setIsEditingName(false);
                  }}
                  className='h-8 px-2 text-xs'
                >
                  Huỷ
                </Button>
              </form>
            ) : (
              <div className='flex items-center justify-center gap-1.5'>
                <h3 className='font-bold text-base sm:text-lg text-foreground truncate max-w-[240px]'>
                  {chat.group?.name}
                </h3>
                {isOwner && (
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setIsEditingName(true)}
                    className='size-6 text-muted-foreground hover:text-foreground cursor-pointer'
                    title='Chỉnh sửa tên nhóm'
                  >
                    <Edit2 className='size-3.5' />
                  </Button>
                )}
              </div>
            )}
            <p className='text-xs text-muted-foreground mt-0.5'>
              {chat.participants.length} thành viên • {isOwner ? "Bạn là Quản trị viên" : "Thành viên"}
            </p>
          </div>
        </div>

        {/* Tabs: Thành viên & Thêm thành viên */}
        <Tabs defaultValue='members' className='w-full mt-2'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='members' className='text-xs sm:text-sm'>
              Thành viên ({chat.participants.length})
            </TabsTrigger>
            {isOwner ? (
              <TabsTrigger value='add' className='text-xs sm:text-sm'>
                Thêm thành viên
              </TabsTrigger>
            ) : (
              <TabsTrigger value='info' className='text-xs sm:text-sm'>
                Thông tin
              </TabsTrigger>
            )}
          </TabsList>

          {/* Tab 1: Danh sách thành viên */}
          <TabsContent value='members' className='space-y-3 pt-2'>
            <div className='relative'>
              <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
              <Input
                placeholder='Tìm kiếm thành viên...'
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className='pl-8 h-9 text-xs sm:text-sm'
              />
            </div>

            <div className='space-y-1.5 max-h-60 overflow-y-auto beautiful-scrollbar pr-1'>
              {filteredMembers.map((member) => {
                const memberIsOwner = chat.group?.createdBy === member._id;
                const isMe = member._id === user?._id;
                const isOnline = onlineUsers.includes(member._id);

                return (
                  <div
                    key={member._id}
                    className='flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition'
                  >
                    <div className='flex items-center gap-2.5 min-w-0'>
                      <div className='relative shrink-0'>
                        <UserAvatar
                          type='chat'
                          name={member.displayName}
                          avatarUrl={member.avatarUrl ?? undefined}
                        />
                        <StatusBadge
                          status={isOnline ? "online" : "offline"}
                        />
                      </div>
                      <div className='min-w-0 flex flex-col'>
                        <span className='text-sm font-medium text-foreground truncate flex items-center gap-1.5'>
                          {member.displayName}
                          {isMe && (
                            <span className='text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full'>
                              Bạn
                            </span>
                          )}
                        </span>
                        {memberIsOwner && (
                          <span className='text-[11px] text-amber-500 font-medium flex items-center gap-1'>
                            <Crown className='size-3 inline' /> Quản trị viên
                          </span>
                        )}
                      </div>
                    </div>

                    {isOwner && !isMe && (
                      <Button
                        variant='ghost'
                        size='icon'
                        disabled={removingId === member._id}
                        onClick={() =>
                          handleRemoveMember(member._id, member.displayName)
                        }
                        className='size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                        title={`Xoá ${member.displayName} khỏi nhóm`}
                      >
                        {removingId === member._id ? (
                          <Loader2 className='size-3.5 animate-spin' />
                        ) : (
                          <Trash2 className='size-3.5' />
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
              {filteredMembers.length === 0 && (
                <p className='text-center text-xs text-muted-foreground py-4'>
                  Không tìm thấy thành viên phù hợp
                </p>
              )}
            </div>
          </TabsContent>

          {/* Tab 2: Thêm thành viên (chỉ hiển thị cho Owner) */}
          {isOwner && (
            <TabsContent value='add' className='space-y-3 pt-2'>
              <div className='relative'>
                <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
                <Input
                  placeholder='Tìm trong danh sách bạn bè...'
                  value={friendSearch}
                  onChange={(e) => setFriendSearch(e.target.value)}
                  className='pl-8 h-9 text-xs sm:text-sm'
                />
              </div>

              <div className='space-y-1.5 max-h-52 overflow-y-auto beautiful-scrollbar pr-1'>
                {eligibleFriends.map((friend) => {
                  const isSelected = selectedFriendIds.includes(friend._id);
                  return (
                    <div
                      key={friend._id}
                      onClick={() => toggleSelectFriend(friend._id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                        isSelected
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted/40 border border-transparent"
                      }`}
                    >
                      <div className='flex items-center gap-2.5 min-w-0'>
                        <UserAvatar
                          type='chat'
                          name={friend.displayName}
                          avatarUrl={friend.avatarUrl}
                        />
                        <div className='min-w-0'>
                          <p className='text-sm font-medium text-foreground truncate'>
                            {friend.displayName}
                          </p>
                          <p className='text-xs text-muted-foreground truncate'>
                            @{friend.username}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`size-5 rounded-full flex items-center justify-center border transition ${
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/40"
                        }`}
                      >
                        {isSelected && <Check className='size-3.5 stroke-[3]' />}
                      </div>
                    </div>
                  );
                })}
                {eligibleFriends.length === 0 && (
                  <p className='text-center text-xs text-muted-foreground py-4'>
                    {friendSearch
                      ? "Không tìm thấy bạn bè phù hợp"
                      : "Không còn bạn bè nào để thêm vào nhóm"}
                  </p>
                )}
              </div>

              <div className='pt-2 flex items-center justify-between border-t border-border/40'>
                <span className='text-xs text-muted-foreground'>
                  Đã chọn {selectedFriendIds.length} người
                </span>
                <Button
                  size='sm'
                  onClick={handleAddMembers}
                  disabled={addingMembers || selectedFriendIds.length === 0}
                  className='text-xs h-8 px-3'
                >
                  {addingMembers ? (
                    <Loader2 className='size-3.5 animate-spin mr-1' />
                  ) : (
                    <Plus className='size-3.5 mr-1' />
                  )}
                  Thêm vào nhóm
                </Button>
              </div>
            </TabsContent>
          )}

          {/* Tab 2 for regular member: Group Info */}
          {!isOwner && (
            <TabsContent value='info' className='space-y-3 pt-2 text-xs sm:text-sm text-muted-foreground'>
              <div className='p-3 rounded-lg bg-muted/40 space-y-2'>
                <p>
                  <strong className='text-foreground'>Người tạo: </strong>
                  {chat.participants.find((p) => p._id === chat.group?.createdBy)
                    ?.displayName || "Quản trị viên"}
                </p>
                <p>
                  <strong className='text-foreground'>Ngày tham gia: </strong>
                  {new Date(chat.createdAt).toLocaleDateString("vi-VN")}
                </p>
                <p className='text-xs'>
                  Chỉ quản trị viên nhóm mới có quyền thay đổi tên nhóm, ảnh đại diện và thêm/xoá thành viên.
                </p>
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Leave group button */}
        <div className='pt-3 border-t border-border/40'>
          <Button
            variant='destructive'
            size='sm'
            onClick={handleLeaveGroup}
            disabled={leavingGroup}
            className='w-full font-medium text-xs sm:text-sm cursor-pointer'
          >
            {leavingGroup ? (
              <Loader2 className='size-3.5 animate-spin mr-1.5' />
            ) : (
              <LogOut className='size-3.5 mr-1.5' />
            )}
            {isOwner && chat.participants.length <= 1
              ? "Giải tán nhóm"
              : "Rời khỏi nhóm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupSettingsModal;
