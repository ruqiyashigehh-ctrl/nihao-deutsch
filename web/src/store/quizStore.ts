import { create } from 'zustand';
import type { QuizConfig, QuizQuestionData, QuizResultData, WrongQuestion } from '../types/domain';
import { USE_MOCK } from '../app/env';
import { getQuizQuestions } from '../api/mock/quizMock';
import { apiGet, apiPost } from '../api/client';

interface QuizAnswerDetailPayload {
  questionId: string;
  question: string;
  questionKind: 'choice' | 'fill';
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  lektion?: number | null;
  grammarId?: string | null;
}

interface QuizState {
  config: QuizConfig | null;
  questions: QuizQuestionData[];
  currentIndex: number;
  answers: Record<string, string>;
  result: QuizResultData | null;
  loading: boolean;
  setConfig: (config: QuizConfig) => void;
  loadQuestions: () => Promise<void>;
  setAnswer: (questionId: string, answer: string) => void;
  prev: () => void;
  next: () => void;
  submit: () => void;
  reset: () => void;
  canStart: () => boolean;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  config: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  result: null,
  loading: false,
  setConfig: (config) => set({ config }),
  loadQuestions: async () => {
    const { config } = get();
    if (!config) return;
    set({ loading: true });
    try {
      let questions: QuizQuestionData[];
      if (USE_MOCK) {
        questions = getQuizQuestions(config);
      } else {
        const lektionParam = config.lektionRange.length > 0
          ? `&lektionRange=${config.lektionRange.join(',')}`
          : '';
        questions = await apiGet<QuizQuestionData[]>(
          `/quiz/questions?type=${config.type}&count=${config.questionCount}${lektionParam}`,
        );
      }
      set({ questions, currentIndex: 0, answers: {}, loading: false });
    } catch {
      set({ questions: [], loading: false });
    }
  },
  setAnswer: (questionId, answer) => set((state) => ({
    answers: { ...state.answers, [questionId]: answer },
  })),
  prev: () => set((state) => ({
    currentIndex: Math.max(0, state.currentIndex - 1),
  })),
  next: () => set((state) => ({
    currentIndex: Math.min(state.questions.length - 1, state.currentIndex + 1),
  })),
  submit: () => {
    const { questions, answers, config } = get();
    let correctCount = 0;
    const wrongQuestions: WrongQuestion[] = [];
    const details: QuizAnswerDetailPayload[] = [];
    for (const q of questions) {
      const userAnswer = answers[q.questionId] ?? '';
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) {
        correctCount++;
      } else {
        wrongQuestions.push({
          questionId: q.questionId,
          question: q.question,
          userAnswer: userAnswer || '（未作答）',
          correctAnswer: q.correctAnswer,
        });
      }
      details.push({
        questionId: q.questionId,
        question: q.question,
        questionKind: q.type,
        userAnswer: userAnswer || '（未作答）',
        correctAnswer: q.correctAnswer,
        isCorrect,
        lektion: q.lektion ?? null,
        grammarId: q.grammarId ?? null,
      });
    }
    const wrongCount = questions.length - correctCount;
    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    set({ result: { score, correctCount, wrongCount, wrongQuestions } });

    if (!USE_MOCK && config && questions.length > 0) {
      void apiPost('/quiz/result', {
        type: config.type,
        score,
        correctCount,
        totalCount: questions.length,
        details,
      }).catch(() => undefined);
    }
  },
  reset: () => set({ config: null, questions: [], currentIndex: 0, answers: {}, result: null, loading: false }),
  canStart: () => {
    const { config } = get();
    return !!config && config.lektionRange.length > 0 && config.questionCount != null;
  },
}));