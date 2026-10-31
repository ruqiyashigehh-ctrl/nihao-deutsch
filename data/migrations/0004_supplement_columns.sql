-- 0004_supplement_columns.sql: 扩展表结构以容纳知识库5类Excel数据源字段
-- 兼容 SQLite 与 PostgreSQL：ALTER TABLE ADD COLUMN，新增列均允许 NULL 或带 DEFAULT
-- 幂等：使用 IF NOT EXISTS（PostgreSQL 11+）或重复执行忽略错误（SQLite ALTER TABLE 无 IF NOT EXISTS，由 migrate.ts 跳过已执行迁移保证幂等）

-- ===== grammar_points 扩展 =====
ALTER TABLE grammar_points ADD COLUMN external_id TEXT;
ALTER TABLE grammar_points ADD COLUMN book INTEGER;
ALTER TABLE grammar_points ADD COLUMN lektion INTEGER;

-- ===== grammar_exercises 扩展 =====
ALTER TABLE grammar_exercises ADD COLUMN external_id TEXT;
ALTER TABLE grammar_exercises ADD COLUMN grammar_external_id TEXT;
ALTER TABLE grammar_exercises ADD COLUMN error_word_index INTEGER;
ALTER TABLE grammar_exercises ADD COLUMN error_options TEXT;
ALTER TABLE grammar_exercises ADD COLUMN source TEXT;

-- ===== checkpoints 扩展 =====
ALTER TABLE checkpoints ADD COLUMN external_id TEXT;
ALTER TABLE checkpoints ADD COLUMN is_active INTEGER DEFAULT 1;
ALTER TABLE checkpoints ADD COLUMN remark TEXT;

-- ===== check_windows 扩展 =====
ALTER TABLE check_windows ADD COLUMN earliest_time TEXT;
ALTER TABLE check_windows ADD COLUMN latest_time TEXT;
ALTER TABLE check_windows ADD COLUMN allow_late INTEGER DEFAULT 0;
ALTER TABLE check_windows ADD COLUMN weekend_enabled INTEGER DEFAULT 0;
ALTER TABLE check_windows ADD COLUMN holiday_enabled INTEGER DEFAULT 0;

-- ===== copywriting 扩展 =====
ALTER TABLE copywriting ADD COLUMN scene TEXT;
ALTER TABLE copywriting ADD COLUMN type TEXT;
ALTER TABLE copywriting ADD COLUMN trigger TEXT;
ALTER TABLE copywriting ADD COLUMN action TEXT;
ALTER TABLE copywriting ADD COLUMN remark TEXT;

-- ===== 新建 check_window_overrides 表 =====
CREATE TABLE IF NOT EXISTS check_window_overrides (
  override_id TEXT PRIMARY KEY,
  window_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  earliest_time TEXT,
  latest_time TEXT
);

-- ===== 新增索引 =====
CREATE UNIQUE INDEX IF NOT EXISTS uk_grammar_external ON grammar_points (external_id);
CREATE UNIQUE INDEX IF NOT EXISTS uk_exercise_external ON grammar_exercises (external_id);
CREATE INDEX IF NOT EXISTS idx_exercise_grammar_ext ON grammar_exercises (grammar_external_id);
CREATE UNIQUE INDEX IF NOT EXISTS uk_checkpoint_external ON checkpoints (external_id);
CREATE INDEX IF NOT EXISTS idx_copywriting_scene ON copywriting (scene, type);
CREATE UNIQUE INDEX IF NOT EXISTS uk_window_class ON check_window_overrides (window_id, class_id);