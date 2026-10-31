import type { CheckinPointItem, ClassWithTeacher, StudentWithClass, AdminStats, CheckinTrend, GrammarPointInput } from '../types/domain';
import type { WordListItem } from '@nihao-deutsch/shared';
import { USE_MOCK } from '../app/env';
import {
  getCheckinPoints, createCheckinPoint, toggleCheckinPoint,
  getClassesWithTeacher, getStudentsWithClass, bindTeacher, resetPassword,
  getStats, getTrend,
} from './mock/adminMock';
import { apiGet, apiPost, apiPatch, apiPut } from './client';

export function getCheckinPointsApi(): Promise<CheckinPointItem[]> {
  if (USE_MOCK) return getCheckinPoints();
  return apiGet<CheckinPointItem[]>('/admin/checkin-points');
}

export function createCheckinPointApi(input: Omit<CheckinPointItem, 'checkpointId'>): Promise<CheckinPointItem> {
  if (USE_MOCK) return createCheckinPoint(input);
  return apiPost<CheckinPointItem>('/admin/checkin-points', input);
}

export function toggleCheckinPointApi(id: string, status: 'enabled' | 'disabled'): Promise<void> {
  if (USE_MOCK) return toggleCheckinPoint(id, status);
  return apiPatch(`/admin/checkin-points/${id}/status`, { status });
}

export function getClassesWithTeacherApi(): Promise<ClassWithTeacher[]> {
  if (USE_MOCK) return getClassesWithTeacher();
  return apiGet<ClassWithTeacher[]>('/admin/classes');
}

export function getStudentsWithClassApi(): Promise<StudentWithClass[]> {
  if (USE_MOCK) return getStudentsWithClass();
  return apiGet<StudentWithClass[]>('/admin/students');
}

export function bindTeacherApi(classId: string, teacherId: string): Promise<void> {
  if (USE_MOCK) return bindTeacher(classId, teacherId);
  return apiPut(`/admin/classes/${classId}/teacher`, { teacherId });
}

export function resetPasswordApi(userId: string): Promise<void> {
  if (USE_MOCK) return resetPassword(userId);
  return apiPost(`/admin/students/${userId}/reset-password`, {});
}

export function getWordsByLektionApi(lektion: number): Promise<WordListItem[]> {
  if (USE_MOCK) return Promise.resolve([]);
  return apiGet<WordListItem[]>(`/admin/words?lektion=${lektion}`);
}

export function getStatsApi(): Promise<AdminStats> {
  if (USE_MOCK) return getStats();
  return apiGet<AdminStats>('/admin/dashboard/stats');
}

export function getTrendApi(): Promise<CheckinTrend> {
  if (USE_MOCK) return getTrend();
  return apiGet<CheckinTrend>('/admin/dashboard/trend');
}

export function saveGrammarPointApi(input: GrammarPointInput): Promise<void> {
  if (USE_MOCK) return new Promise((resolve) => setTimeout(() => resolve(), 300));
  return apiPost('/admin/grammar-points', input);
}