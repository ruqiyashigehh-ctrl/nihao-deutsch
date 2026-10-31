-- 0001_init.sql: 初始表结构与索引
-- 兼容 SQLite 与 PostgreSQL：主键 UUID 文本，时间 ISO8601 字符串，布尔 INTEGER 0/1

-- ===== 用户与班级 =====
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  student_no TEXT NOT NULL,
  name TEXT NOT NULL,
  class_id TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  password_hash TEXT NOT NULL,
  is_first_bind INTEGER NOT NULL DEFAULT 1,
  fail_count INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS classes (
  class_id TEXT PRIMARY KEY,
  class_name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS teacher_classes (
  teacher_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  PRIMARY KEY (teacher_id, class_id)
);

-- ===== 单词 =====
CREATE TABLE IF NOT EXISTS words (
  word_id TEXT PRIMARY KEY,
  lemma TEXT NOT NULL,
  phonetic TEXT,
  pos TEXT NOT NULL,
  meaning TEXT NOT NULL,
  plural TEXT,
  course TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('初级', '中级', '高级')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS conjugations (
  conjugation_id TEXT PRIMARY KEY,
  word_id TEXT NOT NULL,
  tense TEXT NOT NULL,
  person TEXT NOT NULL,
  form TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS word_examples (
  example_id TEXT PRIMARY KEY,
  word_id TEXT NOT NULL,
  german TEXT NOT NULL,
  translation TEXT NOT NULL
);

-- ===== 语法 =====
CREATE TABLE IF NOT EXISTS grammar_points (
  grammar_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  rule_text TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('初级', '中级', '高级')),
  exercise_available INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS grammar_examples (
  example_id TEXT PRIMARY KEY,
  grammar_id TEXT NOT NULL,
  german TEXT NOT NULL,
  translation TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS grammar_exercises (
  exercise_id TEXT PRIMARY KEY,
  grammar_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('G1', 'G2')),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('初级', '中级', '高级')),
  created_at TEXT NOT NULL
);

-- ===== 练习记录 =====
CREATE TABLE IF NOT EXISTS exercise_records (
  record_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  is_correct INTEGER NOT NULL,
  submitted_at TEXT NOT NULL
);

-- ===== 打卡 =====
CREATE TABLE IF NOT EXISTS checkpoints (
  checkpoint_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  radius REAL NOT NULL,
  require_scan INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS check_windows (
  window_id TEXT PRIMARY KEY,
  checkpoint_id TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  weekdays TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS check_records (
  record_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  checkpoint_id TEXT NOT NULL,
  window_id TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  scanned_value TEXT,
  checked_at TEXT NOT NULL
);

-- ===== 消息与推送 =====
CREATE TABLE IF NOT EXISTS messages (
  message_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS push_templates (
  template_id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  variables TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL
);

-- ===== 审计与文案 =====
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  target TEXT,
  detail TEXT,
  ip TEXT,
  request_id TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS copywriting (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ===== 索引 =====
CREATE UNIQUE INDEX IF NOT EXISTS uk_student_no ON users (student_no);
CREATE INDEX IF NOT EXISTS idx_user_class ON users (class_id);
CREATE INDEX IF NOT EXISTS idx_teacher_class ON teacher_classes (class_id);

CREATE INDEX IF NOT EXISTS idx_lemma ON words (lemma);
CREATE INDEX IF NOT EXISTS idx_meaning ON words (meaning);
CREATE INDEX IF NOT EXISTS idx_course_diff ON words (course, difficulty);
CREATE INDEX IF NOT EXISTS idx_conjugation_word ON conjugations (word_id);
CREATE INDEX IF NOT EXISTS idx_word_example ON word_examples (word_id);

CREATE INDEX IF NOT EXISTS idx_grammar_diff ON grammar_points (difficulty);
CREATE INDEX IF NOT EXISTS idx_grammar_example ON grammar_examples (grammar_id);
CREATE INDEX IF NOT EXISTS idx_exercise_grammar ON grammar_exercises (grammar_id);
CREATE INDEX IF NOT EXISTS idx_exercise_type ON grammar_exercises (type);

CREATE UNIQUE INDEX IF NOT EXISTS uk_user_exercise ON exercise_records (user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_record_user ON exercise_records (user_id);

CREATE INDEX IF NOT EXISTS idx_check_window_cp ON check_windows (checkpoint_id);
CREATE UNIQUE INDEX IF NOT EXISTS uk_user_cp_window ON check_records (user_id, checkpoint_id, window_id);
CREATE INDEX IF NOT EXISTS idx_check_record_user ON check_records (user_id);

CREATE INDEX IF NOT EXISTS idx_message_user ON messages (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_message_created ON messages (created_at);

CREATE UNIQUE INDEX IF NOT EXISTS uk_template_code ON push_templates (code);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs (created_at);