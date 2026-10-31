import type { HomeworkCardData } from '../../types/domain';

const MOCK_HOMEWORK: HomeworkCardData[] = [
  { homeworkId: 'hw01', quizName: 'Lektion 3 词汇测验', deadline: '2026-10-25 23:59', status: 'pending' },
  { homeworkId: 'hw02', quizName: 'Lektion 5 语法测验', deadline: '2026-10-27 23:59', status: 'pending' },
];

export function getPendingHomework(): Promise<HomeworkCardData[]> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_HOMEWORK), 300));
}