import api from "@/lib/axios";

export const friendService = {
  async searchByUsername(username: string) {
    const res = await api(`/user/search?username=${username}`);
    return res.data.user;
  },
  async sendFriendRequest(to: string, message?: string) {
    const res = await api.post("/friends/requests", { to, message });
    return res.data.message;
  },
  async getAllFriendRequest() {
    const res = await api.get("/friends/requests");
    const { sent, received } = res.data;
    return { sent, received };
  },
  async acceptRequest(requestId: string) {
    const res = await api.post(`/friends/requests/${requestId}/accept`);
    return res.data.newFriend;
  },
  async declineRequest(requestId: string) {
    await api.post(`/friends/requests/${requestId}/decline`);
  },
  async cancelRequest(requestId: string) {
    await api.delete(`/friends/requests/${requestId}`);
  },
  async getFriendList() {
    const res = await api.get("/friends");
    return res.data.friends;
  },
};
