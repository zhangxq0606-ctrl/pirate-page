# 比特海盗的码头

一个可部署到 Cloudflare Pages 的纯静态 MVP：展示已审核的 AI 作品、接受投稿、由船长审核。

## 本地查看

直接用静态服务器打开项目根目录，例如 VS Code Live Server。未配置 Supabase 时，首页会显示一件演示作品；投稿与后台会提示配置缺失。

## 接入 Supabase

1. 创建 Supabase 项目，在 SQL Editor 执行 [schema.sql](supabase/schema.sql)。
2. 在 Storage 创建名为 `work-covers` 的 **public** bucket；限制 MIME 为 `image/jpeg,image/png,image/webp`、最大 5MB。
3. 将 Project URL 与 anon public key 填入 `assets/config.js`。**不要使用 `service_role` key。**
4. 按 `supabase/functions/admin/index.ts` 部署 `admin` Edge Function，并设置 `ADMIN_PASSWORD` 和 `SUPABASE_SERVICE_ROLE_KEY` secrets。将文件首部的 `YOUR_DOMAIN` 换成最终站点域名，再部署。
5. Cloudflare Pages 的构建设置：无构建命令，输出目录为根目录。

## 安全边界

- anon key 位于前端是预期行为；权限由 RLS 和 Storage policy 控制。
- 管理密码仅在 Edge Function 环境变量中，绝不写入浏览器代码。当前 MVP 将密码保存在浏览器 `sessionStorage`，关闭标签页即消失。
- `work-covers` 是 public bucket，待审封面虽不在页面展示，但拿到随机 URL 仍可访问。严格私密的审核稿应改为 private bucket 和签名 URL。
- 部署前将 Edge Function 的 CORS 域名固定为你的生产域名；不要保留 `*`。

## 当前范围与后续路线

见 [MVP 范围](docs/mvp-scope.md) 和 [视觉方向](docs/design-direction.md)。
