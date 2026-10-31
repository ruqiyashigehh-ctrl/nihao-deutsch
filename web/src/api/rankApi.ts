import type { RankType, RankItem, MyRank, ClassmateItem, PairingMethod } from '../types/domain';
import { USE_MOCK } from '../app/env';
import { getRank, getClassmates, pairByCode, pairByClassmate } from './mock/rankMock';
import { apiGet, apiPost } from './client';

export function getRankApi(type: RankType): Promise<{ list: RankItem[]; myRank: MyRank }> {
  if (USE_MOCK) return getRank(type);
  return apiGet(`/student/class/rank?type=${type}`);
}

export function getClassmatesApi(): Promise<ClassmateItem[]> {
  if (USE_MOCK) return getClassmates();
  return apiGet<ClassmateItem[]>('/student/class/classmates');
}

export async function pairApi(method: PairingMethod): Promise<void> {
  if (USE_MOCK) {
    if (method.kind === 'code') return pairByCode(method.code!);
    return pairByClassmate(method.classmateId!);
  }
  const path = method.kind === 'code' ? '/student/class/pair/code' : '/student/class/pair/classmate';
  const body = method.kind === 'code' ? { code: method.code } : { classmateId: method.classmateId };
  return apiPost(path, body);
}