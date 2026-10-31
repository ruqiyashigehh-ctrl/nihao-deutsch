import { getDatabase } from '../dal/driver';

export interface TemplateRow {
  template_id: string;
  code: string;
  title: string;
  body: string;
  variables: string;
  created_at: string;
}

export class TemplateRepository {
  async findAll(): Promise<TemplateRow[]> {
    const db = await getDatabase();
    return db.query<TemplateRow>('SELECT * FROM push_templates ORDER BY created_at DESC');
  }

  async findByCode(code: string): Promise<TemplateRow | null> {
    const db = await getDatabase();
    const rows = await db.query<TemplateRow>('SELECT * FROM push_templates WHERE code = ?', [code]);
    return rows[0] ?? null;
  }

  async findById(templateId: string): Promise<TemplateRow | null> {
    const db = await getDatabase();
    const rows = await db.query<TemplateRow>('SELECT * FROM push_templates WHERE template_id = ?', [templateId]);
    return rows[0] ?? null;
  }

  async insert(t: { templateId: string; code: string; title: string; body: string; variables: string; createdAt: string }) {
    const db = await getDatabase();
    await db.run(
      'INSERT INTO push_templates (template_id, code, title, body, variables, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [t.templateId, t.code, t.title, t.body, t.variables, t.createdAt],
    );
  }

  async update(templateId: string, title: string, body: string, variables: string) {
    const db = await getDatabase();
    await db.run(
      'UPDATE push_templates SET title = ?, body = ?, variables = ? WHERE template_id = ?',
      [title, body, variables, templateId],
    );
  }

  async delete(templateId: string) {
    const db = await getDatabase();
    await db.run('DELETE FROM push_templates WHERE template_id = ?', [templateId]);
  }
}

export const templateRepository = new TemplateRepository();