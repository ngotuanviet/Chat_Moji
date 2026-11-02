import api from "@/lib/axios";
import type { User } from "@/types/user";

export const userService = {
  uploadAvatar: async (formData: FormData) => {
    const res = await api.post("/user/uploadAvatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.status === 400) {
      throw new Error(res.data.message);
    }
    return res.data;
  },
  updateInfo: async (data: Partial<User>) => {
    const res = await api.post("/user/update", data);
    if (res.status === 400) {
      throw new Error(res.data.message);
    }
    return res.data;
  },
  updatePreferences: async (data: Pick<User, "showOnline" | "notificationsEnabled">) => {
    const res = await api.patch<{ user: User }>("/user/preferences", data);
    return res.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await api.post<{ message: string }>("/user/change-password", {
      currentPassword,
      newPassword,
    });
    return res.data;
  },
  deleteAccount: async (password: string) => {
    const res = await api.delete<{ message: string }>("/user/me", {
      data: { password },
    });
    return res.data;
  },
};
