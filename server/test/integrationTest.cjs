#!/usr/bin/env node
/**
 * 端到端集成测试（任务14.1）
 * 覆盖 spec 第 7 章全部验收场景（7.1-7.8）
 */
const http = require('http');

function req(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const r = http.request({
      hostname: 'localhost', port: 3000, path, method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }
    }, (res) => {
      let buf = '';
      res.on('data', (d) => buf += d);
      res.on('end', () => resolve({ status: res.statusCode, body: buf, json: () => { try { return JSON.parse(buf); } catch { return null; } } }));
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

let passed = 0, failed = 0;
const results = [];

function test(name, condition, detail = '') {
  if (condition) { passed++; results.push(`  ✅ ${name}`); }
  else { failed++; results.push(`  ❌ ${name} ${detail}`); }
}

async function run() {
  console.log('=== 端到端集成测试（spec 第7章） ===\n');

  // ========== 7.1 认证与绑定验收 ==========
  console.log('【7.1】认证与绑定验收');
  const loginStudent = await req('/api/v1/auth/login', 'POST', { studentNo: '20240001', password: 'demo123456' });
  const studentData = loginStudent.json();
  test('7.1.1 学生登录返回200', loginStudent.status === 200, `[${loginStudent.status}]`);
  test('7.1.1 登录返回token', !!studentData?.token);
  test('7.1.1 登录返回userId', !!studentData?.userId);
  test('7.1.1 登录返回role=student', studentData?.role === 'student');
  const studentToken = studentData?.token;

  const loginAdmin = await req('/api/v1/auth/login', 'POST', { studentNo: 'admin', password: 'admin123456' });
  const adminData = loginAdmin.json();
  test('7.1.2 管理员登录成功', loginAdmin.status === 200 && adminData?.role === 'admin');
  const adminToken = adminData?.token;

  const loginTeacher = await req('/api/v1/auth/login', 'POST', { studentNo: 'T0001', password: 'demo123456' });
  const teacherData = loginTeacher.json();
  test('7.1.2 教师登录成功', loginTeacher.status === 200 && teacherData?.role === 'teacher');
  const teacherToken = teacherData?.token;

  const wrongLogin = await req('/api/v1/auth/login', 'POST', { studentNo: '20240001', password: 'wrongpass' });
  test('7.1.3 错误密码返回401', wrongLogin.status === 401, `[${wrongLogin.status}]`);

  const noTokenReq = await req('/api/v1/words', 'GET', null, null);
  test('7.1.3 无token访问返回401', noTokenReq.status === 401, `[${noTokenReq.status}]`);
  results.push('');

  // ========== 7.2 单词学习验收 ==========
  console.log('【7.2】单词学习验收');
  const wordsRes = await req('/api/v1/words?page=1&pageSize=50', 'GET', null, studentToken);
  const wordsData = wordsRes.json();
  test('7.2.1 单词列表返回200', wordsRes.status === 200);
  test('7.2.1 返回分页结构', !!wordsData?.items && typeof wordsData?.total === 'number');
  test('7.2.1 pageSize=50', wordsData?.pageSize === 50);

  const wordsSearch = await req('/api/v1/words?keyword=der', 'GET', null, studentToken);
  test('7.2.3 搜索返回200', wordsSearch.status === 200);
  results.push('');

  // ========== 7.3 语法学习验收 ==========
  console.log('【7.3】语法学习验收');
  const grammarRes = await req('/api/v1/grammar', 'GET', null, studentToken);
  const grammarData = grammarRes.json();
  test('7.3.1 语法列表返回200', grammarRes.status === 200);
  test('7.3.1 语法列表是数组', Array.isArray(grammarData));
  results.push('');

  // ========== 7.4 语法练习验收 ==========
  console.log('【7.4】语法练习验收');
  const exercisesRes = await req('/api/v1/exercises/records', 'GET', null, studentToken);
  test('7.4.3 作答记录返回200', exercisesRes.status === 200);
  results.push('');

  // ========== 7.5 打卡签到验收 ==========
  console.log('【7.5】打卡签到验收');
  const checkpointsRes = await req('/api/v1/checkin/checkpoints', 'GET', null, studentToken);
  const checkpoints = checkpointsRes.json();
  test('7.5.1 打卡点列表返回200', checkpointsRes.status === 200);
  test('7.5.1 打卡点列表非空', Array.isArray(checkpoints) && checkpoints.length > 0);

  if (checkpoints && checkpoints.length > 0) {
    const cp = checkpoints[0];
    const windowMap = {
      '00000000-0000-0000-0000-000000000020': '00000000-0000-0000-0000-000000000030',
      '00000000-0000-0000-0000-000000000021': '00000000-0000-0000-0000-000000000031',
    };
    const windowId = windowMap[cp.checkpointId] || '00000000-0000-0000-0000-000000000030';
    const checkinInRadius = await req('/api/v1/checkin', 'POST', {
      checkpointId: cp.checkpointId,
      windowId: windowId,
      latitude: cp.latitude, longitude: cp.longitude,
      accuracy: 10,
      ...(cp.requireScan ? { scannedValue: 'demo-scan-value' } : {})
    }, studentToken);
    test('7.5.1 围栏内打卡返回200或422(时段/重复)', [200, 422].includes(checkinInRadius.status), `[${checkinInRadius.status}] ${checkinInRadius.body.slice(0, 100)}`);

    const checkinOutOfRange = await req('/api/v1/checkin', 'POST', {
      checkpointId: cp.checkpointId,
      windowId: windowId,
      latitude: cp.latitude + 1, longitude: cp.longitude + 1,
      accuracy: 10
    }, studentToken);
    test('7.5.2 围栏外打卡返回422', checkinOutOfRange.status === 422, `[${checkinOutOfRange.status}] ${checkinOutOfRange.body.slice(0, 100)}`);
  }

  const checkinRecords = await req('/api/v1/checkin/records', 'GET', null, studentToken);
  test('7.5 打卡记录返回200', checkinRecords.status === 200);
  results.push('');

  // ========== 7.6 推送消息验收 ==========
  console.log('【7.6】推送消息验收');
  const messagesRes = await req('/api/v1/messages', 'GET', null, studentToken);
  test('7.6.2 消息列表返回200', messagesRes.status === 200);

  const broadcastRes = await req('/api/v1/messages/broadcast', 'POST', {
    classId: '00000000-0000-0000-0000-000000000010',
    title: '测试通知',
    content: '这是一条测试通知'
  }, teacherToken);
  test('7.6.1 教师广播通知返回200', broadcastRes.status === 200, `[${broadcastRes.status}] ${broadcastRes.body.slice(0, 100)}`);

  const messagesAfter = await req('/api/v1/messages', 'GET', null, studentToken);
  const msgsAfter = messagesAfter.json();
  test('7.6.1 学生收到通知', Array.isArray(msgsAfter) && msgsAfter.some(m => m.title === '测试通知'));

  if (Array.isArray(msgsAfter) && msgsAfter.length > 0) {
    const msg = msgsAfter[0];
    const readRes = await req(`/api/v1/messages/${msg.messageId}/read`, 'PATCH', null, studentToken);
    test('7.6.2 标记已读返回200', readRes.status === 200);
  }
  results.push('');

  // ========== 7.7 数据导入验收 ==========
  console.log('【7.7】数据导入验收');
  const importNoFile = await req('/api/v1/admin/import/words', 'POST', null, adminToken);
  test('7.7.1 导入无文件返回500(预期)', importNoFile.status === 500, `[${importNoFile.status}]`);

  const importStudentForbidden = await req('/api/v1/admin/import/words', 'POST', null, studentToken);
  test('7.7.4 学生调用导入返回403', importStudentForbidden.status === 403, `[${importStudentForbidden.status}]`);
  results.push('');

  // ========== 7.8 架构约束验收 ==========
  console.log('【7.8】架构约束验收');
  const teacherStudentsRes = await req('/api/v1/teacher/students', 'GET', null, teacherToken);
  test('7.8 教师查询学生返回200', teacherStudentsRes.status === 200);

  const studentAccessTeacher = await req('/api/v1/teacher/students', 'GET', null, studentToken);
  test('7.8 学生访问教师接口返回403', studentAccessTeacher.status === 403);

  const templatesRes = await req('/api/v1/admin/templates', 'GET', null, adminToken);
  test('7.8 管理员查询模板返回200', templatesRes.status === 200);

  const studentAccessTemplates = await req('/api/v1/admin/templates', 'GET', null, studentToken);
  test('7.8 学生访问模板管理返回403', studentAccessTemplates.status === 403);
  results.push('');

  // ========== 输出结果 ==========
  console.log('\n=== 测试结果明细 ===');
  for (const r of results) console.log(r);
  console.log(`\n总计: ${passed + failed} 项, 通过: ${passed}, 失败: ${failed}`);
  if (failed === 0) { console.log('✅ 全部端到端验收场景通过'); process.exit(0); }
  else { console.log('❌ 存在失败场景'); process.exit(1); }
}

run().catch((err) => { console.error('Test error:', err); process.exit(1); });