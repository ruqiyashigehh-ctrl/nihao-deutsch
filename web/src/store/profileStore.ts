import { create } from 'zustand';
import type { UserProfileData, StudyStatsData, HeatmapData, ReportWeekData, ReportDetailData } from '../types/domain';
import { USE_MOCK } from '../app/env';
import { getUserProfile, getStudyStats, getHeatmap, getReportData } from '../api/mock/profileMock';
import { apiGet } from '../api/client';

interface ProfileState {
  userProfile: UserProfileData | null;
  studyStats: StudyStatsData | null;
  heatmap: HeatmapData[];
  reportData: ReportWeekData[];
  reportDetail: ReportDetailData | null;
  loading: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  loadReport: () => Promise<void>;
  loadReportDetail: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  userProfile: null,
  studyStats: null,
  heatmap: [],
  reportData: [],
  reportDetail: null,
  loading: false,
  error: null,
  loadProfile: async () => {
    set({ loading: true, error: null });
    let userProfile: UserProfileData | null = null;
    let studyStats: StudyStatsData | null = null;
    let heatmap: HeatmapData[] = [];
    let error: string | null = null;

    const tasks: Promise<void>[] = [
      (async () => {
        try {
          userProfile = USE_MOCK ? getUserProfile() : await apiGet<UserProfileData>('/profile/user');
        } catch { error = '用户信息加载失败'; }
      })(),
      (async () => {
        try {
          studyStats = USE_MOCK ? getStudyStats() : await apiGet<StudyStatsData>('/profile/stats');
        } catch { if (!error) error = '学习统计加载失败'; }
      })(),
      (async () => {
        try {
          heatmap = USE_MOCK ? getHeatmap() : await apiGet<HeatmapData[]>('/profile/heatmap');
        } catch { if (!error) error = '热力图加载失败'; }
      })(),
    ];

    await Promise.all(tasks);
    set({ userProfile, studyStats, heatmap, loading: false, error });
  },
  loadReport: async () => {
    try {
      const reportData = USE_MOCK ? getReportData() : await apiGet<ReportWeekData[]>('/profile/report');
      set({ reportData });
    } catch {
      set({ reportData: [] });
    }
  },
  loadReportDetail: async () => {
    try {
      if (USE_MOCK) {
        set({ reportDetail: { weakGrammars: [], wrongQuestions: [], wrongCount: 0 } });
        return;
      }
      const reportDetail = await apiGet<ReportDetailData>('/profile/report-detail');
      set({ reportDetail });
    } catch {
      set({ reportDetail: null });
    }
  },
}));