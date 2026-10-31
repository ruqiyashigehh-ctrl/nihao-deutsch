import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/PageContainer';
import { Loading } from '../../components/Loading';
import { apiGet, apiPost } from '../../api/client';
import type { ExerciseItem, SubmitAnswerResponse } from '@nihao-deutsch/shared';

export const PracticePage: React.FC = () => {
  const { grammarId } = useParams<{ grammarId: string }>();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<SubmitAnswerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!grammarId) { setError('资源不存在'); setLoading(false); return; }
    setLoading(true);
    apiGet<ExerciseItem[]>(`/exercises?grammarId=${grammarId}`)
      .then((data) => { setExercises(data); setError(null); })
      .catch(() => setError('加载失败，请重试'))
      .finally(() => setLoading(false));
  }, [grammarId]);

  const handleSubmit = async () => {
    if (!answer || !exercises[current]) return;
    setSubmitting(true);
    try {
      const r = await apiPost<SubmitAnswerResponse>(`/exercises/${exercises[current].exerciseId}/submit`, { userAnswer: answer });
      setResult(r);
    } catch {
      setError('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setCurrent((prev) => prev + 1);
    setAnswer('');
    setResult(null);
  };

  if (loading) return <PageContainer title="语法练习" showBack onBack={() => navigate(-1)}><Loading /></PageContainer>;
  if (error) return (
    <PageContainer title="语法练习" showBack onBack={() => navigate(-1)}>
      <div style={{ textAlign: 'center', padding: 32 }}>
        <p style={{ color: '#707866' }}>{error}</p>
        <button className="paper-native-button" onClick={() => navigate(-1)} style={{ marginTop: 12, padding: '6px 16px', background: '#33583f', color: '#faf7ef', border: 'none', borderRadius: 6 }}>返回</button>
      </div>
    </PageContainer>
  );

  if (exercises.length === 0) {
    return (
      <PageContainer title="语法练习" showBack onBack={() => navigate(-1)}>
        <p style={{ textAlign: 'center', color: '#707866', padding: 32 }}>暂无练习题</p>
      </PageContainer>
    );
  }

  if (current >= exercises.length) {
    return (
      <PageContainer title="语法练习" showBack onBack={() => navigate(-1)}>
        <div style={{ textAlign: 'center', padding: 32 }}>
          <p>🎉 已完成全部练习！</p>
          <button className="paper-native-button" onClick={() => navigate(-1)} style={{ marginTop: 12, padding: '6px 16px', background: '#33583f', color: '#faf7ef', border: 'none', borderRadius: 6 }}>返回</button>
        </div>
      </PageContainer>
    );
  }

  const ex = exercises[current];

  return (
    <PageContainer title={`语法练习 (${current + 1}/${exercises.length})`} showBack onBack={() => navigate(-1)}>
      <div className="paper-panel" style={{ background: '#faf7ef', borderRadius: 8, padding: 16, marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: '#707866' }}>{ex.type === 'G1' ? '填空题' : '改错题'}</p>
        <p style={{ fontSize: 16, marginTop: 8 }}>{ex.question}</p>
      </div>
      {!result ? (
        <div>
          <input className="paper-input"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="输入你的答案"
            style={{ width: '100%', padding: 12, border: '1px solid #cbd1bd', borderRadius: 6, marginBottom: 12, boxSizing: 'border-box' }}
          />
          <button className="paper-native-button"
            onClick={handleSubmit}
            disabled={!answer || submitting}
            style={{ width: '100%', padding: 12, background: '#33583f', color: '#faf7ef', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            {submitting ? '提交中…' : '提交'}
          </button>
        </div>
      ) : (
        <div className="paper-panel" style={{ background: '#faf7ef', borderRadius: 8, padding: 16 }}>
          <p style={{ color: result.isCorrect ? '#43654e' : '#a34334', fontWeight: 600 }}>
            {result.isCorrect ? '✅ 正确' : '❌ 错误'}
          </p>
          <p style={{ marginTop: 8 }}>正确答案: <strong>{result.correctAnswer}</strong></p>
          {result.explanation && <p style={{ fontSize: 14, color: '#606b5a', marginTop: 8 }}>{result.explanation}</p>}
          <button className="paper-native-button"
            onClick={handleNext}
            style={{ width: '100%', padding: 12, marginTop: 12, background: '#33583f', color: '#faf7ef', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            {current + 1 < exercises.length ? '下一题' : '完成'}
          </button>
        </div>
      )}
    </PageContainer>
  );
};

export default PracticePage;