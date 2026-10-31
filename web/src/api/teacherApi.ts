import type { ClassInviteCode, PublishHomeworkPayload, AccuracyCell, AttendanceMatrix, GrammarAnalyticsData, ReportDetailData } from '../types/domain';
import { USE_MOCK } from '../app/env';
import { getInviteCodes, getAccuracy, getAttendance, patchAttendance, createHomework, getGrammarAnalytics } from './mock/teacherMock';
import { apiGet, apiPost, apiPatch } from './client';

export function getInviteCodesApi(): Promise<ClassInviteCode[]> {
  if (USE_MOCK) return getInviteCodes();
  return apiGet<ClassInviteCode[]>('/teacher/invite-codes');
}

export function createHomeworkApi(payload: PublishHomeworkPayload): Promise<{ homeworkId: string; targetUserIds: string[] }> {
  if (USE_MOCK) return createHomework(payload);
  return apiPost<{ homeworkId: string; targetUserIds: string[] }>('/teacher/homework', payload);
}

export function getAccuracyApi(classId: string): Promise<AccuracyCell[]> {
  if (USE_MOCK) return getAccuracy(classId);
  return apiGet<AccuracyCell[]>(`/teacher/analytics/accuracy?classId=${classId}`);
}

export function getAttendanceApi(classId: string): Promise<AttendanceMatrix> {
  if (USE_MOCK) return getAttendance(classId);
  return apiGet<AttendanceMatrix>(`/teacher/analytics/attendance?classId=${classId}`);
}

export function patchAttendanceApi(studentId: string, date: string, checked: boolean): Promise<void> {
  if (USE_MOCK) return patchAttendance(studentId, date, checked);
  return apiPatch('/teacher/analytics/attendance/cell', { studentId, date, checked });
}
export function getGrammarAnalyticsApi(classId: string): Promise<GrammarAnalyticsData> {
  if (USE_MOCK) return getGrammarAnalytics(classId);
  return apiGet<GrammarAnalyticsData>(`/teacher/analytics/grammar?classId=${classId}`);
}

export function getStudentReportApi(studentId: string): Promise<ReportDetailData> {
  return apiGet<ReportDetailData>(`/teacher/students/${studentId}/report`);
}