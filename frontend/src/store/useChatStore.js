import { create } from "zustand";
import toast from "react-hot-toast";
import { Api } from "../lib/api";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await Api.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await Api.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await Api.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
  const socket = useAuthStore.getState().socket;
  socket.on("newMessage", (newMessage) => {
    const isMessageSentFromSelectedUser =
      newMessage.senderId === selectedUser._id;
    if (!isMessageSentFromSelectedUser) return;
  set({
    messages: [...get().messages, newMessage],
  });
  });
  // Add this handler for status updates
  socket.on("messageStatusUpdate", ({ messageId, status }) => {
    set((state) => ({
      messages: state.messages.map((message) =>
        message._id === messageId ? { ...message, status } : message
      ),
    }));
  });
},
  markMessagesAsSeen: async (userId) => {
    try {
      await Api.put(`/messages/mark-seen/${userId}`);
      const socket = useAuthStore.getState().socket;
      socket.emit("messagesSeen", { userId });
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  },

  updateMessageStatus: (userId, status) => {
    set((state) => ({
      messages: state.messages.map((message) =>
        message.senderId === userId ? { ...message, status } : message
      ),
    }));
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
