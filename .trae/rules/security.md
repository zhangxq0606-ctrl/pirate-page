# 安全规则

## config.js 敏感性

`assets/config.js` 包含 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`，但这些值按 Supabase 设计就是公开的（anon key + RLS 保护）。**不要加进 `.gitignore`**，否则 Cloudflare Pages（从 GitHub 自动拉取构建）部署后找不到该文件，Supabase 连接失效。

真正的管理权限 `SERVICE_ROLE_KEY` 仅存在 Edge Function 环境变量中，代码里不存在。

## Git 安全底线

- `.gitignore` 已正确排除 `.env`、密钥、`node_modules` 等常规雷区
- 唯一需留意：`git add` 时不要误带入不相关的凭据文件