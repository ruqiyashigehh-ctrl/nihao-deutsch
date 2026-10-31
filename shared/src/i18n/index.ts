import { zhCN, type CopywritingKey } from './zh-CN';

export type { CopywritingKey, CopywritingMap } from './zh-CN';

const messages = { 'zh-CN': zhCN } as const;

export function t(key: CopywritingKey, vars?: Record<string, string | number>): string {
  const template = messages['zh-CN'][key] ?? key;
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : `{{${name}}}`,
  );
}

export function tRaw(key: CopywritingKey): string {
  return messages['zh-CN'][key] ?? key;
}