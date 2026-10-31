import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageContainer } from '../../components/PageContainer';
import { Loading } from '../../components/Loading';
import { apiGet } from '../../api/client';
import type { GrammarDetail } from '@nihao-deutsch/shared';

export const GrammarDetailPage: React.FC = () => {
  const { grammarId } = useParams<{ grammarId: string }>();
  const navigate = useNavigate();
  const [grammar, setGrammar] = useState<GrammarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!grammarId) { setError('资源不存在'); setLoading(false); return; }
    setLoading(true);
    apiGet<GrammarDetail>(`/grammar/${grammarId}`)
      .then((data) => { setGrammar(data); setError(null); })
      .catch(() => setError('加载失败，请重试'))
      .finally(() => setLoading(false));
  }, [grammarId]);

  if (loading) return <PageContainer title="语法详情" showBack onBack={() => navigate(-1)}><Loading /></PageContainer>;
  if (error) return (
    <PageContainer title="语法详情" showBack onBack={() => navigate(-1)}>
      <div style={{ textAlign: 'center', padding: 32 }}>
        <p style={{ color: '#707866' }}>{error}</p>
        <button className="paper-native-button" onClick={() => navigate(-1)} style={{ marginTop: 12, padding: '6px 16px', background: '#33583f', color: '#faf7ef', border: 'none', borderRadius: 6 }}>返回</button>
      </div>
    </PageContainer>
  );
  if (!grammar) return null;

  return (
    <PageContainer title="语法详情" showBack onBack={() => navigate(-1)}>
      <div className="paper-panel" style={{ background: '#faf7ef', borderRadius: 8, padding: 16, marginBottom: 12 }}>
        <h2 style={{ marginBottom: 4 }}>{grammar.title}</h2>
        <p style={{ color: '#707866', fontSize: 14 }}>难度: {grammar.difficulty}</p>
        {grammar.ruleText && <p style={{ marginTop: 12, lineHeight: 1.6 }}>{grammar.ruleText}</p>}
      </div>
      {grammar.examples.length > 0 && (
        <div className="paper-panel" style={{ background: '#faf7ef', borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <h3>例句</h3>
          {grammar.examples.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 14 }}>{e.german}</p>
              <p style={{ fontSize: 12, color: '#707866' }}>{e.translation}</p>
            </div>
          ))}
        </div>
      )}
      {grammar.exerciseAvailable && (
        <Link
          to={`/student/practice/${grammarId}`}
          style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#33583f', color: '#faf7ef', borderRadius: 8, textDecoration: 'none' }}
        >
          开始练习
        </Link>
      )}
    </PageContainer>
  );
};

export default GrammarDetailPage;