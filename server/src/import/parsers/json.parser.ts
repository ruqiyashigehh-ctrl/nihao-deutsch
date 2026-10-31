export function parseJson<T = unknown>(content: string): T {
  return JSON.parse(content) as T;
}