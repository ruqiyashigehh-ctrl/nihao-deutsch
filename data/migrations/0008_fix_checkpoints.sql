-- 0008_fix_checkpoints.sql: 按交付物 checkin_points_template.xlsx 修正打卡点
-- CP-001 国合楼 / CP-002 卓越楼 / CP-003 第四教学楼（半径 50m，启用）
-- 说明：时段沿用原配置值（08:00-20:00，工作日），仅第三个打卡点补充同时段

-- ===== 打卡点 1：国合楼（CP-001，主教学楼） =====
UPDATE checkpoints SET
  name = '国合楼', latitude = 31.2848, longitude = 121.5541, radius = 50,
  require_scan = 0, is_active = 1, external_id = 'CP-001', remark = '主教学楼'
WHERE checkpoint_id = '00000000-0000-0000-0000-000000000020';

-- ===== 打卡点 2：卓越楼（CP-002，备用打卡点） =====
UPDATE checkpoints SET
  name = '卓越楼', latitude = 31.2856, longitude = 121.5541, radius = 50,
  require_scan = 0, is_active = 1, external_id = 'CP-002', remark = '备用打卡点'
WHERE checkpoint_id = '00000000-0000-0000-0000-000000000021';

-- ===== 打卡点 3：第四教学楼（CP-003，备用打卡点） =====
INSERT INTO checkpoints (checkpoint_id, name, latitude, longitude, radius, require_scan, created_at, external_id, is_active, remark)
  VALUES ('00000000-0000-0000-0000-000000000022', '第四教学楼', 31.2867, 121.5573, 50, 0, '2026-10-23T00:00:00.000Z', 'CP-003', 1, '备用打卡点')
ON CONFLICT (checkpoint_id) DO UPDATE SET
  name = excluded.name, latitude = excluded.latitude, longitude = excluded.longitude,
  radius = excluded.radius, require_scan = excluded.require_scan,
  is_active = excluded.is_active, external_id = excluded.external_id, remark = excluded.remark;

-- ===== 第三个打卡点的时段（沿用 08:00-20:00 工作日配置） =====
INSERT INTO check_windows (window_id, checkpoint_id, start_time, end_time, weekdays)
  VALUES ('00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000022', '08:00', '20:00', '[1,2,3,4,5]')
ON CONFLICT (window_id) DO NOTHING;

-- ===== 演示打卡记录坐标同步到新打卡点 =====
UPDATE check_records SET latitude = 31.2848, longitude = 121.5541
WHERE checkpoint_id = '00000000-0000-0000-0000-000000000020';
UPDATE check_records SET latitude = 31.2856, longitude = 121.5541
WHERE checkpoint_id = '00000000-0000-0000-0000-000000000021';