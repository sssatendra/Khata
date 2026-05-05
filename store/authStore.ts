import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { authService } from "../services/auth";
import { User } from "../types";

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  phoneNumber: string;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setPhoneNumber: (phone: string) => void;
  signOut: () => Promise<void>;
  persistAuth: () => Promise<void>;
  restoreAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAuthenticated: false,
  phoneNumber: "",

  setUser: (user) =>
    set(() => ({
      user,
      isAuthenticated: !!user,
    })),

  setLoading: (loading) => set(() => ({ loading })),

  setPhoneNumber: (phoneNumber) => set(() => ({ phoneNumber })),

  signOut: async () => {
    try {
      await authService.signOut();
      await AsyncStorage.removeItem("userSession");
      set(() => ({
        user: null,
        isAuthenticated: false,
        phoneNumber: "",
      }));
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  },

  persistAuth: async () => {
    const { user } = useAuthStore.getState();
    if (user) {
      await AsyncStorage.setItem(
        "userSession",
        JSON.stringify({
          userId: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          shopId: user.shopId,
        }),
      );
    }
  },

  restoreAuth: async () => {
    try {
      set(() => ({ loading: true }));
      const savedSession = await AsyncStorage.getItem("userSession");
      if (savedSession) {
        const user = JSON.parse(savedSession);
        set(() => ({
          user: {
            ...user,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          isAuthenticated: true,
        }));
      }
      set(() => ({ loading: false }));
    } catch (error) {
      console.error("Error restoring auth:", error);
      set(() => ({ loading: false }));
    }
  },
}));
