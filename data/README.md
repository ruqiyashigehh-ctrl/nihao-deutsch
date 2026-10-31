# 数据目录

## 结构说明

```
data/
├── migrations/       # SQL 迁移脚本（按版本号顺序执行）
│   ├── 0001_init.sql       # 初始表结构与索引
│   ├── 0002_seed_meta.sql  # 默认推送模板与文案
│   └── 0003_seed_demo.sql  # 比赛演示期种子数据
├── seed/             # 种子数据源文件（CSV/JSON）
└── dev.db            # 开发期 SQLite 数据库（运行时自动生成，勿提交）
```

## 迁移执行

迁移在服务启动时自动执行（`server/src/dal/migrate.ts`），通过 `schema_migrations` 版本记录表保证幂等。

手动执行：`npm run migrate`

## SQLite ↔ PostgreSQL 兼容

- 主键统一使用应用层生成的 UUID 文本存储
- 时间统一使用 ISO8601 字符串
- 布尔值在 DAL 层映射（SQLite 0/1 ↔ PG BOOLEAN）
- 切换 `DB_DRIVER=pg` 即切 PostgreSQL，业务层无改动