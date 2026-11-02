import { userService } from "@/services/userService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useSocketStore } from "@/stores/useSocketStore";
import type { UserState } from "@/types/store";
import { toast } from "sonner";
import { create } from "zustand";

export const useUserStore = create<UserState>(() => ({
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

      if (user) {
        setUser({
          ...user,
          ...res.userInfo,
        });
      }
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi khi update thông tin người dùng", error);
      toast.error("Cập nhật thông tin user không thành công!");
    }
  },
  updatePreferences: async (data) => {
    try {
      const { user, setUser } = useAuthStore.getState();
      const res = await userService.updatePreferences(data);
      if (user && res?.user) {
        setUser({
          ...user,
          ...res.user,
        });
      }
      toast.success("Đã cập nhật tuỳ chọn!");
    } catch (error: unknown) {
      console.error("Lỗi khi cập nhật tuỳ chọn", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Không thể cập nhật tuỳ chọn!");
      throw error;
    }
  },
  changePassword: async (currentPassword, newPassword) => {
    try {
      const res = await userService.changePassword(currentPassword, newPassword);
      toast.success(res?.message || "Đã đổi mật khẩu. Vui lòng đăng nhập lại.");
      useAuthStore.getState().clearState();
      useSocketStore.getState().disconnectSocket();
    } catch (error: unknown) {
      console.error("Lỗi khi đổi mật khẩu", error);
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message || "Không thể đổi mật khẩu";
      toast.error(msg);
      throw error;
    }
  },
  deleteAccount: async (password) => {
    try {
      await userService.deleteAccount(password);
      toast.success("Tài khoản của bạn đã được xoá vĩnh viễn");
      useAuthStore.getState().clearState();
      useSocketStore.getState().disconnectSocket();
    } catch (error: unknown) {
      console.error("Lỗi khi xoá tài khoản", error);
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message || "Không thể xoá tài khoản";
      toast.error(msg);
      throw error;
    }
  },
}));
