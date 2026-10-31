#!/usr/bin/env node
/**
 * 平台隔离验证脚本（任务13）
 * 扫描业务目录确认无平台API直接调用，验证平台收敛点
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const WEB_SRC = join(ROOT, 'web', 'src');

const PLATFORM_PATTERNS = [
  { pattern: /navigator\s*\.\s*geolocation/g, name: 'navigator.geolocation' },
  { pattern: /navigator\s*\.\s*mediaDevices/g, name: 'navigator.mediaDevices' },
  { pattern: /\bHWH5\b/g, name: 'HWH5' },
  { pattern: /\bwx\s*\./g, name: 'wx.*' },
  { pattern: /\bHWH5nap\s*\./g, name: 'HWH5nap.*' },
];

const BUSINESS_DIRS = [
  join(WEB_SRC, 'pages'),
  join(WEB_SRC, 'components'),
  join(WEB_SRC, 'store'),
  join(WEB_SRC, 'hooks'),
];

const CONVERGENCE_FILES = [
  join(WEB_SRC, 'app', 'AppShell.tsx'),
  join(WEB_SRC, 'app', 'env.ts'),
  join(WEB_SRC, 'app', 'adapterProvider.tsx'),
];

const ADAPTER_DIRS = [
  join(WEB_SRC, 'adapters', 'h5'),
  join(WEB_SRC, 'adapters', 'welink'),
];

function listTsFiles(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) listTsFiles(full, files);
    else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) files.push(full);
  }
  return files;
}

let violations = 0;
let checks = 0;

console.log('=== 任务13：WeLink 双轨架构与平台隔离验证 ===\n');

console.log('【13.1】验证平台 API 隔离（业务目录无平台 API 直接调用）');
for (const dir of BUSINESS_DIRS) {
  const files = listTsFiles(dir);
  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    for (const { pattern, name } of PLATFORM_PATTERNS) {
      checks++;
      const matches = content.match(pattern);
      if (matches) {
        violations++;
        console.log(`  ❌ ${relative(ROOT, file)}: 发现 ${name} (${matches.length}处)`);
      }
    }
  }
}
if (violations === 0) console.log('  ✅ 业务目录无平台 API 直接调用\n');

console.log('【13.3】验证平台收敛点（平台差异仅存在于 AppShell/env/adapterProvider）');
let convergenceViolations = 0;
const allWebFiles = listTsFiles(WEB_SRC).filter(f => !f.includes(join('app', 'env.ts')) && !f.includes(join('app', 'adapterProvider.tsx')) && !f.includes(join('app', 'AppShell.tsx')) && !f.includes('adapters'));
for (const file of allWebFiles) {
  const content = readFileSync(file, 'utf-8');
  for (const { pattern, name } of PLATFORM_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      convergenceViolations++;
      console.log(`  ❌ ${relative(ROOT, file)}: 非收敛点发现 ${name}`);
    }
  }
}
if (convergenceViolations === 0) console.log('  ✅ 平台差异仅存在于收敛点与适配层目录\n');

console.log('【13.3】验证收敛点文件存在');
for (const f of CONVERGENCE_FILES) {
  checks++;
  if (existsSync(f)) console.log(`  ✅ ${relative(ROOT, f)} 存在`);
  else { console.log(`  ❌ ${relative(ROOT, f)} 不存在`); violations++; }
}

console.log('\n【13.2】验证适配层目录存在');
for (const d of ADAPTER_DIRS) {
  checks++;
  if (existsSync(d)) {
    const files = listTsFiles(d);
    console.log(`  ✅ ${relative(ROOT, d)} (${files.length}个文件)`);
  } else { console.log(`  ❌ ${relative(ROOT, d)} 不存在`); violations++; }
}

console.log('\n【13.2】验证适配层接口实现数量（H5 + WeLink 各4个）');
const h5Adapters = listTsFiles(join(WEB_SRC, 'adapters', 'h5'));
const welinkAdapters = listTsFiles(join(WEB_SRC, 'adapters', 'welink'));
console.log(`  H5 适配层: ${h5Adapters.length} 个文件`);
console.log(`  WeLink 适配层: ${welinkAdapters.length} 个文件`);
if (h5Adapters.length >= 4 && welinkAdapters.length >= 4) console.log('  ✅ 适配层实现数量满足要求');
else { console.log('  ❌ 适配层实现数量不足'); violations++; }

console.log(`\n=== 验证结果 ===`);
console.log(`总检查项: ${checks}, 违规: ${violations + convergenceViolations}`);
if (violations === 0 && convergenceViolations === 0) {
  console.log('✅ 任务13 验证通过：双轨架构与平台隔离符合要求');
  process.exit(0);
} else {
  console.log('❌ 任务13 验证失败：存在平台隔离违规');
  process.exit(1);
}