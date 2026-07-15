// 部署：supabase functions deploy admin --no-verify-jwt
// Secrets：supabase secrets set ADMIN_PASSWORD=... SUPABASE_SERVICE_ROLE_KEY=...
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = { 'Access-Control-Allow-Origin': 'https://pirate.captainxq.me', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Content-Type': 'application/json' };
const validStatuses = ['pending', 'approved', 'rejected'];

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = await request.json();
    if (!body.password || body.password !== Deno.env.get('ADMIN_PASSWORD')) return Response.json({ error: '口令不正确。' }, { status: 401, headers: corsHeaders });
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    if (body.action === 'list') {
      const status = validStatuses.includes(body.status) ? body.status : 'pending';
      const { data, error } = await admin.from('works').select('*').eq('status', status).order('created_at', { ascending: false });
      if (error) throw error;
      return Response.json({ works: data }, { headers: corsHeaders });
    }
    if (body.action === 'review') {
      if (!['approved', 'rejected'].includes(body.status) || !body.id) return Response.json({ error: '审核参数不完整。' }, { status: 400, headers: corsHeaders });
      if (body.status === 'rejected' && !String(body.review_note || '').trim()) return Response.json({ error: '驳回时需要填写理由。' }, { status: 400, headers: corsHeaders });
      const { error } = await admin.from('works').update({ status: body.status, review_note: body.status === 'rejected' ? String(body.review_note).trim() : null }).eq('id', body.id);
      if (error) throw error;
      return Response.json({ ok: true }, { headers: corsHeaders });
    }
    return Response.json({ error: '未知操作。' }, { status: 400, headers: corsHeaders });
  } catch (error) { return Response.json({ error: error.message || '后台发生错误。' }, { status: 500, headers: corsHeaders }); }
});
