import type { LektionMastery } from '../types/domain';
import { USE_MOCK } from '../app/env';
import { getNotebookIds, toggleNotebook, getMastery } from './mock/notebookMock';
import { apiGet, apiPost } from './client';

export function getNotebookIdsApi(): Promise<string[]> {
  if (USE_MOCK) return getNotebookIds();
  return apiGet<string[]>('/student/notebook/ids');
}

export function toggleNotebookApi(wordId: string): Promise<{ added: boolean }> {
  if (USE_MOCK) return toggleNotebook(wordId);
  return apiPost<{ added: boolean }>('/student/notebook/toggle', { wordId });
}

export function getMasteryApi(lektion: number): Promise<LektionMastery> {
  if (USE_MOCK) return getMastery(lektion);
  return apiGet<LektionMastery>(`/student/words/mastery?lektion=${lektion}`);
}