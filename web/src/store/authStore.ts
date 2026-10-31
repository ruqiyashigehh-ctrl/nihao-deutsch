import { create } from 'zustand';
import type { Role } from '@nihao-deutsch/shared';

interface AuthState {
  userId: string | null;
  studentNo: string | null;
  name: string | null;
  classId: string | null;
  role: Role | null;
  isFirstBind: boolean;
  isAuthenticated: boolean;
  setAuth: (auth: {
    userId: string;
    studentNo: string;
    name: string;
    classId: string | null;
    role: Role;
    isFirstBind: boolean;
  }) => void;
  setBound: () => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  studentNo: null,
  name: null,
  classId: null,
  role: null,
  isFirstBind: false,
  isAuthenticated: false,
  setAuth: (auth) =>
    set({
      userId: auth.userId,
      studentNo: auth.studentNo,
      name: auth.name,
      classId: auth.classId,
      role: auth.role,
      isFirstBind: auth.isFirstBind,
      isAuthenticated: true,
    }),
  setBound: () => set({ isFirstBind: false }),
  clear: () =>
    set({
      userId: null,
      studentNo: null,
      name: null,
      classId: null,
      role: null,
      isFirstBind: false,
      isAuthenticated: false,
    }),
}));