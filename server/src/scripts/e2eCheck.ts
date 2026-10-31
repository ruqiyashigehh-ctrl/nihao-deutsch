import { env } from '../config/env';

const BASE = `http://localhost:${env.PORT}/api/v1`;

async function check(name: string, fn: () => Promise<void>): Promise<boolean> {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err: any) {
    console.log(`  ✗ ${name}: ${err?.message ?? String(err)}`);
    return false;
  }
}

async function post<T = any>(url: string, body: any, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${url}`, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

async function get<T = any>(url: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${url}`, { headers });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

async function main(): Promise<void> {
  console.log('=== 端到端闭环验证 ===\n');

  let token = '';
  let allPass = true;

  console.log('[1/9] 登录演示学生');
  allPass = await check('学生登录', async () => {
    const r = await post('/auth/login', { studentNo: '20240001', password: 'demo123456' });
    if (!r.token) throw new Error('未返回token');
    token = r.token;
  }) && allPass;

  console.log('[2/9] 登录演示教师');
  allPass = await check('教师登录', async () => {
    const r = await post('/auth/login', { studentNo: 'T0001', password: 'demo123456' });
    if (!r.token) throw new Error('未返回token');
  }) && allPass;

  console.log('[3/9] 登录管理员');
  allPass = await check('管理员登录', async () => {
    const r = await post('/auth/login', { studentNo: 'admin', password: 'admin123456' });
    if (!r.token) throw new Error('未返回token');
  }) && allPass;

  console.log('[4/9] 查询单词列表');
  allPass = await check('单词列表(有数据)', async () => {
    const r = await get('/words?page=1&pageSize=10', token);
    const items = (r as any).items ?? r;
    if (!Array.isArray(items)) throw new Error('返回格式错误');
    if (items.length === 0) throw new Error('单词列表为空');
  }) && allPass;

  console.log('[5/9] 查询语法点列表');
  allPass = await check('语法点列表(有数据)', async () => {
    const r = await get('/grammar', token);
    if (!Array.isArray(r)) throw new Error('返回格式错误');
    if (r.length === 0) throw new Error('语法点列表为空');
  }) && allPass;

  console.log('[6/9] 查询练习题目');
  let exerciseId = '';
  allPass = await check('练习题目(有数据)', async () => {
    const grammar = await get<any[]>('/grammar', token);
    if (grammar.length > 0) {
      const r = await get(`/exercises?grammarId=${grammar[0].grammarId}`, token);
      if (Array.isArray(r) && r.length > 0) exerciseId = r[0].exerciseId;
    }
    if (!exerciseId) throw new Error('无练习题');
  }) && allPass;

  console.log('[7/9] 提交作答');
  if (exerciseId) {
    allPass = await check('提交作答', async () => {
      await post(`/exercises/${exerciseId}/submit`, { userAnswer: 'test' }, token);
    }) && allPass;
  } else {
    console.log('  ⏭️ 跳过提交作答（无练习题）');
  }

  console.log('[8/9] 查询打卡点');
  allPass = await check('打卡点', async () => {
    await get('/checkin/checkpoints', token);
  }) && allPass;

  console.log('[9/9] 查询消息');
  allPass = await check('消息列表', async () => {
    await get('/messages', token);
  }) && allPass;

  console.log('\n=== 验证结果 ===');
  if (allPass) {
    console.log('✅ 端到端闭环验证通过');
  } else {
    console.log('❌ 端到端闭环验证存在失败项');
  }
  process.exit(allPass ? 0 : 1);
}

main().catch((err) => {
  console.error('验证脚本异常:', err);
  process.exit(1);
});