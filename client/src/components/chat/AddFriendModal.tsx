import SearchForm from "@/components/AddFriendModal/SearchForm";
import SendFriendRequestForm from "@/components/AddFriendModal/SendFriendRequestForm";
import { DialogHeader } from "@/components/ui/dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFriendStore } from "@/stores/useFriendStore";
import type { User } from "@/types/user";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { toast } from "sonner";

export interface IFormValues {
  message: string;
  username: string;
}
function AddFriendModal() {
  const [isFound, setIsFound] = useState<boolean | null>(null);
  const [seachUser, setSearchUser] = useState<User>();

  const [searchedUsername, setSearchedUsername] = useState("");
  const { loading, searchByUsername, addFriend } = useFriendStore();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<IFormValues>({
    defaultValues: { username: "", message: "" },
  });
  const usernameValues = watch("username");
  const handleSearch = handleSubmit(async (data) => {
    const username = data.username.trim();
    if (!username) return;
    setIsFound(null);
    setSearchedUsername(username);
    try {
      const foundUser = await searchByUsername(username);
      if (foundUser) {
        setIsFound(true);
        setSearchUser(foundUser);
      } else {
        setIsFound(false);
      }
    } catch (error) {
      console.error(error);
      setIsFound(false);
    }
  });
  const handleSend = handleSubmit(async (data) => {
    if (!seachUser) return;
    try {
      const message = await addFriend(seachUser._id, data.message.trim());
      toast.success(message);
      reset();

      handleCancel();
    } catch (error) {
      console.error("Lỗi xảy ra khi gửi request từ form", error);
    }
  });
  const handleCancel = () => {
    reset();
    setSearchedUsername("");
    setIsFound(null);
  };
  return (
    <Dialog>
      <DialogTrigger>
        <div className='flex justify-center items-center size-5 rounded-full hover:bg-sidebar-accent cursor-pointer z-10'>
          <UserPlus className='size-4' />
          <span className='sr-only'>Kết bạn</span>
        </div>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px] border-none'>
        <DialogHeader>
          <DialogTitle> Kết bạn</DialogTitle>
          {!isFound && (
            <>
              <SearchForm
                register={register}
                errors={errors}
                usernameValue={usernameValues}
                loading={loading}
                isFound={isFound}
                searchedUsername={searchedUsername}
                onSubmit={handleSearch}
                onCancel={handleCancel}
              />
            </>
          )}
          {isFound && (
            <>
              <SendFriendRequestForm
                register={register}
                searchUsername={searchedUsername}
                loading={loading}
                onSubmit={handleSend}
                onBack={() => setIsFound(null)}
              ></SendFriendRequestForm>
            </>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default AddFriendModal;
