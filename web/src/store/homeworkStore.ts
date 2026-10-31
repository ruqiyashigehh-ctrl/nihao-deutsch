import { create } from 'zustand';
import type { HomeworkCardData } from '../types/domain';
import { getPendingHomeworkApi } from '../api/homeworkApi';

interface HomeworkState {
  pendingList: HomeworkCardData[];
  loading: boolean;
  error: string | null;
  loadPending: () => Promise<void>;
}

export const useHomeworkStore = create<HomeworkState>((set) => ({
  pendingList: [],
  loading: false,
  error: null,
  loadPending: async () => {
    set({ loading: true, error: null });
    try {
      const pendingList = await getPendingHomeworkApi();
      set({ pendingList, loading: false });
    } catch {
      set({ pendingList: [], loading: false, error: '作业加载失败' });
    }
  },
}));