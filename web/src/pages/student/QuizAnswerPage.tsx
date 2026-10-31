import React, { useState } from 'react';
import { Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../../store/quizStore';
import { QuizQuestionItem } from '../../components/QuizQuestionItem';
import { Loading } from '../../components/Loading';

export const QuizAnswerPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    questions, currentIndex, answers, loading, config,
    setAnswer, prev, next, submit, reset,
  } = useQuizStore();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  if (loading) return <Loading />;
  if (questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <p style={{ marginBottom: 16 }}>题目加载失败</p>
        <button className="paper-native-button" onClick={() => navigate('/student/quiz')} style={{ padding: '8px 24px', background: '#33583f', color: '#faf7ef', border: 'none', borderRadius: 8, cursor: 'pointer' }}>返回设置</button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const typeLabel = config?.type === 'vocab' ? '词汇测验' : '语法测验';

  const handleNext = () => {
    if (isLast) {
      submit();
      navigate('/student/quiz/result');
    } else {
      next();
    }
  };

  const handleExit = () => {
    reset();
    navigate('/student/quiz');
  };

  return (
    <div className="paper-quiz-session">
      <header className="paper-quiz-session__header">
        <button className="paper-native-button" aria-label="退出测验" onClick={() => setShowExitConfirm(true)} style={{ background: 'none', border: 'none', color: '#33583f', fontSize: 18, cursor: 'pointer' }}>‹</button>
        <span style={{ fontSize: 16, fontWeight: 600 }}>{typeLabel} · 第 {currentIndex + 1}/{questions.length} 题</span>
        <span style={{ width: 24 }} />
      </header>

      <div className="paper-quiz-session__body">
        <QuizQuestionItem
          question={currentQuestion}
          userAnswer={answers[currentQuestion.questionId] ?? ''}
          onAnswer={(answer) => setAnswer(currentQuestion.questionId, answer)}
        />
      </div>

      <footer className="paper-quiz-session__footer">
        <button className="paper-native-button"
          onClick={prev}
          disabled={currentIndex === 0}
          style={{ flex: 1, padding: 12, background: currentIndex === 0 ? '#e4e7da' : '#faf7ef', color: currentIndex === 0 ? '#b6bca9' : '#33583f', border: '1px solid #cbd1bd', borderRadius: 8, cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', fontSize: 16 }}
        >
          上一题
        </button>
        <button className="paper-native-button"
          onClick={handleNext}
          style={{ flex: 1, padding: 12, background: '#33583f', color: '#faf7ef', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}
        >
          {isLast ? '提交' : '下一题'}
        </button>
      </footer>

      <Modal title="退出测验？" open={showExitConfirm} onCancel={() => setShowExitConfirm(false)} onOk={handleExit} okText="确认退出" cancelText="继续作答" okButtonProps={{ danger: true }}>
        <p>退出后，本轮尚未提交的作答不会保存。</p>
      </Modal>
    </div>
  );
};

export default QuizAnswerPage;