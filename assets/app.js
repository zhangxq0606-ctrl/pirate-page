import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_FUNCTION } from './config.js';

const configured = !SUPABASE_URL.startsWith('YOUR_') && !SUPABASE_ANON_KEY.startsWith('YOUR_');
const db = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const roles = ['大副', '舵手', '领航员', '炮手', '瞭望员', '船医', '水手'];
const tags = ['网页', '工具', 'AI 应用', '小程序', '脚本', '数据可视化', '游戏', '其他'];
function initTheme(){if(location.protocol==='file:')return;const apply=theme=>{document.body.dataset.theme=theme;document.querySelectorAll('[data-theme-view]').forEach(view=>{view.hidden=view.dataset.themeView!==theme});document.querySelectorAll('[data-theme-toggle]').forEach(button=>button.setAttribute('aria-label',theme==='day'?'当前日航，切换到夜航主题':'当前夜航，切换到日航主题'))};const saved=localStorage.getItem('pirate-theme-v2');apply(saved==='day'||saved==='night'?saved:(document.body.dataset.theme||'day'));document.querySelectorAll('[data-theme-toggle]').forEach(button=>button.addEventListener('click',()=>{document.body.dataset.themeMotion='switched';const next=document.body.dataset.theme==='day'?'night':'day';localStorage.setItem('pirate-theme-v2',next);apply(next)}))}
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const dateText = value => new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'long',day:'numeric'}).format(new Date(value));
const cover = work => work.cover_url ? `<img src="${escapeHtml(work.cover_url)}" alt="${escapeHtml(work.title)} 的封面">` : `<div class="cover-placeholder">${escapeHtml(work.title.slice(0,4))}</div>`;
const role = work => `<span class="role-badge role-${escapeHtml(work.author_role)}">${escapeHtml(work.author_role)}</span>`;
const tagHtml = work => `<div class="tags">${(work.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>`;
const card = work => `<a class="work-card" href="work.html?id=${encodeURIComponent(work.id)}"><div class="card-content"><h3>${escapeHtml(work.title)}</h3><p class="description">${escapeHtml(work.description)}</p><div class="card-meta"><span>${escapeHtml(work.author_name)}</span>${role(work)}</div>${tagHtml(work)}</div></a>`;
async function approvedWorks(){if(!db)return [];const {data,error}=await db.from('works').select('*').eq('status','approved').order('created_at',{ascending:false});if(error)throw error;return data}
async function initLanding(){const target=document.querySelector('#home-work-count');if(!target)return;if(!db){target.textContent='作品持续更新中';return}try{const {count:approvedCount,error}=await db.from('works').select('id',{count:'exact',head:true}).eq('status','approved');if(error)throw error;target.textContent=`已收录 ${approvedCount||0} 件作品 · 持续更新中`}catch(error){target.textContent='作品持续更新中'}}function setMessage(el,message,error=false){el.textContent=message;el.classList.remove('receipt');el.classList.toggle('error',error)}
function setReceipt(el){el.classList.remove('error');el.classList.add('receipt');el.innerHTML='<span>BERTH REQUEST RECEIVED</span><strong>靠岸申请已收到</strong><small>船长审核通过后，它会出现在抵港名录。</small><a href="works.html">返回抵港名录 <b aria-hidden="true">→</b></a>'}

