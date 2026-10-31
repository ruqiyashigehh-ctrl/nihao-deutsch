import React from 'react';
import type { QuizConfig, QuizType, QuestionCount } from '../types/domain';

interface QuizConfigFormProps {
  config: QuizConfig;
  onChange: (config: QuizConfig) => void;
}

const LEKTION_OPTIONS = Array.from({ length: 14 }, (_, i) => i + 1);
const COUNT_OPTIONS: QuestionCount[] = [10, 20, 30];

export const QuizConfigForm: React.FC<QuizConfigFormProps> = ({ config, onChange }) => {
  const setType = (type: QuizType) => onChange({ ...config, type });
  const toggleLektion = (lektion: number) => {
    const has = config.lektionRange.includes(lektion);
    const lektionRange = has
      ? config.lektionRange.filter((l) => l !== lektion)
      : [...config.lektionRange, lektion].sort((a, b) => a - b);
    onChange({ ...config, lektionRange });
  };
  const setCount = (questionCount: QuestionCount) => onChange({ ...config, questionCount });

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['vocab', 'grammar'] as QuizType[]).map((type) => (
          <button className="paper-native-button"
            key={type}
            onClick={() => setType(type)}
            style={{
              flex: 1, padding: 12, border: config.type === type ? '2px solid #33583f' : '1px solid #cbd1bd',
              background: config.type === type ? '#e2e7d7' : '#faf7ef', borderRadius: 8, cursor: 'pointer',
              fontSize: 16, color: config.type === type ? '#33583f' : '#606b5a',
            }}
          >
            {type === 'vocab' ? '词汇测验' : '语法测验'}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Lektion 范围</div>
        <div className="paper-lesson-grid">
          {LEKTION_OPTIONS.map((l) => {
            const selected = config.lektionRange.includes(l);
            return (
              <button className="paper-native-button"
                key={l}
                onClick={() => toggleLektion(l)}
                style={{
                  padding: '8px 0', border: selected ? '2px solid #33583f' : '1px solid #cbd1bd',
                  background: selected ? '#33583f' : '#faf7ef', color: selected ? '#faf7ef' : '#606b5a',
                  borderRadius: 6, cursor: 'pointer', fontSize: 14,
                }}
              >
                L{l}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>题量</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {COUNT_OPTIONS.map((c) => (
            <button className="paper-native-button"
              key={c}
              onClick={() => setCount(c)}
              style={{
                flex: 1, padding: 12, border: config.questionCount === c ? '2px solid #33583f' : '1px solid #cbd1bd',
                background: config.questionCount === c ? '#e2e7d7' : '#faf7ef', color: config.questionCount === c ? '#33583f' : '#606b5a',
                borderRadius: 8, cursor: 'pointer', fontSize: 16,
              }}
            >
              {c} 题
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizConfigForm;