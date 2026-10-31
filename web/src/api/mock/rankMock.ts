import type { RankItem, MyRank, RankType, ClassmateItem } from '../../types/domain';

function generateRank(type: RankType): { list: RankItem[]; myRank: MyRank } {
  const list: RankItem[] = [];
  for (let i = 1; i <= 50; i++) {
    list.push({
      rank: i,
      studentId: `s${String(i).padStart(3, '0')}`,
      name: `同学${i}`,
      value: type === 'reading' ? Math.max(0, 30 - Math.floor(i / 2)) : Math.max(0, 500 - i * 8),
      isMe: i === 35,
    });
  }
  const myRank: MyRank = { rank: 35, name: '张同学', value: type === 'reading' ? 12 : 220 };
  return { list, myRank };
}

const MOCK_CLASSMATES: ClassmateItem[] = Array.from({ length: 15 }, (_, i) => ({
  studentId: `s${String(i + 1).padStart(3, '0')}`,
  name: `同学${i + 1}`,
  studentNo: `2026${String(i + 1).padStart(3, '0')}`,
}));

export function getRank(type: RankType): Promise<{ list: RankItem[]; myRank: MyRank }> {
  return new Promise((resolve) => setTimeout(() => resolve(generateRank(type)), 200));
}

export function getClassmates(): Promise<ClassmateItem[]> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_CLASSMATES), 200));
}

export function pairByCode(code: string): Promise<void> {
  return new Promise((resolve, reject) => setTimeout(() => {
    if (code.length === 6) resolve();
    else reject(new Error('邀请码无效或非同班同学'));
  }, 300));
}

export function pairByClassmate(classmateId: string): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), 300));
}