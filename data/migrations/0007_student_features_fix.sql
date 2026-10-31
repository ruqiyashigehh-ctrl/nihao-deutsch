-- 0007_student_features_fix.sql: 学生端功能表结构补齐
-- 兼容已有 0006 数据：notebooks / word_mastery / study_pairs / homeworks / attendance_overrides 保留
-- 新增 class_invite_codes / quiz_records / study_records

-- ===== 班级邀请码 =====
CREATE TABLE IF NOT EXISTS class_invite_codes (
  class_id TEXT PRIMARY KEY,
  invite_code TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_invite_code ON class_invite_codes (invite_code);

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

-- ===== 新增索引 =====
CREATE INDEX IF NOT EXISTS idx_quiz_record_user ON quiz_records (user_id, submitted_at);
CREATE INDEX IF NOT EXISTS idx_study_record_user ON study_records (user_id, studied_at);

-- ===== 演示班级邀请码 =====
INSERT INTO class_invite_codes (class_id, invite_code, created_at)
  VALUES ('00000000-0000-0000-0000-000000000010', 'DEMO01', '2026-10-23T00:00:00.000Z')
ON CONFLICT (class_id) DO NOTHING;