async function initHome(){const grid=document.querySelector('#works-grid'),filter=document.querySelector('#tag-filter'),empty=document.querySelector('#empty-state'),count=document.querySelector('#work-count');const finish=()=>grid?.setAttribute('aria-busy','false');if(!db){if(count)count.textContent='名录正在准备中';filter.innerHTML='';grid.innerHTML='<p class="status-note">名录服务正在准备中。</p>';empty.classList.add('hidden');finish();return}let works=[];try{works=await approvedWorks()}catch(error){grid.innerHTML=`<p class="status-note">作品暂时无法靠岸：${escapeHtml(error.message)}</p>`;finish();return}if(count)count.textContent=`${works.length} 件作品已靠岸`;const render=active=>{const list=active==='全部'?works:works.filter(item=>(item.tags||[]).includes(active));grid.innerHTML=list.map(card).join('');empty.classList.toggle('hidden',list.length>0)};filter.innerHTML=['全部',...tags].map((tag,index)=>`<button class="${index===0?'active':''}" data-tag="${tag}">${tag}</button>`).join('');filter.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;filter.querySelectorAll('button').forEach(item=>item.classList.toggle('active',item===button));render(button.dataset.tag)});render('全部');finish()}async function initWork(){
  const target=document.querySelector('#work-detail'),id=new URLSearchParams(location.search).get('id');
  if(!id){location.href='works.html';return}
  let work;
  try{
    if(!db){target.innerHTML='<p class="status-note">详情服务正在准备中。<a href="works.html">返回抵港名录</a></p>';return}
    else{const {data,error}=await db.from('works').select('*').eq('id',id).eq('status','approved').single();if(error)throw error;work=data}
  }catch(error){target.innerHTML=`<p class="status-note">找不到这件作品。<a href="works.html">返回抵港名录</a></p>`;return}
  if(!work){target.innerHTML='<p class="status-note">这件作品还没靠岸。<a href="works.html">返回抵港名录</a></p>';return}
  target.innerHTML=`<a class="back-link" href="works.html">← 返回抵港名录</a><header class="detail-masthead"><p class="eyebrow">${dateText(work.created_at)} · PORT LOG</p><h1 class="detail-title">${escapeHtml(work.title)}</h1><p class="detail-summary">${escapeHtml(work.description)}</p><div class="detail-meta"><div class="detail-byline"><span>${escapeHtml(work.author_name)}</span>${role(work)}</div>${tagHtml(work)}</div></header><div class="cover detail-cover">${cover(work)}</div><div class="detail-actions">${work.link?`<a class="button button-small" target="_blank" rel="noopener noreferrer" href="${escapeHtml(work.link)}">去看看 <span>↗</span></a>`:'<span class="detail-link-note">暂未提供作品链接</span>'}<button class="text-button" id="share-work">复制分享链接</button></div><article class="journey"><p class="eyebrow">JOURNEY LOG</p><h2>航程录</h2><p>${escapeHtml(work.journey_log)}</p></article>`;
  document.querySelector('#share-work')?.addEventListener('click',async()=>{await navigator.clipboard.writeText(location.href);document.querySelector('#share-work').textContent='链接已复制'})
}function initSubmit(){
  const form=document.querySelector('#submit-form'),message=document.querySelector('#form-message'),roleSelect=document.querySelector('#author-role'),tagOptions=document.querySelector('#submit-tags');
  roleSelect.innerHTML=roles.map(value=>`<option value="${value}">${value}</option>`).join('');
  tagOptions.innerHTML=tags.map(tag=>`<label class="tag-option"><input type="checkbox" name="tags" value="${tag}"><span>${tag}</span></label>`).join('');
  const selectedTags=()=>[...tagOptions.querySelectorAll('input:checked')].map(input=>input.value);
  tagOptions.addEventListener('change',event=>{if(selectedTags().length>3){event.target.checked=false;setMessage(message,'最多选择 3 个标签。',true);return}setMessage(message,'')});
  const saved=JSON.parse(localStorage.getItem('pirate-profile')||'{}');
  form.author_name.value=saved.name||'';
  roleSelect.value=saved.role||'水手';
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!db){setMessage(message,'请先在 assets/config.js 填写 Supabase URL 和 anon key。',true);return}
    const fields=new FormData(form),file=fields.get('cover'),selected=selectedTags();
    if(selected.length<1){setMessage(message,'请至少选择 1 个作品标签。',true);return}
    if(!file?.size||file.size>5*1024*1024){setMessage(message,'封面图必须小于 5MB。',true);return}
    const extension=file.name.split('.').pop().toLowerCase(),path=`incoming/${crypto.randomUUID()}.${extension}`;
    const submitButton=form.querySelector('button[type="submit"]');
    submitButton.disabled=true;
    setMessage(message,'正在把作品送进港…');
    try{
      const {error:uploadError}=await db.storage.from('work-covers').upload(path,file,{contentType:file.type,upsert:false});
      if(uploadError)throw uploadError;
      const {data:urlData}=db.storage.from('work-covers').getPublicUrl(path);
      const payload={title:fields.get('title').trim(),description:fields.get('description').trim(),author_name:fields.get('author_name').trim(),author_role:fields.get('author_role'),tags:selected,cover_url:urlData.publicUrl,link:fields.get('link').trim()||null,journey_log:fields.get('journey_log').trim(),status:'pending'};
      const {error}=await db.from('works').insert(payload);
      if(error)throw error;
      localStorage.setItem('pirate-profile',JSON.stringify({name:payload.author_name,role:payload.author_role}));
      form.reset();
      form.author_name.value=payload.author_name;
      roleSelect.value=payload.author_role;
      setReceipt(message);
    }catch(error){setMessage(message,`投递失败：${error.message}`,true)}finally{submitButton.disabled=false}
  })
}async function adminCall(action,payload={}){const password=sessionStorage.getItem('pirate-admin-password');const response=await fetch(`${SUPABASE_URL}/functions/v1/${ADMIN_FUNCTION}`,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_ANON_KEY},body:JSON.stringify({password,action,...payload})});const json=await response.json().catch(()=>({}));if(!response.ok)throw new Error(json.error||'后台请求失败');return json}
function initAdmin(){const login=document.querySelector('#admin-login'),panel=document.querySelector('#admin-panel'),message=document.querySelector('#login-message'),logout=document.querySelector('#logout'),tabs=document.querySelector('#admin-tabs'),list=document.querySelector('#review-list');let status='pending';const render=async()=>{try{const {works}=await adminCall('list',{status});list.innerHTML=works.length?works.map(work=>`<article class="review-card"><div class="cover">${cover(work)}</div><div><p class="eyebrow">${dateText(work.created_at)} · ${escapeHtml(work.author_name)}</p><h3>${escapeHtml(work.title)}</h3><p>${escapeHtml(work.description)}</p><p class="muted">${escapeHtml(work.journey_log.slice(0,180))}${work.journey_log.length>180?'…':''}</p>${status==='pending'?`<div class="review-actions"><button class="button button-small" data-review="approved" data-id="${work.id}">通过</button><button class="button button-small danger" data-review="rejected" data-id="${work.id}">驳回</button></div>`:`<p class="status-note">${work.review_note?`备注：${escapeHtml(work.review_note)}`:'已处理'}</p>`}</div></article>`).join(''):'<div class="empty-state"><p>这一栏没有作品。</p></div>'}catch(error){list.innerHTML=`<p class="status-note">${escapeHtml(error.message)}</p>`}};const show=()=>{login.classList.add('hidden');panel.classList.remove('hidden');logout.classList.remove('hidden');render()};if(sessionStorage.getItem('pirate-admin-password'))show();document.querySelector('#login-form').addEventListener('submit',async event=>{event.preventDefault();if(!db){setMessage(message,'请先配置 Supabase。',true);return}sessionStorage.setItem('pirate-admin-password',new FormData(event.currentTarget).get('password'));try{await adminCall('list',{status:'pending'});show()}catch(error){sessionStorage.removeItem('pirate-admin-password');setMessage(message,error.message,true)}});logout.addEventListener('click',()=>{sessionStorage.removeItem('pirate-admin-password');location.reload()});tabs.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;status=button.dataset.status;tabs.querySelectorAll('button').forEach(item=>item.classList.toggle('active',item===button));render()});list.addEventListener('click',async event=>{const button=event.target.closest('[data-review]');if(!button)return;const action=button.dataset.review;let review_note=null;if(action==='rejected'){review_note=prompt('告诉作者需要修改什么：');if(review_note===null)return;if(!review_note.trim()){alert('驳回时需要填写理由。');return}}button.disabled=true;try{await adminCall('review',{id:button.dataset.id,status:action,review_note});render()}catch(error){alert(error.message);button.disabled=false}})}
initTheme();const page=document.body.dataset.page;if(page==='home')initLanding();if(page==='works')initHome();if(page==='work')initWork();if(page==='submit')initSubmit();if(page==='admin')initAdmin();
