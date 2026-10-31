-- 0013_quiz_answers_grammar.sql: 为刷题明细补充语法点关联列（薄弱语法分析用）
-- 说明：0012 建表时未包含该列，此处补充（新库同样按 0012 建表后由此迁移补列）
ALTER TABLE quiz_answers ADD COLUMN grammar_point_id TEXT;

CREATE INDEX IF NOT EXISTS idx_quiz_answer_grammar ON quiz_answers (grammar_point_id);