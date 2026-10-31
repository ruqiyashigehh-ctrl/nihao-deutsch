import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/PageContainer';
import { Loading } from '../../components/Loading';
import { apiGet, apiPost } from '../../api/client';
import { t } from '@nihao-deutsch/shared';

interface ClassItem {
  class_id: string;
  class_name: string;
}

export const NotifyPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classId, setClassId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(true);

  useEffect(() => {
    apiGet<ClassItem[]>('/teacher/classes')
      .then((data) => {
        setClasses(data);
        if (data.length > 0) setClassId(data[0].class_id);
        setClassesLoading(false);
      })
      .catch(() => setClassesLoading(false));
  }, []);

  const handleSend = async () => {
    if (!classId || !title || !content) {
      setError('请填写完整信息');
      return;
    }
    setLoading(true); setResult(null); setError(null);
    try {
      await apiPost('/messages/broadcast', { classId, title, content });
      setResult(t('message.broadcastSuccess'));
      setTitle(''); setContent('');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t('common.serverError'));
    } finally { setLoading(false); }
  };

  return (
    <PageContainer title="发送通知">
      <div className="paper-panel" style={{ background: '#faf7ef', borderRadius: 8, padding: 16 }}>
        {classesLoading ? <Loading /> : (
          <>
            <label style={{ display: 'block', fontSize: 14, color: '#606b5a', marginBottom: 4 }}>选择班级</label>
            <select className="paper-input" value={classId} onChange={(e) => setClassId(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #cbd1bd', borderRadius: 6, marginBottom: 12, boxSizing: 'border-box' }}>
              {classes.length === 0 && <option value="">无可管理班级</option>}
              {classes.map((c) => <option key={c.class_id} value={c.class_id}>{c.class_name}</option>)}
            </select>
          </>
        )}
        <input className="paper-input" placeholder="标题" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #cbd1bd', borderRadius: 6, marginBottom: 12, boxSizing: 'border-box' }} />
        <textarea className="paper-input" placeholder="通知内容" value={content} onChange={(e) => setContent(e.target.value)} rows={4} style={{ width: '100%', padding: 8, border: '1px solid #cbd1bd', borderRadius: 6, marginBottom: 12, boxSizing: 'border-box' }} />
        {error && <p style={{ color: '#a34334', fontSize: 13, marginBottom: 8 }}>{error}</p>}
        {result && <p style={{ color: '#43654e', fontSize: 13, marginBottom: 8 }}>{result}</p>}
        <button className="paper-native-button" onClick={handleSend} disabled={loading || !classId} style={{ width: '100%', padding: 10, background: '#33583f', color: '#faf7ef', border: 'none', borderRadius: 6, cursor: 'pointer', opacity: (!classId || loading) ? 0.6 : 1 }}>{loading ? '发送中…' : '发送通知'}</button>
      </div>
    </PageContainer>
  );
};
export default NotifyPage;