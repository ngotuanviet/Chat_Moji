import { userService } from "@/services/userService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import type { UserState } from "@/types/store";
import { toast } from "sonner";
import { create } from "zustand";

export const useUserStore = create<UserState>((set, get) => ({
  updateAvatarUrl: async (formData) => {
    try {
      const { user, setUser } = useAuthStore.getState();
      const data = await userService.uploadAvatar(formData);
      if (user) {
        setUser({
          ...user,
          avatarUrl: data.avatarUrl,
        });
        useChatStore.getState().fetchConversations();
      }
    } catch (error) {
      console.error("Lỗi khi update avatarUrl", error);
      toast.error("Upload avatar không thành công!");
    }
  },
  updateInfo: async (data) => {
    try {
      const { user, setUser } = useAuthStore.getState();
      const res = await userService.updateInfo(data);
      console.log("====================================");
      console.log(res);
      console.log("====================================");
      if (user) {
        setUser({
          ...user,
          ...res.userInfo,
        });
      }
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi khi update thông tin người dùng", error);
      toast.error("cập nhập thông tin user không thành công!");
    }
  },
}));
