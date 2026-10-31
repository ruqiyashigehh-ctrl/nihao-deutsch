import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/PageContainer';
import { QuizConfigForm } from '../../components/QuizConfigForm';
import { useQuizStore } from '../../store/quizStore';
import type { QuizConfig } from '../../types/domain';

export const QuizSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { config, setConfig, loadQuestions } = useQuizStore();
  const [localConfig, setLocalConfig] = useState<QuizConfig>(
    config ?? { type: 'vocab', lektionRange: [], questionCount: 10 }
  );

  const handleChange = (newConfig: QuizConfig) => {
    setLocalConfig(newConfig);
    setConfig(newConfig);
  };

  const handleStart = async () => {
    setConfig(localConfig);
    await loadQuestions();
    navigate('/student/quiz/answer');
  };

  const canStartNow = localConfig.lektionRange.length > 0 && localConfig.questionCount != null;

  return (
    <PageContainer title="测验设置" showBack onBack={() => navigate('/student/home')}>
      <QuizConfigForm config={localConfig} onChange={handleChange} />
      <button className="paper-native-button"
        onClick={handleStart}
        disabled={!canStartNow}
        style={{
          width: '100%', padding: 14, marginTop: 24,
          background: canStartNow ? '#33583f' : '#b6bca9', color: '#faf7ef',
          border: 'none', borderRadius: 8, cursor: canStartNow ? 'pointer' : 'not-allowed', fontSize: 18,
        }}
      >
        开始测验
      </button>
    </PageContainer>
  );
};

export default QuizSetupPage;