-- 0003_seed_demo.sql: 比赛演示期种子数据（演示打卡点与时段）
-- 演示账号通过应用层脚本插入（需 bcrypt 哈希密码）

-- 演示班级
INSERT INTO classes (class_id, class_name, created_at) VALUES
  ('00000000-0000-0000-0000-000000000010', '德语2024级1班', '2026-01-01T00:00:00.000Z')
ON CONFLICT (class_id) DO NOTHING;

-- 演示打卡点（教学楼A栋，坐标为示例值）
INSERT INTO checkpoints (checkpoint_id, name, latitude, longitude, radius, require_scan, created_at) VALUES
  ('00000000-0000-0000-0000-000000000020', '教学楼A栋', 39.993040, 116.318620, 200.0, 0, '2026-01-01T00:00:00.000Z'),
  ('00000000-0000-0000-0000-000000000021', '外语学院B栋', 39.994100, 116.319800, 150.0, 1, '2026-01-01T00:00:00.000Z')
ON CONFLICT (checkpoint_id) DO NOTHING;

-- 演示打卡时段（工作日 08:00-20:00）
INSERT INTO check_windows (window_id, checkpoint_id, start_time, end_time, weekdays) VALUES
  ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000020', '08:00', '20:00', '[1,2,3,4,5]'),
  ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000021', '08:00', '20:00', '[1,2,3,4,5]')
ON CONFLICT (window_id) DO NOTHING;