import { create } from "zustand";
import Cookies from "js-cookie";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: false,
  onlineUsers: [],

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const token = Cookies.get("jwt");

      // If token exists but offline → restore from localStorage
      if (!navigator.onLine) {
        const cached = localStorage.getItem("authUser");
    
        if (cached) {
          set({ authUser: JSON.parse(cached), isCheckingAuth: false });
          console.log("Restored auth from localStorage while offline.");
          return;
        }
      }

      // Otherwise, check backend
      const res = await axios.get(BASE_URL + "/api/user/check", {
        withCredentials: true,
      });

      set({ authUser: res.data });
      localStorage.setItem("authUser", JSON.stringify(res.data));
    } catch (error) {
      if (navigator.onLine) {
        set({ authUser: null });
        localStorage.removeItem("authUser");
      }
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
      localStorage.setItem("authUser", JSON.stringify(res.data));
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axios.post(BASE_URL + "/api/user/logout", {}, { withCredentials: true });
      set({ authUser: null });
      localStorage.removeItem("authUser");
    } catch (error) {
      console.log("Error in logout:", error);
    }
  },
}));
