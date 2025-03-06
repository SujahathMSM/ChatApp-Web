import { create } from "zustand";
import { Api } from "../lib/api";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import { useChatStore } from "./useChatStore";

const BASE_URL = "http://localhost:5001";
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,

  isCheckingAuth: true,

  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await Api.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("An error occurred: " + error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await Api.post("/auth/signup", data);
      set({ authUser: res.data });
      get().connectSocket();
      get().socket?.emit("userOnline");
      toast.success("Account Created Successfully");
    } catch (error) {
      console.log("An error occurred during sign up: " + error);
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: async () => {
    try {
      await Api.post("/auth/logout");
      set({ authUser: null });
      get().disConnectSocket();
      toast.success("Logged out successfully");
    } catch (error) {
      console.log("An error occurred during logout");
      toast.error(error.response.data.message);
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await Api.post("/auth/login", data);
      set({ authUser: res.data });
      get().connectSocket();
      get().socket?.emit("userOnline");
      toast.success("Login successful");
    } catch (error) {
      console.log("An error occurred during login: ", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await Api.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();

    if (!authUser || get().socket?.connected) return;
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    socket.on("messagesSeen", ({ userId }) => {
      // Update your chat store to mark messages as seen
      useChatStore.getState().updateMessageStatus(userId, "seen");
    });
  },

  disConnectSocket: () => {
    if (get().socket?.connected) get().socket?.disconnect();
  },
}));
