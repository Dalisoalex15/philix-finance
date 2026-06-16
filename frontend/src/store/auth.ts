import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockUser } from "../lib/mock-data";

interface AuthUser {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  branch?: { id: string; name: string; code: string } | null;
  mfaEnabled: boolean;
  avatarUrl: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Demo: pre-authenticated as Daliso Phiri (CEO/Super Admin)
      user: mockUser as AuthUser,
      accessToken: "demo-token",
      isAuthenticated: true,
      setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: "philix-auth",
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, isAuthenticated: state.isAuthenticated }),
    }
  )
);
