import React from 'react';

interface StudyProgressProps { index: number; total: number; }

export const StudyProgress: React.FC<StudyProgressProps> = ({ index, total }) => {
  const percent = total > 0 ? Math.min(100, Math.round((index / total) * 100)) : 0;
  return (
    <div className="study-paper__progress">
      <div className="study-paper__progress-meta"><span>今日进度 <strong>{String(index).padStart(2, '0')}</strong><span className="study-paper__progress-total"> / {total}</span></span><span>{percent}%</span></div>
      <div className="study-paper__track" role="progressbar" aria-label="今日背词进度" aria-valuemin={0} aria-valuemax={total} aria-valuenow={index} aria-valuetext={'今日第 ' + index + '/' + total + ' 个'}>
        <div className="study-paper__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

export default StudyProgress;
