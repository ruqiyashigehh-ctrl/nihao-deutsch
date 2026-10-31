export type Role = 'student' | 'teacher' | 'admin';
export type Difficulty = '初级' | '中级' | '高级';
export type ExerciseType = 'G1' | 'G2';
export type Platform = 'h5' | 'welink';
export type PartOfSpeech = '名词' | '动词' | '形容词' | '副词' | '代词' | '介词' | '连词' | '数词' | '冠词' | '感叹词';

export interface User {
  userId: string;
  studentNo: string;
  name: string;
  classId: string | null;
  role: Role;
  isFirstBind: boolean;
  failCount: number;
  lockedUntil: string | null;
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface ClassInfo {
  classId: string;
  className: string;
  createdAt: string;
}

export interface Conjugation {
  conjugationId: string;
  wordId: string;
  tense: string;
  person: string;
  form: string;
}

export interface WordExample {
  exampleId: string;
  wordId: string;
  german: string;
  translation: string;
}

export interface WordEntry {
  wordId: string;
  lemma: string;
  phonetic: string | null;
  pos: PartOfSpeech;
  meaning: string;
  plural: string | null;
  course: string;
  difficulty: Difficulty;
  conjugations: Conjugation[];
  examples: WordExample[];
  createdAt: string;
}

export interface GrammarExample {
  exampleId: string;
  grammarId: string;
  german: string;
  translation: string;
}

export interface GrammarPoint {
  grammarId: string;
  title: string;
  ruleText: string | null;
  difficulty: Difficulty;
  exerciseAvailable: boolean;
  examples: GrammarExample[];
  createdAt: string;
}

export interface GrammarExercise {
  exerciseId: string;
  grammarId: string;
  type: ExerciseType;
  question: string;
  answer: string;
  explanation: string | null;
  difficulty: Difficulty;
  createdAt: string;
}

export interface ExerciseRecord {
  recordId: string;
  userId: string;
  exerciseId: string;
  userAnswer: string;
  isCorrect: boolean;
  submittedAt: string;
}

export interface Checkpoint {
  checkpointId: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  requireScan: boolean;
  createdAt: string;
}

export interface CheckWindow {
  windowId: string;
  checkpointId: string;
  startTime: string;
  endTime: string;
  weekdays: number[];
}

export interface CheckRecord {
  recordId: string;
  userId: string;
  checkpointId: string;
  windowId: string;
  latitude: number;
  longitude: number;
  scannedValue: string | null;
  checkedAt: string;
}

export interface Message {
  messageId: string;
  userId: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface PushTemplate {
  templateId: string;
  code: string;
  title: string;
  body: string;
  variables: string[];
  createdAt: string;
}

export interface AuditLog {
  logId: string;
  userId: string | null;
  action: string;
  target: string | null;
  detail: string | null;
  ip: string | null;
  requestId: string | null;
  createdAt: string;
}

export interface Copywriting {
  key: string;
  value: string;
}

export interface Pagination<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}