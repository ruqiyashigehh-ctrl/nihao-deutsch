import { create } from 'zustand';
import type { ClassInviteCode, PublishHomeworkPayload, AccuracyCell, AttendanceMatrix, GrammarAnalyticsData } from '../types/domain';
import { getInviteCodesApi, createHomeworkApi, getAccuracyApi, getAttendanceApi, patchAttendanceApi, getGrammarAnalyticsApi } from '../api/teacherApi';
import { useAdapter } from '../app/adapterProvider';

interface TeacherState {
  inviteCodes: ClassInviteCode[];
  inviteLoading: boolean;
  loadInviteCodes: () => Promise<void>;
  publishHomework: (payload: PublishHomeworkPayload) => Promise<{ success: boolean; message: string }>;
  accuracyMatrix: AccuracyCell[];
  attendance: AttendanceMatrix | null;
  grammarStats: GrammarAnalyticsData | null;
  analyticsLoading: boolean;
  loadAnalytics: (classId: string) => Promise<void>;
  patchAttendance: (studentId: string, date: string, checked: boolean) => Promise<void>;
  urge: (studentId: string, context: string) => Promise<{ success: boolean; message: string }>;
}

let lastUrgeAt = 0;

export const useTeacherStore = create<TeacherState>((set, get) => ({
  inviteCodes: [],
  inviteLoading: false,
  loadInviteCodes: async () => {
    set({ inviteLoading: true });
    try {
      const inviteCodes = await getInviteCodesApi();
      set({ inviteCodes, inviteLoading: false });
    } catch {
      set({ inviteCodes: [], inviteLoading: false });
    }
  },
  publishHomework: async (payload: PublishHomeworkPayload) => {
    try {
      const { homeworkId, targetUserIds } = await createHomeworkApi(payload);
      const { push } = useAdapter();
      for (const userId of targetUserIds) {
        try {
          await push.send(userId, 'homework_publish', { homeworkId, quizName: payload.quizType, deadline: payload.deadline });
        } catch {
          // 推送失败不影响主流程
        }
      }
      return { success: true, message: '发布成功' };
    } catch {
      return { success: false, message: '发布失败，请重试' };
    }
  },
  accuracyMatrix: [],
  attendance: null,
  grammarStats: null,
  analyticsLoading: false,
  loadAnalytics: async (classId: string) => {
    set({ analyticsLoading: true });
    try {
      const [accuracyMatrix, attendance, grammarStats] = await Promise.all([
        getAccuracyApi(classId),
        getAttendanceApi(classId),
        getGrammarAnalyticsApi(classId),
      ]);
      set({ accuracyMatrix, attendance, grammarStats, analyticsLoading: false });
    } catch {
      set({ accuracyMatrix: [], attendance: null, grammarStats: null, analyticsLoading: false });
    }
  },
  patchAttendance: async (studentId: string, date: string, checked: boolean) => {
    await patchAttendanceApi(studentId, date, checked);
    const { attendance } = get();
    if (attendance) {
      const rows = attendance.rows.map((r) => {
        if (r.studentId !== studentId) return r;
        const idx = attendance.dates.indexOf(date);
        if (idx < 0) return r;
        const cells = [...r.cells];
        cells[idx] = checked;
        return { ...r, cells };
      });
      set({ attendance: { ...attendance, rows } });
    }
  },
  urge: async (studentId: string, context: string) => {
    const now = Date.now();
    if (now - lastUrgeAt < 5000) {
      return { success: false, message: '操作过于频繁，请稍后重试' };
    }
    lastUrgeAt = now;
    try {
      const { push } = useAdapter();
      await push.send(studentId, 'checkin_reminder', { context });
      return { success: true, message: '催交通知已发送' };
    } catch {
      return { success: false, message: '催交发送失败，请重试' };
    }
  },
}));