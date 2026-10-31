import { v4 as uuidv4 } from 'uuid';
import { templateRepository, type TemplateRow } from '../repositories/template.repository';
import { AppError } from '../middleware/errorHandler';
import { nowIso } from '../dal/types';
import type { PushTemplate } from '@nihao-deutsch/shared';

function mapRow(row: TemplateRow): PushTemplate {
  let variables: string[] = [];
  try { variables = JSON.parse(row.variables); } catch { variables = []; }
  return {
    templateId: row.template_id,
    code: row.code,
    title: row.title,
    body: row.body,
    variables,
    createdAt: row.created_at,
  };
}

export class TemplateService {
  async list(): Promise<PushTemplate[]> {
    const rows = await templateRepository.findAll();
    return rows.map(mapRow);
  }

  async create(input: { code: string; title: string; body: string; variables: string[] }): Promise<PushTemplate> {
    const existing = await templateRepository.findByCode(input.code);
    if (existing) throw new AppError(409, '模板编码已存在', 'TEMPLATE_CODE_DUPLICATE');
    const templateId = uuidv4();
    const createdAt = nowIso();
    await templateRepository.insert({
      templateId,
      code: input.code,
      title: input.title,
      body: input.body,
      variables: JSON.stringify(input.variables),
      createdAt,
    });
    return { templateId, ...input, createdAt };
  }

  async update(templateId: string, input: { title: string; body: string; variables: string[] }): Promise<PushTemplate> {
    const existing = await templateRepository.findById(templateId);
    if (!existing) throw new AppError(404, '模板不存在', 'TEMPLATE_NOT_FOUND');
    await templateRepository.update(templateId, input.title, input.body, JSON.stringify(input.variables));
    return mapRow({ ...existing, title: input.title, body: input.body, variables: JSON.stringify(input.variables) });
  }

  async remove(templateId: string): Promise<void> {
    const existing = await templateRepository.findById(templateId);
    if (!existing) throw new AppError(404, '模板不存在', 'TEMPLATE_NOT_FOUND');
    await templateRepository.delete(templateId);
  }

  async render(code: string, data: Record<string, string>): Promise<{ title: string; content: string }> {
    const row = await templateRepository.findByCode(code);
    if (!row) throw new AppError(404, '模板不存在', 'TEMPLATE_NOT_FOUND');
    let title = row.title;
    let content = row.body;
    let variables: string[] = [];
    try { variables = JSON.parse(row.variables); } catch { variables = []; }
    for (const v of variables) {
      const placeholder = new RegExp(`\\{\\{${v}\\}\\}`, 'g');
      title = title.replace(placeholder, data[v] ?? '');
      content = content.replace(placeholder, data[v] ?? '');
    }
    return { title, content };
  }
}

export const templateService = new TemplateService();