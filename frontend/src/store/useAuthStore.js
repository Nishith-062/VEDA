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
  token: null,

  // Check authentication (offline support included)
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      if (!navigator.onLine) {
        const cached = localStorage.getItem("authUser");
        if (cached) {
          const parsed = JSON.parse(cached);
          const user = parsed.user ? parsed.user : parsed;
          if (user && typeof user === "object" && user.role) {
            set({ authUser: user, token: parsed.token || null, isCheckingAuth: false });
            console.log("Restored auth from localStorage while offline.");
            return;
          } else {
            localStorage.removeItem("authUser");
          }
        }
      }

      const res = await axios.get(`${BASE_URL}/api/user/check`, {
        withCredentials: true,
      });

      set({ authUser: res.data.user, token: res.data.token });
      localStorage.setItem("authUser", JSON.stringify(res.data));
    } catch (error) {
      if (navigator.onLine) {
        set({ authUser: null, token: null });
        localStorage.removeItem("authUser");
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // Login
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axios.post(`${BASE_URL}/api/user/login`, data, {
        withCredentials: true,
      });

      // Backend should return: { user: {...}, token: "...", verified: true/false }
      const { user, token } = res.data;
      set({ authUser: user, token });
      localStorage.setItem("authUser", JSON.stringify(res.data));

      return res.data; // includes user, token, verified
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // Signup
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axios.post(`${BASE_URL}/api/user/signup`, data, { withCredentials: true });
      const { user, token } = res.data;

      set({ authUser: user, token });
      localStorage.setItem("authUser", JSON.stringify(res.data));

      return res.data;
    } catch (error) {
      alert("Account creation failed or email already exists.");
      console.error("Signup error:", error);
      throw error;
    } finally {
      set({ isSigningUp: false });
    }
  },

  // Logout
  logout: async () => {
    try {
      await axios.post(`${BASE_URL}/api/user/logout`, {}, { withCredentials: true });
      set({ authUser: null, token: null });
      localStorage.removeItem("authUser");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },
}));
