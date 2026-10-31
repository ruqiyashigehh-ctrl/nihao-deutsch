import React, { useState } from 'react';
import type { WrongQuestion } from '../types/domain';

interface WrongQuestionPanelProps {
  wrongQuestions: WrongQuestion[];
  defaultExpanded?: boolean;
}

export const WrongQuestionPanel: React.FC<WrongQuestionPanelProps> = ({ wrongQuestions, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="paper-panel" style={{ background: '#faf7ef', borderRadius: 8, overflow: 'hidden' }}>
      <button className="paper-native-button"
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', padding: 16, background: '#faf7ef', border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16,
        }}
      >
        <span style={{ fontWeight: 600 }}>错题列表（{wrongQuestions.length} 道）</span>
        <span style={{ color: '#707866' }}>{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div style={{ borderTop: '1px solid #d8dccb' }}>
          {wrongQuestions.map((q, idx) => (
            <div key={q.questionId} style={{ padding: 16, borderBottom: idx < wrongQuestions.length - 1 ? '1px solid #e4e7da' : 'none' }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{idx + 1}. {q.question}</div>
              <div style={{ fontSize: 13, color: '#a34334', marginBottom: 4 }}>我的答案：{q.userAnswer}</div>
              <div style={{ fontSize: 13, color: '#43654e' }}>正确答案：{q.correctAnswer}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WrongQuestionPanel;