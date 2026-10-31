-- 0006_student_features.sql: 学生端扩展功能表结构
-- 掌握度、生词本、组队、班级邀请码、作业、出勤覆盖
-- 兼容 SQLite 与 PostgreSQL：主键 UUID 文本，时间 ISO8601 字符串，布尔 INTEGER 0/1

-- ===== words 扩展 lektion 列 =====
ALTER TABLE words ADD COLUMN lektion INTEGER DEFAULT 1;
UPDATE words SET lektion = CASE course WHEN 'A1' THEN 1 WHEN 'A2' THEN 2 ELSE 3 END;

-- ===== 掌握度 =====
CREATE TABLE IF NOT EXISTS word_mastery (
  user_id TEXT NOT NULL,
  word_id TEXT NOT NULL,
  mastered INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, word_id)
);

-- ===== 生词本 =====
CREATE TABLE IF NOT EXISTS notebooks (
  user_id TEXT NOT NULL,
  word_id TEXT NOT NULL,
  added_at TEXT NOT NULL,
  PRIMARY KEY (user_id, word_id)
);

-- ===== 班级邀请码 =====
CREATE TABLE IF NOT EXISTS class_invite_codes (
  class_id TEXT PRIMARY KEY,
  invite_code TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- ===== 作业 =====
CREATE TABLE IF NOT EXISTS homeworks (
  homework_id TEXT PRIMARY KEY,
  quiz_name TEXT NOT NULL,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('vocab', 'grammar')),
  lektion_range TEXT NOT NULL,
  question_count INTEGER NOT NULL,
  deadline TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS homework_targets (
  homework_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT,
  completed_at TEXT,
  PRIMARY KEY (homework_id, user_id)
);

-- ===== 刷题记录 =====
CREATE TABLE IF NOT EXISTS quiz_records (
  record_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('vocab', 'grammar')),
  score INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  total_count INTEGER NOT NULL,
  submitted_at TEXT NOT NULL
);

-- ===== 背词记录 =====
CREATE TABLE IF NOT EXISTS study_records (
  record_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  word_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('known', 'unknown')),
  studied_at TEXT NOT NULL
);

-- ===== 组队 =====
CREATE TABLE IF NOT EXISTS study_pairs (
  pair_id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (class_id, user_id)
);

-- ===== 出勤覆盖（教师手动修正） =====
CREATE TABLE IF NOT EXISTS attendance_overrides (
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  checked INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, date)
);

-- ===== 新增索引 =====
CREATE INDEX IF NOT EXISTS idx_mastery_user ON word_mastery (user_id);
CREATE INDEX IF NOT EXISTS idx_mastery_word ON word_mastery (word_id);
CREATE INDEX IF NOT EXISTS idx_notebook_user ON notebooks (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uk_invite_code ON class_invite_codes (invite_code);
CREATE INDEX IF NOT EXISTS idx_homework_created_by ON homeworks (created_by);
CREATE INDEX IF NOT EXISTS idx_homework_target_user ON homework_targets (user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_record_user ON quiz_records (user_id, submitted_at);
CREATE INDEX IF NOT EXISTS idx_study_record_user ON study_records (user_id, studied_at);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance_overrides (user_id, date);

-- ===== 演示班级邀请码 =====
INSERT INTO class_invite_codes (class_id, invite_code, created_at)
  VALUES ('00000000-0000-0000-0000-000000000010', 'DEMO01', '2026-10-23T00:00:00.000Z')
ON CONFLICT (class_id) DO NOTHING;