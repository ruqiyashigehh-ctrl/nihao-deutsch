import React from 'react';
import type { ReportWeekData } from '../types/domain';

interface StudyTrendChartProps {
  data: ReportWeekData[];
}

export const StudyTrendChart: React.FC<StudyTrendChartProps> = ({ data }) => {
  if (data.length === 0) {
    return <div style={{ padding: '40px 0', textAlign: 'center', color: '#707866' }}>暂无学习记录</div>;
  }

  const width = 320;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = data.flatMap((d) => [d.cumulativeWords, d.masteredWords]);
  const maxValue = Math.max(...allValues, 1);
  const stepX = data.length > 1 ? chartWidth / (data.length - 1) : 0;

  const toPoint = (value: number, index: number) => ({
    x: padding.left + index * stepX,
    y: padding.top + chartHeight - (value / maxValue) * chartHeight,
  });

  const cumulativePath = data.map((d, i) => {
    const p = toPoint(d.cumulativeWords, i);
    return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
  }).join(' ');

  const masteredPath = data.map((d, i) => {
    const p = toPoint(d.masteredWords, i);
    return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
  }).join(' ');

  return (
    <div className="paper-panel" style={{ background: '#faf7ef', borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 16, height: 2, background: '#33583f' }} /> 累计背词
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 16, height: 2, background: '#9d5f3f' }} /> 已掌握
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label="累计背词和已掌握词汇趋势">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padding.top + chartHeight * t;
          const value = Math.round(maxValue * (1 - t));
          return (
            <g key={t}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e4e7da" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize={10} fill="#707866">{value}</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const x = padding.left + i * stepX;
          return (
            <text key={i} x={x} y={height - 8} textAnchor="middle" fontSize={10} fill="#707866">{d.weekLabel}</text>
          );
        })}
        <path d={cumulativePath} fill="none" stroke="#33583f" strokeWidth={2} />
        <path d={masteredPath} fill="none" stroke="#9d5f3f" strokeWidth={2} />
        {data.map((d, i) => {
          const p1 = toPoint(d.cumulativeWords, i);
          const p2 = toPoint(d.masteredWords, i);
          return (
            <g key={i}>
              <circle cx={p1.x} cy={p1.y} r={3} fill="#33583f" />
              <circle cx={p2.x} cy={p2.y} r={3} fill="#9d5f3f" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default StudyTrendChart;