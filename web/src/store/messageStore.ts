import { create } from 'zustand';

interface MessageState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrement: () => void;
  increment: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrement: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  increment: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
}));