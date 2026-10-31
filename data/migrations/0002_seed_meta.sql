-- 0002_seed_meta.sql: 默认推送模板与文案清单
-- 使用 ON CONFLICT 语法（SQLite 3.24+ 与 PostgreSQL 均支持）

-- 默认推送模板
INSERT INTO push_templates (template_id, code, title, body, variables, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'checkin_success', '打卡成功', '您已于 {{time}} 在 {{checkpoint}} 打卡成功', '["time","checkpoint"]', '2026-01-01T00:00:00.000Z'),
  ('00000000-0000-0000-0000-000000000002', 'bind_reminder', '绑定提醒', '请尽快完成账号绑定', '[]', '2026-01-01T00:00:00.000Z'),
  ('00000000-0000-0000-0000-000000000003', 'class_notice', '班级通知', '{{title}}', '["title"]', '2026-01-01T00:00:00.000Z')
ON CONFLICT (template_id) DO NOTHING;

-- 默认文案清单（与 shared/i18n/zh-CN.ts 对应）
INSERT INTO copywriting (key, value) VALUES
  ('auth.loginFailed', '学号或密码错误'),
  ('auth.accountLocked', '账号已锁定，请 {{minutes}} 分钟后重试'),
  ('auth.loginSuccess', '登录成功'),
  ('auth.bindRequired', '请先完成账号绑定'),
  ('auth.bindSuccess', '绑定成功'),
  ('auth.tokenExpired', '登录已过期，请重新登录'),
  ('auth.forbidden', '无权访问'),
  ('word.searchEmpty', '未找到匹配的单词'),
  ('word.loadFailed', '加载失败，请重试'),
  ('word.detailEmpty', '暂无单词详情'),
  ('word.conjugationEmpty', '暂无变位信息'),
  ('grammar.listEmpty', '暂无语法点'),
  ('grammar.ruleTextEmpty', '规则文本待补充'),
  ('grammar.loadFailed', '加载失败，请重试'),
  ('exercise.notEnough', '练习题库完善中'),
  ('exercise.alreadyAnswered', '该题已作答'),
  ('exercise.submitFailed', '提交失败，已保存至本地，网络恢复后自动同步'),
  ('exercise.submitSuccess', '提交成功'),
  ('exercise.historyEmpty', '暂无作答记录'),
  ('checkin.locationFailed', '定位失败，请检查定位权限'),
  ('checkin.locationLowAccuracy', '定位精度不足，请到开阔处重试'),
  ('checkin.scanUnavailable', '扫码功能不可用，请手动输入'),
  ('checkin.outOfRange', '不在打卡范围内'),
  ('checkin.outOfWindow', '不在打卡时段内'),
  ('checkin.alreadyChecked', '今日已打卡'),
  ('checkin.success', '打卡成功'),
  ('checkin.scanRequired', '请先扫码'),
  ('message.listEmpty', '暂无消息'),
  ('message.templateNotFound', '推送模板不存在'),
  ('message.targetInvalid', '目标用户无效'),
  ('message.broadcastSuccess', '通知发送成功'),
  ('import.formatError', '导入文件格式错误'),
  ('import.partialFailed', '部分条目导入失败，请查看失败明细'),
  ('import.success', '导入成功'),
  ('import.allFailed', '导入失败，请检查文件格式'),
  ('import.permissionDenied', '无导入权限'),
  ('common.loading', '加载中…'),
  ('common.retry', '重试'),
  ('common.confirm', '确认'),
  ('common.cancel', '取消'),
  ('common.submit', '提交'),
  ('common.back', '返回'),
  ('common.networkError', '网络异常，请稍后重试'),
  ('common.serverError', '服务暂时不可用，请稍后重试'),
  ('common.unknownError', '未知错误')
ON CONFLICT (key) DO NOTHING;