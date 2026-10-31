import React from 'react';
import { Table } from 'antd';
import type { AccuracyCell, KnowledgePoint } from '../types/domain';

interface AccuracyHeatmapProps {
  cells: AccuracyCell[];
}

function accuracyToColor(accuracy: number): string {
  if (accuracy >= 80) return '#43654e';
  if (accuracy >= 60) return '#9eb48b';
  if (accuracy >= 40) return '#a3752d';
  if (accuracy >= 20) return '#9d5f3f';
  return '#a34334';
}

const KNOWLEDGE_POINTS: { key: KnowledgePoint; label: string }[] = [
  { key: 'meaning', label: '词义' },
  { key: 'pos', label: '词性' },
  { key: 'conjugation', label: '变位' },
];

export const AccuracyHeatmap: React.FC<AccuracyHeatmapProps> = ({ cells }) => {
  const lektions = Array.from(new Set(cells.map((c) => c.lektion))).sort((a, b) => a - b);
  const columns = [
    { title: 'Lektion', dataIndex: 'lektion', key: 'lektion', width: 80 },
    ...KNOWLEDGE_POINTS.map((kp) => ({
      title: kp.label,
      dataIndex: kp.key,
      key: kp.key,
      render: (cell: AccuracyCell | undefined) => {
        if (!cell) return '-';
        return (
          <div style={{
            background: accuracyToColor(cell.accuracy), color: '#faf7ef', textAlign: 'center',
            padding: '4px 8px', borderRadius: 4, fontWeight: 600,
          }}>
            {cell.accuracy}%
          </div>
        );
      },
    })),
  ];

  const dataSource = lektions.map((lektion) => {
    const row: Record<string, AccuracyCell | number | undefined> = { lektion, key: lektion };
    for (const kp of KNOWLEDGE_POINTS) {
      row[kp.key] = cells.find((c) => c.lektion === lektion && c.knowledge === kp.key);
    }
    return row;
  });

  return <Table dataSource={dataSource} columns={columns} pagination={false} size="small" scroll={{ x: true }} />;
};

export default AccuracyHeatmap;