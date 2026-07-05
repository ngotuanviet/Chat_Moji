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
};

