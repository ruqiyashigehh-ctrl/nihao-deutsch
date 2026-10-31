import { create } from 'zustand';
import type { Difficulty, WordListItem } from '@nihao-deutsch/shared';
import type { LektionMastery } from '../types/domain';
import { getNotebookIdsApi, toggleNotebookApi, getMasteryApi } from '../api/notebookApi';

interface WordFilter {
  course?: string;
  difficulty?: Difficulty;
  keyword?: string;
}

interface WordState {
  items: WordListItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  filter: WordFilter;
  loading: boolean;
  setItems: (items: WordListItem[], total: number, hasMore: boolean) => void;
  appendItems: (items: WordListItem[], total: number, hasMore: boolean) => void;
  setFilter: (filter: WordFilter) => void;
  setPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  notebookIds: string[];
  mastery: LektionMastery | null;
  loadNotebookIds: () => Promise<void>;
  toggleNotebook: (wordId: string) => Promise<{ success: boolean; message: string }>;
  loadMastery: (lektion: number) => Promise<void>;
}

export const useWordStore = create<WordState>((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  pageSize: 50,
  hasMore: false,
  filter: {},
  loading: false,
  setItems: (items, total, hasMore) => set({ items, total, hasMore }),
  appendItems: (items, total, hasMore) =>
    set((state) => ({ items: [...state.items, ...items], total, hasMore })),
  setFilter: (filter) => set({ filter, page: 1, items: [] }),
  setPage: (page) => set({ page }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ items: [], total: 0, page: 1, hasMore: false, filter: {} }),
  notebookIds: [],
  mastery: null,
  loadNotebookIds: async () => {
    try {
      const ids = await getNotebookIdsApi();
      set({ notebookIds: ids });
    } catch {
      set({ notebookIds: [] });
    }
  },
  toggleNotebook: async (wordId: string) => {
    const { notebookIds } = get();
    if (notebookIds.includes(wordId)) {
      return { success: false, message: '该单词已在生词本中' };
    }
    try {
      const { added } = await toggleNotebookApi(wordId);
      if (added) {
        set({ notebookIds: [...notebookIds, wordId] });
        return { success: true, message: '已加入生词本' };
      }
      return { success: false, message: '加入失败，请重试' };
    } catch {
      return { success: false, message: '加入失败，请重试' };
    }
  },
  loadMastery: async (lektion: number) => {
    try {
      const mastery = await getMasteryApi(lektion);
      set({ mastery });
    } catch {
      set({ mastery: null });
    }
  },
}));