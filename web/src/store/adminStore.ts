import { create } from 'zustand';
import type { CheckinPointItem, ClassWithTeacher, StudentWithClass, AdminStats, CheckinTrend, GrammarPointInput } from '../types/domain';
import {
  getCheckinPointsApi, createCheckinPointApi, toggleCheckinPointApi,
  getClassesWithTeacherApi, getStudentsWithClassApi, bindTeacherApi, resetPasswordApi,
  getStatsApi, getTrendApi, saveGrammarPointApi,
} from '../api/adminApi';

interface AdminState {
  checkinPoints: CheckinPointItem[];
  checkinLoading: boolean;
  loadCheckinPoints: () => Promise<void>;
  createCheckinPoint: (input: Omit<CheckinPointItem, 'checkpointId'>) => Promise<{ success: boolean; message: string }>;
  toggleCheckinPoint: (id: string, status: 'enabled' | 'disabled') => Promise<void>;
  classesWithTeacher: ClassWithTeacher[];
  studentsWithClass: StudentWithClass[];
  loadClassesWithTeacher: () => Promise<void>;
  loadStudentsWithClass: () => Promise<void>;
  bindTeacher: (classId: string, teacherId: string) => Promise<void>;
  resetPassword: (userId: string) => Promise<void>;
  stats: AdminStats | null;
  trend: CheckinTrend | null;
  loadStats: () => Promise<void>;
  loadTrend: () => Promise<void>;
  saveGrammarPoint: (input: GrammarPointInput) => Promise<{ success: boolean; message: string }>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  checkinPoints: [],
  checkinLoading: false,
  loadCheckinPoints: async () => {
    set({ checkinLoading: true });
    try {
      const checkinPoints = await getCheckinPointsApi();
      set({ checkinPoints, checkinLoading: false });
    } catch {
      set({ checkinPoints: [], checkinLoading: false });
    }
  },
  createCheckinPoint: async (input) => {
    if (input.longitude < -180 || input.longitude > 180 || input.latitude < -90 || input.latitude > 90) {
      return { success: false, message: '经纬度格式不合法' };
    }
    const { checkinPoints } = get();
    if (checkinPoints.some((p) => p.name === input.name)) {
      return { success: false, message: '打卡点名称已存在' };
    }
    try {
      const point = await createCheckinPointApi(input);
      set({ checkinPoints: [...checkinPoints, point] });
      return { success: true, message: '创建成功' };
    } catch {
      return { success: false, message: '创建失败，请重试' };
    }
  },
  toggleCheckinPoint: async (id, status) => {
    await toggleCheckinPointApi(id, status);
    const { checkinPoints } = get();
    set({ checkinPoints: checkinPoints.map((p) => p.checkpointId === id ? { ...p, status } : p) });
  },
  classesWithTeacher: [],
  studentsWithClass: [],
  loadClassesWithTeacher: async () => {
    try {
      const classesWithTeacher = await getClassesWithTeacherApi();
      set({ classesWithTeacher });
    } catch { set({ classesWithTeacher: [] }); }
  },
  loadStudentsWithClass: async () => {
    try {
      const studentsWithClass = await getStudentsWithClassApi();
      set({ studentsWithClass });
    } catch { set({ studentsWithClass: [] }); }
  },
  bindTeacher: async (classId, teacherId) => {
    await bindTeacherApi(classId, teacherId);
    const { classesWithTeacher } = get();
    set({ classesWithTeacher: classesWithTeacher.map((c) => c.classId === classId ? { ...c, teacherId } : c) });
  },
  resetPassword: async (userId) => {
    await resetPasswordApi(userId);
  },
  stats: null,
  trend: null,
  loadStats: async () => {
    try {
      const stats = await getStatsApi();
      set({ stats });
    } catch { set({ stats: null }); }
  },
  loadTrend: async () => {
    try {
      const trend = await getTrendApi();
      set({ trend });
    } catch { set({ trend: null }); }
  },
  saveGrammarPoint: async (input) => {
    if (input.exercises.length < 10) {
      return { success: false, message: '每个语法点至少录入 10 道题' };
    }
    if (!input.ruleText.trim()) {
      return { success: false, message: '请填写语法点讲解正文' };
    }
    try {
      await saveGrammarPointApi(input);
      return { success: true, message: '保存成功' };
    } catch {
      return { success: false, message: '保存失败，请重试' };
    }
  },
}));