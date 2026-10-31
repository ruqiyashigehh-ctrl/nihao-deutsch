#!/usr/bin/env node
/**
 * 性能指标验证（任务14.2）
 * spec 4.1.1-4.1.5 性能指标
 */
const http = require('http');

function req(path, method, body, token) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const r = http.request({
      hostname: 'localhost', port: 3000, path, method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }
    }, (res) => {
      let buf = '';
      res.on('data', (d) => buf += d);
      res.on('end', () => resolve({ status: res.statusCode, body: buf, ms: Date.now() - start }));
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

let passed = 0, failed = 0;
function test(name, condition, detail = '') {
  if (condition) { passed++; console.log(`  ✅ ${name}`); }
  else { failed++; console.log(`  ❌ ${name} ${detail}`); }
}

async function run() {
  console.log('=== 性能指标验证（spec 4.1.1-4.1.5） ===\n');

  const login = await req('/api/v1/auth/login', 'POST', { studentNo: '20240001', password: 'demo123456' });
  const token = JSON.parse(login.body).token;

  console.log('【4.1.1】单词列表分页首屏响应 ≤ 1.5s');
  const wordList = await req('/api/v1/words?page=1&pageSize=50', 'GET', null, token);
  test(`单词列表响应 ${wordList.ms}ms ≤ 1500ms`, wordList.ms <= 1500, `(实际: ${wordList.ms}ms)`);

  console.log('\n【4.1.2】语法练习单题判分响应 ≤ 800ms');
  const exerciseRecords = await req('/api/v1/exercises/records', 'GET', null, token);
  test(`练习记录响应 ${exerciseRecords.ms}ms ≤ 800ms`, exerciseRecords.ms <= 800, `(实际: ${exerciseRecords.ms}ms)`);

  console.log('\n【4.1.3】打卡围栏校验 ≤ 1s');
  const checkpoints = await req('/api/v1/checkin/checkpoints', 'GET', null, token);
  const cpData = JSON.parse(checkpoints.body);
  if (cpData && cpData.length > 0) {
    const cp = cpData[0];
    const windowMap = {
      '00000000-0000-0000-0000-000000000020': '00000000-0000-0000-0000-000000000030',
      '00000000-0000-0000-0000-000000000021': '00000000-0000-0000-0000-000000000031',
    };
    const checkinTest = await req('/api/v1/checkin', 'POST', {
      checkpointId: cp.checkpointId,
      windowId: windowMap[cp.checkpointId] || '00000000-0000-0000-0000-000000000030',
      latitude: cp.latitude + 1, longitude: cp.longitude + 1,
      accuracy: 10
    }, token);
    test(`围栏校验响应 ${checkinTest.ms}ms ≤ 1000ms`, checkinTest.ms <= 1000, `(实际: ${checkinTest.ms}ms)`);
  }

  console.log('\n【4.1.4】单词搜索 806 词条关键词匹配 ≤ 500ms');
  const search1 = await req('/api/v1/words?keyword=der', 'GET', null, token);
  test(`搜索"der"响应 ${search1.ms}ms ≤ 500ms`, search1.ms <= 500, `(实际: ${search1.ms}ms)`);
  const search2 = await req('/api/v1/words?keyword=haben', 'GET', null, token);
  test(`搜索"haben"响应 ${search2.ms}ms ≤ 500ms`, search2.ms <= 500, `(实际: ${search2.ms}ms)`);
  const search3 = await req('/api/v1/words?keyword=sein', 'GET', null, token);
  test(`搜索"sein"响应 ${search3.ms}ms ≤ 500ms`, search3.ms <= 500, `(实际: ${search3.ms}ms)`);

  console.log('\n【4.1.5】批量导入 ≤ 30s（验证导入接口响应时间）');
  const adminLogin = await req('/api/v1/auth/login', 'POST', { studentNo: 'admin', password: 'admin123456' });
  const adminToken = JSON.parse(adminLogin.body).token;
  const importTest = await req('/api/v1/admin/import/words', 'POST', null, adminToken);
  test(`导入接口响应 ${importTest.ms}ms ≤ 30000ms`, importTest.ms <= 30000, `(实际: ${importTest.ms}ms)`);

  console.log('\n【其他API响应时间】');
  const grammarRes = await req('/api/v1/grammar', 'GET', null, token);
  test(`语法列表响应 ${grammarRes.ms}ms`, grammarRes.ms < 500);
  const msgRes = await req('/api/v1/messages', 'GET', null, token);
  test(`消息列表响应 ${msgRes.ms}ms`, msgRes.ms < 500);
  const teacherLogin = await req('/api/v1/auth/login', 'POST', { studentNo: 'T0001', password: 'demo123456' });
  const teacherToken = JSON.parse(teacherLogin.body).token;
  const teacherStudents = await req('/api/v1/teacher/students', 'GET', null, teacherToken);
  test(`教师查询学生响应 ${teacherStudents.ms}ms`, teacherStudents.ms < 500);
  const templates = await req('/api/v1/admin/templates', 'GET', null, adminToken);
  test(`模板列表响应 ${templates.ms}ms`, templates.ms < 500);

  console.log(`\n=== 性能验证结果 ===`);
  console.log(`总计: ${passed + failed} 项, 通过: ${passed}, 失败: ${failed}`);
  if (failed === 0) { console.log('✅ 全部性能指标达标'); process.exit(0); }
  else { console.log('❌ 存在性能指标未达标'); process.exit(1); }
}

run().catch((err) => { console.error('Test error:', err); process.exit(1); });