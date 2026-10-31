import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/PageContainer';
import { Loading } from '../../components/Loading';
import { apiGet } from '../../api/client';
import type { WordDetail } from '@nihao-deutsch/shared';

export const WordDetailPage: React.FC = () => {
  const { wordId } = useParams<{ wordId: string }>();
  const navigate = useNavigate();
  const [word, setWord] = useState<WordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wordId) { setError('资源不存在'); setLoading(false); return; }
    setLoading(true);
    apiGet<WordDetail>(`/words/${wordId}`)
      .then((data) => { setWord(data); setError(null); })
      .catch(() => setError('加载失败，请重试'))
      .finally(() => setLoading(false));
  }, [wordId]);

  if (loading) return <PageContainer title="单词详情" showBack onBack={() => navigate(-1)}><Loading /></PageContainer>;
  if (error) return (
    <PageContainer title="单词详情" showBack onBack={() => navigate(-1)}>
      <div style={{ textAlign: 'center', padding: 32 }}>
        <p style={{ color: '#707866' }}>{error}</p>
        <button className="paper-native-button" onClick={() => navigate(-1)} style={{ marginTop: 12, padding: '6px 16px', background: '#33583f', color: '#faf7ef', border: 'none', borderRadius: 6 }}>返回</button>
      </div>
    </PageContainer>
  );
  if (!word) return null;

  return (
    <PageContainer title="单词详情" showBack onBack={() => navigate(-1)}>
      <div className="paper-panel" style={{ background: '#faf7ef', borderRadius: 8, padding: 16, marginBottom: 12 }}>
        <h2 className="paper-lexeme" lang="de" style={{ marginBottom: 4 }}>{word.lemma}</h2>
        {word.phonetic && <p style={{ color: '#707866', fontSize: 14 }}>{word.phonetic}</p>}
        <p style={{ marginTop: 8 }}><strong>词性:</strong> {word.pos}</p>
        <p><strong>释义:</strong> {word.meaning}</p>
        {word.plural && <p><strong>复数:</strong> {word.plural}</p>}
        <p><strong>课程:</strong> {word.course}</p>
        <p><strong>难度:</strong> {word.difficulty}</p>
      </div>
      {word.conjugations.length > 0 && (
        <div className="paper-panel" style={{ background: '#faf7ef', borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <h3>变位表</h3>
          {word.conjugations.map((c, i) => (
            <p key={i} style={{ fontSize: 14 }}>{c.tense} · {c.person}: <strong>{c.form}</strong></p>
          ))}
        </div>
      )}
      {word.examples.length > 0 && (
        <div className="paper-panel" style={{ background: '#faf7ef', borderRadius: 8, padding: 16 }}>
          <h3>例句</h3>
          {word.examples.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 14 }}>{e.german}</p>
              <p style={{ fontSize: 12, color: '#707866' }}>{e.translation}</p>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default WordDetailPage;