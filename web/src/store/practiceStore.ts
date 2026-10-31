import { create } from 'zustand';

interface PendingSubmission {
  exerciseId: string;
  userAnswer: string;
  queuedAt: number;
}

const PENDING_KEY = 'sprung_pending_submissions';

function loadPending(): PendingSubmission[] {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePending(items: PendingSubmission[]): void {
  localStorage.setItem(PENDING_KEY, JSON.stringify(items));
}

interface PracticeState {
  drafts: Record<string, string>;
  pending: PendingSubmission[];
  setDraft: (exerciseId: string, answer: string) => void;
  getDraft: (exerciseId: string) => string;
  clearDraft: (exerciseId: string) => void;
  enqueue: (exerciseId: string, userAnswer: string) => void;
  dequeue: () => PendingSubmission | undefined;
  removePending: (exerciseId: string) => void;
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  drafts: {},
  pending: loadPending(),
  setDraft: (exerciseId, answer) =>
    set((state) => ({ drafts: { ...state.drafts, [exerciseId]: answer } })),
  getDraft: (exerciseId) => get().drafts[exerciseId] ?? '',
  clearDraft: (exerciseId) =>
    set((state) => {
      const drafts = { ...state.drafts };
      delete drafts[exerciseId];
      return { drafts };
    }),
  enqueue: (exerciseId, userAnswer) =>
    set((state) => {
      const pending = [...state.pending, { exerciseId, userAnswer, queuedAt: Date.now() }];
      savePending(pending);
      return { pending };
    }),
  dequeue: () => {
    const pending = get().pending;
    if (pending.length === 0) return undefined;
    const [first, ...rest] = pending;
    savePending(rest);
    set({ pending: rest });
    return first;
  },
  removePending: (exerciseId) =>
    set((state) => {
      const pending = state.pending.filter((p) => p.exerciseId !== exerciseId);
      savePending(pending);
      return { pending };
    }),
}));