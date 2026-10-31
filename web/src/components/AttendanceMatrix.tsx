import React from 'react';
import { Table, Button, Checkbox, message } from 'antd';
import type { AttendanceMatrix as AttendanceMatrixType } from '../types/domain';
import { UrgeButton } from './UrgeButton';
import { exportAttendanceCsv } from '../utils/exportCsv';

interface AttendanceMatrixProps {
  matrix: AttendanceMatrixType | null;
  onPatchCell: (studentId: string, date: string, checked: boolean) => Promise<void>;
  onUrge: (studentId: string, context: string) => Promise<{ success: boolean; message: string }>;
}

export const AttendanceMatrix: React.FC<AttendanceMatrixProps> = ({ matrix, onPatchCell, onUrge }) => {
  if (!matrix) return <div style={{ textAlign: 'center', padding: 20, color: '#707866' }}>暂无考勤数据</div>;

  const handleCellClick = async (studentId: string, date: string, checked: boolean) => {
    try {
      await onPatchCell(studentId, date, !checked);
      message.success(!checked ? '补录成功' : '已取消补录');
    } catch {
      message.error('数据已被他人更新，请刷新后重试');
    }
  };

  const columns = [
    { title: '学号', dataIndex: 'studentId', key: 'studentId', width: 100, fixed: 'left' as const },
    { title: '姓名', dataIndex: 'studentName', key: 'studentName', width: 80, fixed: 'left' as const },
    ...matrix.dates.map((date) => ({
      title: date.slice(5),
      dataIndex: date,
      key: date,
      width: 60,
      render: (_: unknown, record: { studentId: string; studentName: string; cells: boolean[]; __idx: number }) => {
        const idx = matrix.dates.indexOf(date);
        const checked = record.cells[idx];
        return (
          <Checkbox
            checked={checked}
            onChange={() => handleCellClick(record.studentId, date, checked)}
          />
        );
      },
    })),
    {
      title: '操作', key: 'action', fixed: 'right' as const, width: 100,
      render: (_: unknown, record: { studentId: string; studentName: string; cells: boolean[] }) => {
        const allChecked = record.cells.every((c) => c);
        if (allChecked) return null;
        return <UrgeButton studentId={record.studentId} context="考勤未完成" onUrge={onUrge} />;
      },
    },
  ];

  const dataSource = matrix.rows.map((r, idx) => ({ ...r, key: idx, __idx: idx }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>早读考勤表</h3>
        <Button onClick={() => exportAttendanceCsv(matrix)}>导出 CSV</Button>
      </div>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="small"
        scroll={{ x: true, y: 400 }}
      />
    </div>
  );
};

export default AttendanceMatrix;