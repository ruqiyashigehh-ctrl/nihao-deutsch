import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/PageContainer';
import { ScoreRing } from '../../components/ScoreRing';
import { WrongQuestionPanel } from '../../components/WrongQuestionPanel';
import { useQuizStore } from '../../store/quizStore';

export const QuizResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { result, reset } = useQuizStore();

  if (!result) {
    return (
      <PageContainer title="测验结果" showBack onBack={() => navigate('/student/home')}>
        <div style={{ textAlign: 'center', padding: 40, color: '#707866' }}>暂无结果数据</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="测验结果" showBack onBack={() => navigate('/student/home')}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <ScoreRing score={result.score} size={160} />
        <div style={{ marginTop: 12, fontSize: 14, color: '#707866' }}>得分</div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, padding: 16, background: '#e8eddf', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#43654e' }}>{result.correctCount}</div>
          <div style={{ fontSize: 12, color: '#606b5a' }}>答对</div>
        </div>
        <div style={{ flex: 1, padding: 16, background: '#f3e5dc', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#a34334' }}>{result.wrongCount}</div>
          <div style={{ fontSize: 12, color: '#606b5a' }}>答错</div>
        </div>
      </div>

      {result.wrongQuestions.length > 0 && (
        <WrongQuestionPanel wrongQuestions={result.wrongQuestions} />
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button className="paper-native-button"
          onClick={() => { reset(); navigate('/student/quiz'); }}
          style={{ flex: 1, padding: 12, background: '#33583f', color: '#faf7ef', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}
        >
          再测一次
        </button>
        <button className="paper-native-button"
          onClick={() => navigate('/student/home')}
          style={{ flex: 1, padding: 12, background: '#faf7ef', color: '#33583f', border: '1px solid #33583f', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}
        >
          返回
        </button>
      </div>
    </PageContainer>
  );
};

export default QuizResultPage;