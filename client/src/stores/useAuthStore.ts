import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";
import { persist } from "zustand/middleware";
import { useChatStore } from "./useChatStore";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      loading: false,
      setAccessToken: (accessToken) => {
        set({ accessToken });
      },
      clearState: () => {
        set({ accessToken: null, user: null, loading: false });
        localStorage.clear();
        useChatStore.getState().reset();
      },
      signUp: async (username, password, email, firstName, lastName) => {
        try {
          // call API
          await authService.signUp(
            username,
            password,
            email,
            firstName,
            lastName,
          );
          toast.success(
            "Đăng ký thành công! bạn sẽ được chuyển sang trang đăng nhập",
          );
        } catch (error) {
          console.error(error);
          toast.error("Đăng ký không thành công");
        } finally {
          set({ loading: false });
        }
      },
      signIn: async (username, password) => {
        try {
          set({ loading: true });
          localStorage.clear();
          useChatStore.getState().reset();
          const { accessToken } = await authService.signIn(username, password);

          get().setAccessToken(accessToken);
          await get().fetchMe();
          useChatStore.getState().fetchConversations();
          toast.success("Đăng nhập thành công");
        } catch (error) {
          console.error(error);
          toast.error("Đăng nhập không thành công");
        } finally {
          set({ loading: false });
        }
      },
      signOut: async () => {
        try {
          get().clearState();
          await authService.signOut();
          toast.success("Đăng xuất thành công");
        } catch (error) {
          console.error(error);
          toast.error("Đăng xuất không thành công");
        }
      },
      fetchMe: async () => {
        try {
          set({ loading: true });
          const user = await authService.fetchMe();
          set({ user });
        } catch (error) {
          set({ user: null, loading: false });
          console.error(error);
        } finally {
          set({ loading: false });
        }
      },
      refresh: async () => {
        try {
          const { user, fetchMe, setAccessToken } = get();
          const accessToken = await authService.refresh();
          setAccessToken(accessToken);
          if (!user) {
            await fetchMe();
          }
        } catch (error) {
          get().clearState();
          console.error(error);
          toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        } finally {
          set({ loading: false });
        }
      },
    }),
    { name: "auth-storage", partialize: (state) => ({ user: state.user }) },
  ),
);
