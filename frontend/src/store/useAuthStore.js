import { create } from "zustand";
import Cookies from "js-cookie";
import axios from "axios";

const BASE_URL = "https://veda-bj5v.onrender.com";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: false,
  onlineUsers: [],
  token: null,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {

      // If token exists but offline → restore from localStorage
      if (!navigator.onLine) {
        const cached = localStorage.getItem("authUser");
        if (cached) {
          const parsed = JSON.parse(cached);
          // Validate: if it's wrapped in {user, token}, extract user; else use as-is
          const user = parsed.user ? parsed.user : parsed;
          if (user && typeof user === 'object' && user.role) {
            set({ authUser: user, isCheckingAuth: false });
            console.log("Restored auth from localStorage while offline.");
            return;
          } else {
            // Invalid data: clear and treat as unauthenticated
            localStorage.removeItem("authUser");
          }
        }
      }

      // Otherwise, check backend
      const res = await axios.get(BASE_URL + "/api/user/check", {
        withCredentials: true,
      });

      set({ authUser: res.data.user });
      set({ token: res.data.token });
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


    signup:async (data) => {
        set({ isSigningUp: true });
            try {
                const res = await axios.post(BASE_URL + "/api/user/signup", data, { withCredentials: true });
                console.log(res.data);
                
                set({ authUser: res.data });
            } catch (error) {
              alert('account creation Failed or mail already existed')

              console.log(data);
              console.log(error)
            } finally {
                set({ isSigningUp: false });
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
