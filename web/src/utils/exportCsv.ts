import type { AttendanceMatrix } from '../types/domain';

export function exportAttendanceCsv(matrix: AttendanceMatrix): void {
  const header = ['学号', '姓名', ...matrix.dates];
  const rows = matrix.rows.map((r) => [
    r.studentId, r.studentName, ...r.cells.map((c) => (c ? '✓' : '✗')),
  ]);
  const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `考勤记录_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}