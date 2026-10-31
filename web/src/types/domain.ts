export interface StudyCardData {
  wordId: string;
  word: string;
  phonetic: string;
  pos: string;
  definition: string;
  example?: string;
}

export type QuizType = 'vocab' | 'grammar';
export type QuestionCount = 10 | 20 | 30;

export interface QuizConfig {
  type: QuizType;
  lektionRange: number[];
  questionCount: QuestionCount;
}

export type QuestionType = 'choice' | 'fill';

export interface QuizQuestionData {
  questionId: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  lektion?: number | null;
  grammarId?: string | null;
}

export interface WrongQuestion {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
}

export interface QuizResultData {
  score: number;
  correctCount: number;
  wrongCount: number;
  wrongQuestions: WrongQuestion[];
}

export interface UserProfileData {
  userId: string;
  name: string;
  avatar?: string;
  className: string;
}

export interface StudyStatsData {
  totalWords: number;
  masteredWords: number;
  weeklyCheckinDays: number;
}

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapData {
  date: string;
  level: HeatmapLevel;
}

export interface ReportWeekData {
  weekLabel: string;
  cumulativeWords: number;
  masteredWords: number;
}

export interface WeakGrammarData {
  grammarId: string;
  title: string;
  lektion: number | null;
  total: number;
  wrong: number;
  accuracy: number;
}

export interface WrongQuestionItemData {
  source: 'quiz' | 'exercise';
  question: string;
  userAnswer: string;
  correctAnswer: string;
  grammarTitle: string | null;
  lektion: number | null;
  createdAt: string;
}

export interface ReportDetailData {
  weakGrammars: WeakGrammarData[];
  wrongQuestions: WrongQuestionItemData[];
  wrongCount: number;
}
// ========== 学生端扩展类型 ==========

export interface HomeworkCardData {
  homeworkId: string;
  quizName: string;
  deadline: string;
  status: 'pending' | 'completed';
}

export type RankType = 'reading' | 'vocab';

export interface RankItem {
  rank: number;
  studentId: string;
  name: string;
  value: number;
  isMe?: boolean;
}

export interface MyRank {
  rank: number | 'unranked';
  name: string;
  value: number;
}

export interface ClassmateItem {
  studentId: string;
  name: string;
  studentNo: string;
}

export interface PairingMethod {
  kind: 'code' | 'classmate';
  code?: string;
  classmateId?: string;
}

export interface LektionMastery {
  lektion: number;
  total: number;
  mastered: number;
}

// ========== 教师端类型 ==========

export interface ClassInviteCode {
  classId: string;
  className: string;
  inviteCode: string;
}

export interface PublishHomeworkPayload {
  classIds: string[];
  lektionRange: number[];
  quizType: QuizType;
  questionCount: QuestionCount;
  deadline: string;
}

export type KnowledgePoint = 'meaning' | 'pos' | 'conjugation';

export interface AccuracyCell {
  lektion: number;
  knowledge: KnowledgePoint;
  accuracy: number;
}

export interface AttendanceCell {
  studentId: string;
  studentName: string;
  date: string;
  checked: boolean;
}

export interface AttendanceMatrix {
  dates: string[];
  rows: { studentId: string; studentName: string; cells: boolean[] }[];
}

export interface GrammarLektionStatData {
  lektion: number;
  accuracy: number;
  answers: number;
  participants: number;
}

export interface GrammarWeakPointData {
  grammarId: string;
  title: string;
  lektion: number | null;
  accuracy: number;
  wrong: number;
  total: number;
  participants: number;
}

export interface GrammarAnalyticsData {
  overall: {
    accuracy: number;
    participants: number;
    totalAnswers: number;
    studentCount: number;
  };
  byLektion: GrammarLektionStatData[];
  weakGrammars: GrammarWeakPointData[];
}

// ========== 管理端类型 ==========

export interface CheckinPointItem {
  checkpointId: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  status: 'enabled' | 'disabled';
}

export interface ClassWithTeacher {
  classId: string;
  className: string;
  inviteCode: string;
  teacherName: string | null;
  teacherId: string | null;
}

export interface StudentWithClass {
  userId: string;
  studentNo: string;
  name: string;
  className: string | null;
  classId: string | null;
}

export interface GrammarExerciseInput {
  type: 'G1' | 'G2';
  question: string;
  answer: string;
  explanation?: string;
}

export interface GrammarPointInput {
  title: string;
  ruleText: string;
  exercises: GrammarExerciseInput[];
}

export interface AdminStats {
  totalUsers: number;
  todayCheckinRate: number;
  todayAvgWords: number;
  todayQuizCount: number;
}

export interface CheckinTrend {
  dates: string[];
  counts: number[];
}