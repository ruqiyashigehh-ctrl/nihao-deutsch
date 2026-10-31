import type { CheckinPointItem, ClassWithTeacher, StudentWithClass, AdminStats, CheckinTrend } from '../../types/domain';

const MOCK_CHECKIN_POINTS: CheckinPointItem[] = [
  { checkpointId: 'cp01', name: '教学楼A', latitude: 31.2304, longitude: 121.4737, radius: 500, status: 'enabled' },
  { checkpointId: 'cp02', name: '图书馆', latitude: 31.2314, longitude: 121.4747, radius: 500, status: 'enabled' },
  { checkpointId: 'cp03', name: '操场', latitude: 31.2294, longitude: 121.4727, radius: 300, status: 'disabled' },
  { checkpointId: 'cp04', name: '实验楼', latitude: 31.2324, longitude: 121.4757, radius: 500, status: 'enabled' },
  { checkpointId: 'cp05', name: '食堂', latitude: 31.2284, longitude: 121.4717, radius: 200, status: 'enabled' },
];

const MOCK_CLASSES: ClassWithTeacher[] = [
  { classId: 'c001', className: '德语A2班', inviteCode: 'ABCD12', teacherName: '李老师', teacherId: 't001' },
  { classId: 'c002', className: '德语B1班', inviteCode: 'EFGH34', teacherName: '王老师', teacherId: 't002' },
  { classId: 'c003', className: '德语A1班', inviteCode: 'IJKL56', teacherName: null, teacherId: null },
  { classId: 'c004', className: '德语B2班', inviteCode: 'MNOP78', teacherName: '李老师', teacherId: 't001' },
  { classId: 'c005', className: '德语C1班', inviteCode: 'QRST90', teacherName: '赵老师', teacherId: 't003' },
  { classId: 'c006', className: '德语入门班', inviteCode: 'UVWX23', teacherName: null, teacherId: null },
];

const MOCK_STUDENTS: StudentWithClass[] = Array.from({ length: 120 }, (_, i) => ({
  userId: `u${String(i + 1).padStart(3, '0')}`,
  studentNo: `2026${String(i + 1).padStart(4, '0')}`,
  name: `学生${i + 1}`,
  className: `德语${['A1', 'A2', 'B1', 'B2'][i % 4]}班`,
  classId: `c00${(i % 4) + 1}`,
}));

const MOCK_STATS: AdminStats = {
  totalUsers: 156,
  todayCheckinRate: 68,
  todayAvgWords: 42,
  todayQuizCount: 23,
};

function generateTrend(): CheckinTrend {
  const dates: string[] = [];
  const counts: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
    counts.push(Math.floor(Math.random() * 40) + 60);
  }
  return { dates, counts };
}

export function getCheckinPoints(): Promise<CheckinPointItem[]> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_CHECKIN_POINTS), 200));
}

export function createCheckinPoint(input: Omit<CheckinPointItem, 'checkpointId'>): Promise<CheckinPointItem> {
  return new Promise((resolve) => setTimeout(() => {
    resolve({ ...input, checkpointId: `cp${Date.now()}` });
  }, 300));
}

export function toggleCheckinPoint(id: string, status: 'enabled' | 'disabled'): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), 200));
}

export function getClassesWithTeacher(): Promise<ClassWithTeacher[]> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_CLASSES), 200));
}

export function getStudentsWithClass(): Promise<StudentWithClass[]> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_STUDENTS), 300));
}

export function bindTeacher(classId: string, teacherId: string): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), 200));
}

export function resetPassword(userId: string): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), 200));
}

export function getStats(): Promise<AdminStats> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_STATS), 200));
}

export function getTrend(): Promise<CheckinTrend> {
  return new Promise((resolve) => setTimeout(() => resolve(generateTrend()), 200));
}