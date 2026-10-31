import React, { useState } from 'react';
import { PageContainer } from '../../components/PageContainer';
import { apiUpload, apiUploadMulti } from '../../api/client';
import type { ImportReport, ImportType, KnowledgeBaseReport } from '@nihao-deutsch/shared';

const IMPORT_TYPES: { value: ImportType; label: string }[] = [
  { value: 'words', label: '单词表' },
  { value: 'grammar', label: '语法点' },
  { value: 'exercises', label: '语法题库' },
  { value: 'checkpoints', label: '打卡点' },
  { value: 'roster', label: '师生名单' },
  { value: 'copywriting', label: '文案清单' },
  { value: 'windows', label: '打卡时段' },
];

const KB_FIELDS: { name: string; label: string }[] = [
  { name: 'grammar', label: '语法点清单' },
  { name: 'exercises', label: '德语语法题库' },
  { name: 'checkpoints', label: '打卡点配置' },
  { name: 'windows', label: '打卡时段配置' },
  { name: 'copywriting', label: '空状态错误文案' },
];

export const ImportPage: React.FC = () => {
  const [type, setType] = useState<ImportType>('words');
  const [report, setReport] = useState<ImportReport | null>(null);
  const [loading, setLoading] = useState(false);

  const [kbFiles, setKbFiles] = useState<Record<string, File>>({});
  const [kbReport, setKbReport] = useState<KnowledgeBaseReport | null>(null);
  const [kbLoading, setKbLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setReport(null);
    try {
      const r = await apiUpload<ImportReport>(`/admin/import/${type}`, file);
      setReport(r);
    } catch (err: any) { setReport(err?.response?.data ?? { error: '导入失败' } as any); } finally { setLoading(false); }
  };

  const handleKbFileChange = (name: string, file: File | undefined) => {
    setKbFiles((prev) => {
      const next = { ...prev };
      if (file) next[name] = file;
      else delete next[name];
      return next;
    });
  };

  const handleKbImport = async () => {
    if (Object.keys(kbFiles).length === 0) return;
    setKbLoading(true); setKbReport(null);
    try {
      const r = await apiUploadMulti<KnowledgeBaseReport>('/admin/import/knowledge-base', kbFiles);
      setKbReport(r);
    } catch (err: any) { setKbReport(err?.response?.data ?? { error: '导入失败' } as any); } finally { setKbLoading(false); }
  };

  return (
    <PageContainer title="数据导入">
      <div className="paper-panel" style={{ background: '#faf7ef', borderRadius: 8, padding: 16, marginBottom: 12 }}>
        <h3 style={{ marginBottom: 12 }}>单类导入（CSV/XLSX）</h3>
        <select className="paper-input" value={type} onChange={(e) => setType(e.target.value as ImportType)} style={{ width: '100%', padding: 8, border: '1px solid #cbd1bd', borderRadius: 6, marginBottom: 12 }}>
          {IMPORT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input className="paper-input" type="file" accept=".csv,.xlsx" onChange={handleUpload} disabled={loading} />
      </div>
      {loading && <p style={{ textAlign: 'center', color: '#33583f' }}>导入中…</p>}
      {report && (
        <div className="paper-panel" style={{ background: '#faf7ef', borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <h3>导入报告</h3>
          <p>总数: {report.total} | 成功: {report.success} | 失败: {report.failed} | 耗时: {report.durationMs}ms</p>
          {report.failures?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <p style={{ color: '#a34334' }}>失败明细:</p>
              {report.failures.slice(0, 10).map((f, i) => <p key={i} style={{ fontSize: 12, color: '#707866' }}>行{f.row}: {f.message}</p>)}
            </div>
          )}
        </div>
      )}

      <div className="paper-panel" style={{ background: '#faf7ef', borderRadius: 8, padding: 16, marginBottom: 12 }}>
        <h3 style={{ marginBottom: 12 }}>知识库全量导入（5类Excel）</h3>
        <p style={{ fontSize: 12, color: '#707866', marginBottom: 12 }}>按语法点→题库→打卡点→时段→文案顺序串行导入</p>
        {KB_FIELDS.map((f) => (
          <div key={f.name} style={{ marginBottom: 8 }}>
            <label style={{ display: 'inline-block', width: 120, fontSize: 14 }}>{f.label}:</label>
            <input className="paper-input"
              type="file"
              accept=".xlsx"
              onChange={(e) => handleKbFileChange(f.name, e.target.files?.[0])}
              disabled={kbLoading}
            />
            {kbFiles[f.name] && <span style={{ fontSize: 12, color: '#43654e', marginLeft: 8 }}>✓</span>}
          </div>
        ))}
        <button className="paper-native-button"
          onClick={handleKbImport}
          disabled={kbLoading || Object.keys(kbFiles).length === 0}
          style={{ marginTop: 8, padding: '8px 24px', background: '#33583f', color: '#faf7ef', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          {kbLoading ? '导入中…' : '开始全量导入'}
        </button>
      </div>
      {kbReport && (
        <div className="paper-panel" style={{ background: '#faf7ef', borderRadius: 8, padding: 16 }}>
          <h3>全量导入报告</h3>
          <p>总耗时: {kbReport.totalDurationMs}ms | {kbReport.overallSuccess ? '✅ 全部成功' : '⚠️ 部分失败'}</p>
          {kbReport.steps?.map((step, i) => (
            <div key={i} style={{ marginTop: 8, padding: 8, background: '#f0eee3', borderRadius: 4 }}>
              <span>{step.status === 'success' ? '✅' : step.status === 'failed' ? '❌' : '⏭️'} {step.type}</span>
              {step.error && <span style={{ color: '#a34334', marginLeft: 8 }}>{step.error}</span>}
              {step.report && (
                <span style={{ marginLeft: 8, fontSize: 12, color: '#606b5a' }}>
                  成功{step.report.success}/{step.report.total}，失败{step.report.failed}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
export default ImportPage;