import type { HomeworkCardData } from '../types/domain';
import { USE_MOCK } from '../app/env';
import { getPendingHomework } from './mock/homeworkMock';
import { apiGet } from './client';

export function getPendingHomeworkApi(): Promise<HomeworkCardData[]> {
  if (USE_MOCK) return getPendingHomework();
  return apiGet<HomeworkCardData[]>('/student/homework/pending');
}