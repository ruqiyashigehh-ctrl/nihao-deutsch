import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/PageContainer';
import { EmptyState } from '../../components/EmptyState';
import { Loading } from '../../components/Loading';
import { TemplatePreviewModal } from '../../components/TemplatePreviewModal';
import { apiGet, apiPost, apiPut, apiDelete } from '../../api/client';
import { t } from '@nihao-deutsch/shared';
import type { PushTemplate } from '@nihao-deutsch/shared';

interface EditForm {
  code: string;
  title: string;
  body: string;
  variables: string;
}

const EMPTY_FORM: EditForm = { code: '', title: '', body: '', variables: '' };

export const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<PushTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PushTemplate | null>(null);
  const [form, setForm] = useState<EditForm>(EMPTY_FORM);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<PushTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetch = () => {
    setLoading(true);
    apiGet<PushTemplate[]>('/admin/templates')
      .then((data) => { setTemplates(data); setLoading(false); })
      .catch(() => { setError(t('teacher.loadFailed')); setLoading(false); });
  };
  useEffect(fetch, []);

  const startCreate = () => { setEditing(null); setForm(EMPTY_FORM); setResult(null); setError(null); };
  const startEdit = (tpl: PushTemplate) => {
    setEditing(tpl);
    setForm({ code: tpl.code, title: tpl.title, body: tpl.body, variables: tpl.variables.join(', ') });
    setResult(null); setError(null);
  };

  const handleSave = async () => {
    setError(null); setResult(null);
    const variables = form.variables.split(',').map((v) => v.trim()).filter(Boolean);
    try {
      if (editing) {
        await apiPut(`/admin/templates/${editing.templateId}`, { title: form.title, body: form.body, variables });
        setResult(t('template.updateSuccess'));
      } else {
        await apiPost('/admin/templates', { code: form.code, title: form.title, body: form.body, variables });
        setResult(t('template.createSuccess'));
      }
      setForm(EMPTY_FORM); setEditing(null); fetch();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t('common.serverError'));
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!window.confirm('确认删除该模板？')) return;
    try {
      await apiDelete(`/admin/templates/${templateId}`);
      setResult(t('template.deleteSuccess')); fetch();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t('common.serverError'));
    }
  };

  return (
    <PageContainer title="模板管理">
      {loading ? <Loading /> : (
        <>
          {error && <div style={{ color: '#a34334', marginBottom: 8 }}>{error}</div>}
          {result && <div style={{ color: '#43654e', marginBottom: 8 }}>{result}</div>}

          <button className="paper-native-button" onClick={startCreate} style={{ width: '100%', padding: 10, background: '#33583f', color: '#faf7ef', border: 'none', borderRadius: 6, marginBottom: 12, cursor: 'pointer' }}>
            新建模板
          </button>

          {(editing !== null || form.code !== '') && (
            <div className="paper-panel" style={{ background: '#faf7ef', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <h3>{editing ? '编辑模板' : '新建模板'}</h3>
              <input className="paper-input" placeholder="模板编码" value={form.code} disabled={!!editing}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                style={{ width: '100%', padding: 8, border: '1px solid #cbd1bd', borderRadius: 6, marginBottom: 8, boxSizing: 'border-box' }} />
              <input className="paper-input" placeholder="标题" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={{ width: '100%', padding: 8, border: '1px solid #cbd1bd', borderRadius: 6, marginBottom: 8, boxSizing: 'border-box' }} />
              <textarea className="paper-input" placeholder="模板正文（使用 {{变量名}} 作为占位符）" value={form.body} rows={4}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                style={{ width: '100%', padding: 8, border: '1px solid #cbd1bd', borderRadius: 6, marginBottom: 8, boxSizing: 'border-box' }} />
              <input className="paper-input" placeholder="变量列表（逗号分隔，如: studentName,className）" value={form.variables}
                onChange={(e) => setForm({ ...form, variables: e.target.value })}
                style={{ width: '100%', padding: 8, border: '1px solid #cbd1bd', borderRadius: 6, marginBottom: 8, boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="paper-native-button" onClick={handleSave} style={{ flex: 1, padding: 8, background: '#33583f', color: '#faf7ef', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                  {t('common.confirm')}
                </button>
                <button className="paper-native-button" onClick={() => { setForm(EMPTY_FORM); setEditing(null); }} style={{ flex: 1, padding: 8, background: '#e4e7da', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}

          {templates.length === 0 ? <EmptyState messageKey="template.listEmpty" /> :
            templates.map((tpl) => (
              <div className="paper-panel" key={tpl.templateId} style={{ background: '#faf7ef', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600 }}>{tpl.title}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="paper-native-button" onClick={() => { setPreviewTemplate(tpl); setPreviewOpen(true); }} style={{ padding: '4px 8px', background: '#e2e7d7', color: '#33583f', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>预览</button>
                    <button className="paper-native-button" onClick={() => startEdit(tpl)} style={{ padding: '4px 8px', background: '#e4e7da', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>编辑</button>
                    <button className="paper-native-button" onClick={() => handleDelete(tpl.templateId)} style={{ padding: '4px 8px', background: '#fff1f0', color: '#a34334', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>删除</button>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#707866', marginTop: 4 }}>编码: {tpl.code}</div>
                <div style={{ fontSize: 13, color: '#606b5a', marginTop: 4, whiteSpace: 'pre-wrap' }}>{tpl.body}</div>
                {tpl.variables.length > 0 && (
                  <div style={{ fontSize: 12, color: '#33583f', marginTop: 4 }}>
                    变量: {tpl.variables.map((v) => `{{${v}}}`).join(' ')}
                  </div>
                )}
              </div>
            ))
          }
        </>
      )}
      <TemplatePreviewModal
        open={previewOpen}
        template={previewTemplate}
        onClose={() => setPreviewOpen(false)}
      />
    </PageContainer>
  );
};
export default TemplatesPage;