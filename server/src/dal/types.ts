export function toBool(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value === '1' || value === 'true';
  return false;
}

export function fromBool(value: boolean): number {
  return value ? 1 : 0;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function toIso(value: string | Date): string {
  if (typeof value === 'string') return value;
  return value.toISOString();
}

export function fromIso(value: string): Date {
  return new Date(value);
}

export function isExpired(isoTime: string | null): boolean {
  if (!isoTime) return false;
  return new Date(isoTime).getTime() < Date.now();
}

export function minutesFromNow(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}