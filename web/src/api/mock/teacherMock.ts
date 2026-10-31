import type { ClassInviteCode, AccuracyCell, AttendanceMatrix, PublishHomeworkPayload, GrammarAnalyticsData } from '../../types/domain';

const MOCK_INVITE_CODES: ClassInviteCode[] = [
  { classId: 'c001', className: '德语A2班', inviteCode: 'ABCD12' },
  { classId: 'c002', className: '德语B1班', inviteCode: 'EFGH34' },
];

function generateAccuracy(): AccuracyCell[] {
  const cells: AccuracyCell[] = [];
  const knowledgePoints: Array<'meaning' | 'pos' | 'conjugation'> = ['meaning', 'pos', 'conjugation'];
  for (let l = 1; l <= 12; l++) {
    for (const k of knowledgePoints) {
      cells.push({ lektion: l, knowledge: k, accuracy: Math.floor(Math.random() * 100) });
    }
  }
  return cells;
}

function generateAttendance(): AttendanceMatrix {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  const rows = Array.from({ length: 30 }, (_, i) => ({
    studentId: `s${String(i + 1).padStart(3, '0')}`,
    studentName: `同学${i + 1}`,
    cells: dates.map(() => Math.random() > 0.3),
  }));
  return { dates, rows };
}

export function getInviteCodes(): Promise<ClassInviteCode[]> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_INVITE_CODES), 200));
}

export function getAccuracy(classId: string): Promise<AccuracyCell[]> {
  return new Promise((resolve) => setTimeout(() => resolve(generateAccuracy()), 300));
}

export function getAttendance(classId: string): Promise<AttendanceMatrix> {
  return new Promise((resolve) => setTimeout(() => resolve(generateAttendance()), 300));
}

export function patchAttendance(studentId: string, date: string, checked: boolean): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), 200));
}

export function createHomework(payload: PublishHomeworkPayload): Promise<{ homeworkId: string; targetUserIds: string[] }> {
  return new Promise((resolve) => setTimeout(() => {
    const targetUserIds = Array.from({ length: 30 }, (_, i) => `s${String(i + 1).padStart(3, '0')}`);
    resolve({ homeworkId: `hw${Date.now()}`, targetUserIds });
  }, 300));
}
export async function getGrammarAnalytics(_classId: string): Promise<GrammarAnalyticsData> {
  return {
    overall: { accuracy: 78, participants: 12, totalAnswers: 420, studentCount: 13 },
    byLektion: [
      { lektion: 1, accuracy: 86, answers: 90, participants: 12 },
      { lektion: 2, accuracy: 74, answers: 88, participants: 11 },
      { lektion: 3, accuracy: 69, answers: 86, participants: 10 },
      { lektion: 4, accuracy: 81, answers: 80, participants: 11 },
      { lektion: 5, accuracy: 64, answers: 76, participants: 9 },
    ],
    weakGrammars: [
      { grammarId: 'gp-mock-1', title: '第三格冠词（Dativ）', lektion: 7, accuracy: 52, wrong: 12, total: 25, participants: 8 },
      { grammarId: 'gp-mock-2', title: '疑问词 Wer? Wen? Wem? Was?', lektion: 12, accuracy: 61, wrong: 9, total: 23, participants: 7 },
    ],
  };
}
