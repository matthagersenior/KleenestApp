import { ensureSocialStyles } from './social-theme.js';
import { createProgressionMetricsCore } from '../progression/progression-metrics-core.js';

const VIEWS = Object.freeze({
  feed: ['Feed', 'Community posts, discoveries, tips and wins.'],
  network: ['Network', 'People, follows and community connections.'],
  discover: ['Discover', 'Places, events, offers and community knowledge.'],
  compete: ['Compete', 'Challenges, contests, games and community progress.'],
  messages: ['Messages', 'Your community conversations.'],
  notifications: ['Notifications', 'Updates about your community activity.']
});

export function createSocialCore({ supabase, mediaCore, root, user = null } = {}) {
  if (!supabase) throw new Error('Social Core requires Supabase.');
  if (!root) throw new Error('Social Core requires a mount root.');
  ensureSocialStyles();
  const progression = createProgressionMetricsCore({ supabase });
  const state = { user, view: 'feed', destroyed: false, channels: [], composer: null, posts: [], summary: [] };
  const q = table => supabase.from(table);
  const requireUser = () => { if (!state.user) throw new Error('Sign in required.'); return state.user; };
  const safe = fn => Promise.resolve().then(fn).catch(error => { console.warn('[Kleenest] Social detail unavailable', error); return []; });

  async function list(table, builder) {
    return safe(async () => { let query = q(table).select('*'); if (builder) query = builder(query) || query; const { data, error } = await query.limit(40); if (error) throw error; return data || []; });
  }
  async function getPosts() { const { data, error } = await q('social_posts').select('*').order('created_at', { ascending: false }).limit(50); if (error) throw error; state.posts = data || []; return state.posts; }
  async function loadSummary() { state.summary = await safe(() => progression.summary()) || []; return state.summary; }

  async function createPost({ content, kind = 'discovery', file = null } = {}) {
    const current = requireUser(); if (!content?.trim()) throw new Error('Post content is required.');
    let media = null;
    if (file) { if (!mediaCore) throw new Error('Media Core is unavailable.'); media = await mediaCore.upload(file, { userId: current.id, namespace: 'social', pathPrefix: 'posts' }); }
    const payload = { user_id: current.id, content: content.trim(), kind };
    if (media) Object.assign(payload, { media_url: media.url, media_type: media.media_type, media_storage_path: media.storage_path, media_size_bytes: media.media_size_bytes });
    try { const { data, error } = await q('social_posts').insert(payload).select().single(); if (error) throw error; await progression.record('social_post', { sourceId: data.id, metadata: { kind } }); return data; }
    catch (error) { if (media?.storage_path) await safe(() => mediaCore.remove(media.storage_path, { userId: current.id, namespace: 'social' })); throw error; }
  }
  async function toggleLike(postId) { const current=requireUser(); const {data:existing}=await q('social_post_likes').select('post_id').eq('post_id',postId).eq('user_id',current.id).maybeSingle(); if(existing){const {error}=await q('social_post_likes').delete().eq('post_id',postId).eq('user_id',current.id);if(error)throw error;return false} const {error}=await q('social_post_likes').insert({post_id:postId,user_id:current.id});if(error)throw error;await progression.record('social_like',{sourceId:postId});return true; }
  async function toggleSave(postId) { const current=requireUser(); const {data:existing}=await q('social_post_saves').select('post_id').eq('post_id',postId).eq('user_id',current.id).maybeSingle(); if(existing){const {error}=await q('social_post_saves').delete().eq('post_id',postId).eq('user_id',current.id);if(error)throw error;return false} const {error}=await q('social_post_saves').insert({post_id:postId,user_id:current.id});if(error)throw error;await progression.record('social_save',{sourceId:postId});return true; }
  async function addComment(postId, content) { const current=requireUser(); if(!content?.trim())throw new Error('Comment cannot be empty.'); const {data,error}=await q('social_post_comments').insert({post_id:postId,user_id:current.id,content:content.trim()}).select().single();if(error)throw error;await progression.record('social_comment',{sourceId:postId});return data; }
  async function deletePost(post) { const current=requireUser();const {error}=await q('social_posts').delete().eq('id',post.id).eq('user_id',current.id);if(error)throw error;if(post.media_storage_path&&mediaCore)await mediaCore.remove(post.media_storage_path,{userId:current.id,namespace:'social'}); }

  async function panelData(view) {
    if(view==='network') return { follows: await list('follows',x=>state.user?x.eq('follower_id',state.user.id).order('created_at',{ascending:false}):x), activity: await list('social_activity',x=>x.order('created_at',{ascending:false})) };
    if(view==='discover') return { locations: await list('locations',x=>x.eq('is_active',true).order('updated_at',{ascending:false})), events: await list('business_events',x=>x.eq('status','active').order('event_date',{ascending:true})), promotions: await list('promotions',x=>x.eq('active',true).order('created_at',{ascending:false})) };
    if(view==='compete') return { games: await list('progression_games',x=>x.eq('enabled',true).order('created_at',{ascending:false})), challenges: await list('progression_challenges',x=>x.eq('enabled',true).order('created_at',{ascending:false})), contests: await list('contests',x=>x.in('status',['scheduled','active']).order('starts_at',{ascending:true})) };
    if(view==='messages') return { messages: state.user ? await list('messages',x=>x.or(`from_id.eq.${state.user.id},to_id.eq.${state.user.id}`).order('created_at',{ascending:false})) : [] };
    if(view==='notifications') return { notifications: state.user ? await list('notifications',x=>x.eq('user_id',state.user.id).order('created_at',{ascending:false})) : [] };
    return {};
  }

  const esc = value => String(value ?? '').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const date = value => { const d=new Date(value); return Number.isNaN(d.getTime())?'':d.toLocaleDateString(undefined,{month:'short',day:'numeric'}); };
  const empty = text => `<div class="social-core__empty-inline">${esc(text)}</div>`;
  const detail = (title,text,meta='') => `<article class="social-core__detail-card"><strong>${esc(title)}</strong>${meta?`<small>${esc(meta)}</small>`:''}<p>${esc(text)}</p></article>`;
  const metric = name => Number(state.summary.find(x=>x.metric===name)?.quantity||0);

  function progressCard() { const xp=state.summary.reduce((n,x)=>n+Number(x.points_awarded||0),0);const actions=state.summary.reduce((n,x)=>n+Number(x.event_count||0),0);return `<section class="social-core__progress"><div><span>COMMUNITY XP</span><strong>${xp.toLocaleString()}</strong><small>${actions.toLocaleString()} progression actions</small></div><div class="social-core__progress-grid"><span>Posts ${metric('social_post')}</span><span>Comments ${metric('social_comment')}</span><span>Likes ${metric('social_like')}</span><span>Saves ${metric('social_save')}</span></div></section>`; }

  async function panel(view) {
    if(view==='feed') return `<div class="social-core__feed" data-region="feed"></div>`;
    const data=await panelData(view);
    if(view==='network') return `<section class="social-core__detail-grid"><div class="social-core__detail-section"><div class="social-core__section-head"><div><span>NETWORK</span><h2>Connections</h2></div><strong>${data.follows.length}</strong></div>${data.follows.map(x=>detail('Following',`Member ${x.following_id}`,date(x.created_at))).join('')||empty('You have no connections yet.')}</div><div class="social-core__detail-section"><div class="social-core__section-head"><div><span>ACTIVITY</span><h2>Community activity</h2></div></div>${data.activity.map(x=>detail(x.activity_type||'Community activity',x.metadata?.message||'A community action was recorded.',date(x.created_at))).join('')||empty('No recent community activity.')}</div></section>`;
    if(view==='discover') return `<section class="social-core__detail-grid"><div class="social-core__detail-section"><div class="social-core__section-head"><div><span>PLACES</span><h2>Discoveries</h2></div><strong>${data.locations.length}</strong></div>${data.locations.map(x=>detail(x.name||'Location',x.address||x.city||'Nearby place',x.place_type||'Place')).join('')||empty('No discoverable places are available yet.')}</div><div class="social-core__detail-section"><div class="social-core__section-head"><div><span>OPPORTUNITIES</span><h2>Events & offers</h2></div></div>${data.events.map(x=>detail(x.title||'Event',x.description||'Community event',x.event_date||'')).join('')}${data.promotions.map(x=>detail(x.title||'Promotion',x.description||x.discount||'Business offer',x.ends_at?`Ends ${date(x.ends_at)}`:'')).join('')||empty('No active events or promotions yet.')}</div></section>`;
    if(view==='compete') return `<section class="social-core__detail-grid"><div class="social-core__detail-section"><div class="social-core__section-head"><div><span>COMPETE</span><h2>Games & challenges</h2></div></div>${data.games.map(x=>detail(x.name,x.description,`${x.difficulty||'easy'} · ${x.reward_points||0} XP`)).join('')}${data.challenges.map(x=>detail(x.name,x.description,`${x.period||'weekly'} · ${x.reward_points||0} XP`)).join('')||empty('No active games or challenges yet.')}</div><div class="social-core__detail-section"><div class="social-core__section-head"><div><span>CONTESTS</span><h2>Community contests</h2></div><strong>${data.contests.length}</strong></div>${data.contests.map(x=>detail(x.name,x.description||'Community contest',`${x.status} · ends ${date(x.ends_at)}`)).join('')||empty('No active contests yet.')}</div></section>`;
    if(view==='messages') return `<section class="social-core__detail-section"><div class="social-core__section-head"><div><span>INBOX</span><h2>Conversations</h2></div><strong>${data.messages.length}</strong></div>${data.messages.map(x=>detail(x.from_id===state.user?.id?'You':'Community member',x.content||'Message',`${x.status||'sent'} · ${date(x.created_at)}`)).join('')||empty('No messages yet. Start a conversation when you connect with another member.')}</section>`;
    return `<section class="social-core__detail-section"><div class="social-core__section-head"><div><span>UPDATES</span><h2>Notifications</h2></div><strong>${data.notifications.length}</strong></div>${data.notifications.map(x=>detail(x.title||x.type||'Community update',x.body||'Community activity update.',date(x.created_at))).join('')||empty('You are all caught up.')}</section>`;
  }

  async function render() {
    if(state.destroyed)return;
    await Promise.all([loadSummary(),state.view==='feed'?getPosts():Promise.resolve()]);
    const content=await panel(state.view); root.replaceChildren();
    const shell=document.createElement('section');shell.className='social-core';
    shell.innerHTML=`<header class="social-core__header"><div class="social-core__eyebrow">KLEENEST COMMUNITY</div><div class="social-core__header-row"><div><h1>Social</h1><p>${esc(VIEWS[state.view][1])}</p></div><button type="button" class="social-core__share" data-action="compose"><span>+</span> Share</button></div></header>${progressCard()}<nav class="social-core__nav" aria-label="Social sections">${Object.entries(VIEWS).map(([key,meta])=>`<button type="button" class="${state.view===key?'active':''}" data-view="${key}">${meta[0]}</button>`).join('')}</nav><div class="social-core__body">${content}</div>`;
    root.append(shell);
    shell.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',async()=>{state.view=b.dataset.view;await render();}));
    shell.querySelector('[data-action="compose"]')?.addEventListener('click',openComposer);
    if(state.view==='feed')renderFeed(shell.querySelector('[data-region="feed"]'));
  }

  function renderFeed(feed){
    if(!state.posts.length){feed.innerHTML=`<div class="social-core__empty"><div class="social-core__empty-icon">+</div><h2>Your community starts here</h2><p>Share a discovery, helpful tip, verification, route or win. Every useful contribution can feed your progression.</p><button type="button" data-empty-share>Share your first post</button></div>`;feed.querySelector('[data-empty-share]').onclick=openComposer;return;}
    feed.innerHTML=state.posts.map(post=>`<article class="social-core__post"><div class="social-core__post-meta"><strong>${esc(post.kind||'Community post')}</strong><span>${date(post.created_at)}</span></div><p>${esc(post.content||'')}</p>${post.media_url?`<img src="${esc(post.media_url)}" alt="Community media" loading="lazy">`:''}<div class="social-core__post-actions"><button type="button" data-like="${post.id}">Like</button><button type="button" data-save="${post.id}">Save</button><button type="button" data-comment="${post.id}">Comment</button></div></article>`).join('');
    feed.querySelectorAll('[data-like]').forEach(b=>b.onclick=async()=>{await toggleLike(b.dataset.like);b.classList.toggle('active')});
    feed.querySelectorAll('[data-save]').forEach(b=>b.onclick=async()=>{await toggleSave(b.dataset.save);b.classList.toggle('active')});
    feed.querySelectorAll('[data-comment]').forEach(b=>b.onclick=async()=>{const text=window.prompt('Add a helpful comment');if(text){await addComment(b.dataset.comment,text);await render()}});
  }

  function openComposer(){
    requireUser();if(state.composer)state.composer.remove();const modal=document.createElement('dialog');state.composer=modal;modal.className='social-core__dialog';
    modal.innerHTML=`<form class="social-core__composer"><div class="social-core__composer-head"><div><div class="social-core__eyebrow">COMMUNITY POST</div><h2>Share with the community</h2></div><button type="button" class="social-core__close" data-cancel aria-label="Close">×</button></div><select name="kind"><option value="discovery">Discovery</option><option value="tip">Tip</option><option value="verification">Verification</option><option value="review">Review</option><option value="route">Route</option><option value="win">Community win</option></select><textarea name="content" maxlength="2000" required placeholder="Share something useful with Kleenest…"></textarea><label class="social-core__file"><span>Add a photo</span><input name="media" type="file" accept="image/jpeg,image/png,image/webp"></label><div class="social-core__composer-actions"><button type="button" data-cancel>Cancel</button><button type="submit" value="publish">Publish</button></div></form>`;
    document.body.append(modal);modal.showModal();const close=()=>{try{modal.close()}catch(_){}state.composer=null;modal.remove()};modal.querySelectorAll('[data-cancel]').forEach(b=>b.onclick=close);modal.oncancel=e=>{e.preventDefault();close()};modal.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=e.currentTarget,s=f.querySelector('[value="publish"]');s.disabled=true;s.textContent='Publishing…';try{await createPost({content:f.content.value,kind:f.kind.value,file:f.media.files[0]||null});close();await render()}catch(error){s.disabled=false;s.textContent='Publish';alert(error.message||'Post could not be published.')}};
  }
  function subscribe(){if(!state.user)return;const channel=supabase.channel(`social-core-v2-${state.user.id}`).on('postgres_changes',{event:'*',schema:'public',table:'social_posts'},()=>{if(!state.destroyed&&state.view==='feed')render()}).subscribe();state.channels.push(channel)}
  function destroy(){state.destroyed=true;if(state.composer){try{state.composer.close()}catch(_){}state.composer.remove();state.composer=null}state.channels.forEach(c=>{try{supabase.removeChannel(c)}catch(_){}});state.channels.length=0;root.replaceChildren()}
  subscribe();
  return Object.freeze({render,destroy,getPosts,createPost,deletePost,toggleLike,toggleSave,addComment,requireUser,getCompetitions:()=>panelData('compete'),get state(){return {...state}}});
}
