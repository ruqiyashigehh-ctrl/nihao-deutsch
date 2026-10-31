-- 0012_quiz_answers.sql: 刷题逐题明细（支撑学习报告的错题本与薄弱语法分析）
CREATE TABLE IF NOT EXISTS quiz_answers (
  answer_id TEXT PRIMARY KEY,
  record_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('vocab', 'grammar')),
  question_id TEXT NOT NULL,
  question TEXT NOT NULL,
  question_kind TEXT NOT NULL,
  user_answer TEXT,
  correct_answer TEXT NOT NULL,
  is_correct INTEGER NOT NULL DEFAULT 0,
  lektion INTEGER,

  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quiz_answer_user ON quiz_answers (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_answer_wrong ON quiz_answers (user_id, is_correct);
CREATE INDEX IF NOT EXISTS idx_quiz_answer_record ON quiz_answers (record_id);