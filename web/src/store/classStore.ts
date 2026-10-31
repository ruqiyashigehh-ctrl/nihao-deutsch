import { create } from 'zustand';
import { apiGet } from '../api/client';
import type { RankType, RankItem, MyRank, ClassmateItem, PairingMethod } from '../types/domain';
import { getRankApi, getClassmatesApi, pairApi } from '../api/rankApi';

interface ClassItem {
  classId: string;
  className: string;
}

interface ClassState {
  classes: ClassItem[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  loadClasses: () => Promise<void>;
  rankType: RankType;
  rankList: RankItem[];
  myRank: MyRank | null;
  rankLoading: boolean;
  loadRank: (type: RankType) => Promise<void>;
  setRankType: (type: RankType) => void;
  classmates: ClassmateItem[];
  classmatesLoading: boolean;
  loadClassmates: () => Promise<void>;
  pair: (method: PairingMethod) => Promise<{ success: boolean; message: string }>;
}

export const useClassStore = create<ClassState>((set, get) => ({
  classes: [],
  loaded: false,
  loading: false,
  error: null,
  loadClasses: async () => {
    const { loaded, loading } = get();
    if (loaded || loading) return;
    set({ loading: true, error: null });
    try {
      const classes = await apiGet<ClassItem[]>('/auth/classes');
      set({ classes, loaded: true, loading: false, error: null });
    } catch (err: any) {
      set({ loading: false, error: err?.message ?? '班级列表加载失败' });
    }
  },
  rankType: 'reading',
  rankList: [],
  myRank: null,
  rankLoading: false,
  loadRank: async (type: RankType) => {
    set({ rankLoading: true });
    try {
      const { list, myRank } = await getRankApi(type);
      set({ rankList: list, myRank, rankType: type, rankLoading: false });
    } catch {
      set({ rankList: [], myRank: null, rankLoading: false });
    }
  },
  setRankType: (type: RankType) => set({ rankType: type }),
  classmates: [],
  classmatesLoading: false,
  loadClassmates: async () => {
    set({ classmatesLoading: true });
    try {
      const classmates = await getClassmatesApi();
      set({ classmates, classmatesLoading: false });
    } catch {
      set({ classmates: [], classmatesLoading: false });
    }
  },
  pair: async (method: PairingMethod) => {
    try {
      await pairApi(method);
      return { success: true, message: '组队成功' };
    } catch {
      return { success: false, message: '邀请码无效或非同班同学' };
    }
  },
}));