import { create } from 'zustand';
import type { StudyCardData } from '../types/domain';
import { USE_MOCK } from '../app/env';
import { getTodayWords } from '../api/mock/studyMock';
import { apiGet } from '../api/client';

type MarkStatus = 'known' | 'unknown';

interface StudyState {
  words: StudyCardData[];
  currentIndex: number;
  isFlipped: boolean;
  results: Record<string, MarkStatus>;
  loading: boolean;
  loadTodayWords: () => Promise<void>;
  flip: () => void;
  mark: (status: MarkStatus) => void;
  reset: () => void;
  isComplete: () => boolean;
}

export const useStudyStore = create<StudyState>((set, get) => ({
  words: [],
  currentIndex: 0,
  isFlipped: false,
  results: {},
  loading: false,
  loadTodayWords: async () => {
    set({ loading: true });
    try {
      let words: StudyCardData[];
      if (USE_MOCK) {
        words = getTodayWords();
      } else {
        words = await apiGet<StudyCardData[]>('/study/today');
      }
      set({ words, currentIndex: 0, isFlipped: false, results: {}, loading: false });
    } catch {
      set({ words: [], loading: false });
    }
  },
  flip: () => set((state) => ({ isFlipped: !state.isFlipped })),
  mark: (status) => set((state) => {
    const currentWord = state.words[state.currentIndex];
    if (!currentWord) return state;
    return {
      results: { ...state.results, [currentWord.wordId]: status },
      currentIndex: state.currentIndex + 1,
      isFlipped: false,
    };
  }),
  reset: () => set({ words: [], currentIndex: 0, isFlipped: false, results: {}, loading: false }),
  isComplete: () => {
    const { currentIndex, words } = get();
    return currentIndex >= words.length;
  },
}));