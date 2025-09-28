// store/useAuthStore.js
import { create } from "zustand";
import axios from "axios";

const BASE_URL = "http://localhost:3000";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: false,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axios.get(BASE_URL + "/api/user/check", {
        withCredentials: true, // include cookies if needed
      });
      set({ authUser: res.data });
    } catch (error) {
      // console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axios.post(BASE_URL + "/api/user/login", data, {
        withCredentials: true,
      });
      set({ authUser: res.data });
      return res.data; // return user to handle navigation in component
    } catch (error) {
      console.log(error);
      throw error; // rethrow so component can catch
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axios.post(
        BASE_URL + "/api/user/logout",
        {},
        { withCredentials: true }
      );
      set({ authUser: null });
    } catch (error) {
      console.log("Error in logout:", error);
    }
  }
}));
