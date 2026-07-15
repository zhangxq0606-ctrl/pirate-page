-- 比特海盗的码头：在 Supabase SQL Editor 中执行
create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null check (char_length(title) between 1 and 60),
  description text not null check (char_length(description) between 1 and 120),
  author_name text not null check (char_length(author_name) between 1 and 30),
  author_role text not null check (author_role in ('大副','舵手','领航员','炮手','瞭望员','船医','水手')),
  cover_url text not null,
  link text,
  journey_log text not null check (char_length(journey_log) between 1 and 3000),
  tags text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  review_note text
);
alter table public.works enable row level security;

-- 公开只读已审核作品。任何人都不可经 REST API 改动审核状态。
create policy "approved works are public" on public.works for select using (status = 'approved');
create policy "public can submit pending works" on public.works for insert with check (status = 'pending');

-- 在 Dashboard 创建 public bucket：work-covers；仅允许图片和 5MB 以下文件。
-- 注意：public bucket 中的未审核封面若知道随机 URL 仍可访问。MVP 用 UUID 路径降低猜测风险；
-- 若需严格保密待审稿件，下一版改 private bucket + Edge Function 签名 URL。
create policy "anyone uploads a cover" on storage.objects for insert to anon
with check (
  bucket_id = 'work-covers'
  and (storage.extension(name) = any (array['jpg','jpeg','png','webp']))
  and coalesce((metadata->>'size')::bigint, 0) <= 5242880
);
