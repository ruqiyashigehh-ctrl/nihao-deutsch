# 你好德语（Sprung）

高校德语学习轻应用 —— H5 移动 Web（比赛演示期），平台无关双轨架构。

## 技术栈

- **前端**：React 18 + TypeScript + Vite，移动端优先，主色 `#005BAC`
- **后端**：Node.js + Express + TypeScript
- **数据库**：PostgreSQL（本地开发可用 SQLite 兼容，生产切 PostgreSQL）
- **共享校验层**：前后端共用 zod schema

## 工程结构（monorepo）

```
nihao-deutsch/
├── shared/          # 前后端共享包（zod schema / 类型 / 适配层契约 / 文案）
├── web/             # 前端工程（React 18 + Vite）
├── server/          # 后端工程（Express + TypeScript）
├── data/            # 迁移脚本与种子数据
│   ├── migrations/
│   └── seed/
├── package.json     # 根工程（npm workspace）
├── tsconfig.base.json
└── .env.example
```

## 快速开始

```bash
# 安装依赖（三工程 workspace 链接）
npm install

# 复制环境变量
cp .env.example .env

# 启动开发（前后端并发）
npm run dev

# 单独启动
npm run dev:web      # 前端 http://localhost:5173
npm run dev:server   # 后端 http://localhost:3000

# 构建
npm run build

# 类型检查
npm run typecheck

# Lint
npm run lint
```

## 架构红线

1. 业务代码禁止直接调用 `HWH5`、`navigator.geolocation`、微信 JS-SDK、`wx.` 等平台 API
2. 全部平台能力收敛到 4 个适配层接口：`AuthAdapter` / `GeoAdapter` / `PushAdapter` / `ScanAdapter`
3. 平台差异收敛在 `<AppShell>` 组件与 `env.ts` 中，业务页面零改动
4. 前后端共享 zod schema 校验

## 环境变量

见 `.env.example`，关键项：

| 变量 | 说明 | 默认 |
|------|------|------|
| `PLATFORM` | 平台形态 `h5` / `welink` | `h5` |
| `DB_DRIVER` | 数据库驱动 `sqlite` / `pg` | `sqlite` |
| `JWT_SECRET` | JWT 签名密钥 | 需设置 |
| `PORT` | 后端端口 | `3000` |

## 文档

- 需求规格：`.codeartsdoer/specs/nihao_deutsch/spec.md`
- 技术设计：`.codeartsdoer/specs/nihao_deutsch/design.md`
- 任务清单：`.codeartsdoer/specs/nihao_deutsch/tasks.md`