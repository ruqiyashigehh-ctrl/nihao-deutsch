import type { LektionMastery } from '../../types/domain';

const MOCK_NOTEBOOK_IDS: string[] = ['w01', 'w03', 'w05'];

export function getNotebookIds(): Promise<string[]> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_NOTEBOOK_IDS), 200));
}

export function toggleNotebook(wordId: string): Promise<{ added: boolean }> {
  return new Promise((resolve) => setTimeout(() => {
    const idx = MOCK_NOTEBOOK_IDS.indexOf(wordId);
    if (idx >= 0) {
      MOCK_NOTEBOOK_IDS.splice(idx, 1);
      resolve({ added: false });
    } else {
      MOCK_NOTEBOOK_IDS.push(wordId);
      resolve({ added: true });
    }
  }, 200));
}

export function getMastery(lektion: number): Promise<LektionMastery> {
  return new Promise((resolve) => setTimeout(() => {
    const total = 40;
    const mastered = Math.floor(Math.random() * 30) + 5;
    resolve({ lektion, total, mastered });
  }, 200));
}