import React from 'react';
import type { QuizQuestionData } from '../types/domain';

interface QuizQuestionItemProps {
  question: QuizQuestionData;
  userAnswer: string;
  onAnswer: (answer: string) => void;
}

export const QuizQuestionItem: React.FC<QuizQuestionItemProps> = ({ question, userAnswer, onAnswer }) => {
  return (
    <div className="paper-panel" style={{ padding: 16, background: '#faf7ef', borderRadius: 8 }}>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, lineHeight: 1.6 }}>{question.question}</div>
      {question.type === 'choice' && question.options && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {question.options.map((option, idx) => (
            <label
              key={idx}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: 12,
                border: userAnswer === String(idx) ? '2px solid #33583f' : '1px solid #cbd1bd',
                borderRadius: 8, cursor: 'pointer', background: userAnswer === String(idx) ? '#e2e7d7' : '#faf7ef',
              }}
            >
              <input className="paper-input"
                type="radio"
                name={question.questionId}
                checked={userAnswer === String(idx)}
                onChange={() => onAnswer(String(idx))}
              />
              <span>{String.fromCharCode(65 + idx)}. {option}</span>
            </label>
          ))}
        </div>
      )}
      {question.type === 'fill' && (
        <input className="paper-input"
          type="text"
          value={userAnswer}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="请输入答案"
          style={{ width: '100%', padding: '12px 16px', border: '1px solid #cbd1bd', borderRadius: 8, fontSize: 16, boxSizing: 'border-box' }}
        />
      )}
    </div>
  );
};

export default QuizQuestionItem;