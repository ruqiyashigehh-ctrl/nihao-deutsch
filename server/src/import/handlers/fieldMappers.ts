const difficultyMap: Record<string, string> = {
  easy: '初级',
  medium: '中级',
  hard: '高级',
};

export function mapDifficulty(value: string | null | undefined): string {
  if (!value) return '初级';
  const key = String(value).toLowerCase().trim();
  return difficultyMap[key] ?? '初级';
}

export function mapBoolCn(value: string | null | undefined): boolean {
  if (value == null) return false;
  const s = String(value).toLowerCase().trim();
  if (s === '是' || s === 'true' || s === '1' || s === 'yes' || s === 'y') return true;
  if (s === '否' || s === 'false' || s === '0' || s === 'no' || s === 'n') return false;
  return false;
}

export function validateTimeRange(start: string, end: string): boolean {
  return end > start;
}

export function validateTimeBound(time: string, min: string, max: string): boolean {
  return time >= min && time <= max;
}

export function mapExamples(
  exampleDe: string | null | undefined,
  exampleCn: string | null | undefined,
): { german: string; translation: string }[] {
  if (!exampleDe && !exampleCn) return [];
  return [{
    german: String(exampleDe ?? '').trim(),
    translation: String(exampleCn ?? '').trim(),
  }];
}

export function safeNumber(value: any): number | undefined {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

export function safeString(value: any): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s === '' ? null : s;
}