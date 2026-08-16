import { ensureSocialStyles } from './social-theme.js';
import { createProgressionMetricsCore } from '../progression/progression-metrics-core.js';

const VIEWS = Object.freeze({
  feed: ['Feed', 'Community posts, discoveries, tips and wins.'],
  network: ['Network', 'People, follows and community connections.'],
  discover: ['Discover', 'Find useful places, discoveries and community knowledge.'],
  compete: ['Compete', 'Challenges, contests, games and leaderboards.'],
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
  const safe = fn => Promise.resolve().then(fn).catch(error => { console.error('[Social Core]', error); return null; });

  async function getPosts() {
    const { data, error } = await q('social_posts').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    state.posts = data || [];
    return state.posts;
  }

  async function loadSummary() { state.summary = await safe(() => progression.summary()) || []; return state.summary; }

  async function createPost({ content, kind = 'discovery', file = null } = {}) {
    const current = requireUser();
    if (!content?.trim()) throw new Error('Post content is required.');
    let media = null;
    if (file) {
      if (!mediaCore) throw new Error('Media Core is unavailable.');
      media = await mediaCore.upload(file, { userId: current.id, namespace: 'social', pathPrefix: 'posts' });
    }
    const payload = { user_id: current.id, content: content.trim(), kind };
    if (media) Object.assign(payload, { media_url: media.url, media_type: media.media_type, media_storage_path: media.storage_path, media_size_bytes: media.media_size_bytes });
    try {
      const { data, error } = await q('social_posts').insert(payload).select().single();
      if (error) throw error;
      await progression.record('social_post', { sourceId: data.id, metadata: { kind } });
      return data;
    } catch (error) {
      if (media?.storage_path) await safe(() => mediaCore.remove(media.storage_path, { userId: current.id, namespace: 'social' }));
      throw error;
    }
  }

  async function toggleLike(postId) {
    const current = requireUser();
    const { data: existing } = await q('social_post_likes').select('post_id').eq('post_id', postId).eq('user_id', current.id).maybeSingle();
    if (existing) { const { error } = await q('social_post_likes').delete().eq('post_id', postId).eq('user_id', current.id); if (error) throw error; return false; }
    const { error } = await q('social_post_likes').insert({ post_id: postId, user_id: current.id });
    if (error) throw error;
    await progression.record('social_like', { sourceId: postId });
    return true;
  }

  async function toggleSave(postId) {
    const current = requireUser();
    const { data: existing } = await q('social_post_saves').select('post_id').eq('post_id', postId).eq('user_id', current.id).maybeSingle();
    if (existing) { const { error } = await q('social_post_saves').delete().eq('post_id', postId).eq('user_id', current.id); if (error) throw error; return false; }
    const { error } = await q('social_post_saves').insert({ post_id: postId, user_id: current.id });
    if (error) throw error;
    await progression.record('social_save', { sourceId: postId });
    return true;
  }

  async function addComment(postId, content) {
    const current = requireUser();
    if (!content?.trim()) throw new Error('Comment cannot be empty.');
    const { data, error } = await q('social_post_comments').insert({ post_id: postId, user_id: current.id, content: content.trim() }).select().single();
    if (error) throw error;
    await progression.record('social_comment', { sourceId: postId });
    return data;
  }

  async function getComments(postId) {
    const { data, error } = await q('social_post_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function getCompetitions() {
    const [games, challenges, contests] = await Promise.all([
      q('progression_games').select('*').eq('enabled', true).order('created_at', { ascending: false }).limit(12),
      q('progression_challenges').select('*').eq('enabled', true).order('created_at', { ascending: false }).limit(12),
      q('contests').select('*').order('starts_at', { ascending: true }).limit(12)
    ]);
    if (games.error) throw games.error; if (challenges.error) throw challenges.error; if (contests.error) throw contests.error;
    return { games: games.data || [], challenges: challenges.data || [], contests: contests.data || [] };
  }

  async function getActivity() {
    const { data, error } = await q('social_activity').select('*').order('created_at', { ascending: false }).limit(30);
    if (error) throw error;
    return data || [];
  }

  async function getMessages() {
    const current = requireUser();
    const { data, error } = await q('messages').select('*').or(`from_user_id.eq.${current.id},to_user_id.eq.${current.id}`).order('created_at', { ascending: false }).limit(30);
    if (error) throw error;
    return data || [];
  }

  async function getNotifications() {
    const current = requireUser();
    const { data, error } = await q('notifications').select('*').eq('user_id', current.id).order('created_at', { ascending: false }).limit(30);
    if (error) throw error;
    return data || [];
  }

  async function deletePost(post) {
    const current = requireUser();
    const { error } = await q('social_posts').delete().eq('id', post.id).eq('user_id', current.id);
    if (error) throw error;
    if (post.media_storage_path && mediaCore) await mediaCore.remove(post.media_storage_path, { userId: current.id, namespace: 'social' });
  }

  function metricCard() {
    const total = state.summary.reduce((sum, row) => sum + Number(row.points_awarded || 0), 0);
    const actions = state.summary.reduce((sum, row) => sum + Number(row.event_count || 0), 0);
    return `<section class="social-core__progress"><div><span>COMMUNITY XP</span><strong>${total.toLocaleString()}</strong><small>${actions.toLocaleString()} progression actions</small></div><div class="social-core__progress-grid"><span>Posts ${metric('social_post')}</span><span>Comments ${metric('social_comment')}</span><span>Connections ${metric('social_follow')}</span></div></section>`;
  }
  function metric(name) { const row = state.summary.find(item => item.metric === name); return Number(row?.quantity || 0); }

  async function panelContent(view) {
    if (view === 'feed') return `<div class="social-core__feed" data-region="feed"></div>`;
    if (view === 'compete') {
      const data = await getCompetitions();
      return `<section class="social-core__grid"><div class="social-core__section"><h2>Games</h2>${data.games.map(x => card(x.name, x.description, `${x.reward_points || 0} XP`, 'game')).join('') || empty('No games available yet.')}</div><div class="social-core__section"><h2>Challenges</h2>${data.challenges.map(x => card(x.name, x.description, `${x.reward_points || 0} XP`, 'challenge')).join('') || empty('No active challenges yet.')}</div><div class="social-core__section"><h2>Contests</h2>${data.contests.map(x => card(x.name, x.description, 'Enter to compete', 'contest')).join('') || empty('No contests available yet.')}</div></section>`;
    }
    if (view === 'network') { const activity = await getActivity(); return `<section class="social-core__panel"><div class="social-core__panel-icon">N</div><div><h2>Network</h2><p>Build connections through helpful activity, discoveries and shared wins.</p><div class="social-core__activity-list">${activity.map(x => `<div><strong>${escapeHtml(x.activity_type || 'Community activity')}</strong><span>${formatDate(x.created_at)}</span></div>`).join('') || empty('Your network activity will appear here.')}</div></div></section>`; }
    if (view === 'messages') { const rows = await getMessages(); return `<section class="social-core__panel"><div class="social-core__panel-icon">M</div><div><h2>Messages</h2><p>Keep community conversations in one place.</p>${rows.map(x => `<div class="social-core__message"><strong>${escapeHtml(x.content || x.body || 'Message')}</strong><span>${formatDate(x.created_at)}</span></div>`).join('') || empty('No messages yet.')}</div></section>`; }
    if (view === 'notifications') { const rows = await getNotifications(); return `<section class="social-core__panel"><div class="social-core__panel-icon">!</div><div><h2>Notifications</h2><p>Stay current on follows, comments, contests and progression.</p>${rows.map(x => `<div class="social-core__message"><strong>${escapeHtml(x.title || x.message || 'Community update')}</strong><span>${formatDate(x.created_at)}</span></div>`).join('') || empty('You are all caught up.')}</div></section>`; }
    return `<section class="social-core__panel"><div class="social-core__panel-icon">D</div><div><h2>Discover</h2><p>Explore community knowledge, location discoveries and helpful tips.</p><button type="button" class="social-core__panel-action" data-return-feed>Return to Feed</button></div></section>`;
  }
  function card(title, description, badge, type) { return `<article class="social-core__feature-card" data-feature-type="${type}"><span>${escapeHtml(badge)}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description || 'A Kleenest community experience.')}</p><button type="button" data-feature-action="${type}">Open ${escapeHtml(type)}</button></article>`; }
  function empty(text) { return `<div class="social-core__empty-inline">${escapeHtml(text)}</div>`; }

  async function render() {
    if (state.destroyed) return;
    await Promise.all([loadSummary(), state.view === 'feed' ? getPosts() : Promise.resolve()]);
    const content = await panelContent(state.view);
    root.replaceChildren();
    const shell = document.createElement('section'); shell.className = 'social-core';
    shell.innerHTML = `<header class="social-core__header"><div class="social-core__eyebrow">KLEENEST COMMUNITY</div><div class="social-core__header-row"><div><h1>Social</h1><p>${VIEWS[state.view][1]}</p></div><button type="button" class="social-core__share" data-action="compose"><span>+</span> Share</button></div></header>${metricCard()}<nav class="social-core__nav" aria-label="Social sections">${Object.entries(VIEWS).map(([key,meta]) => `<button type="button" class="${state.view===key?'active':''}" data-view="${key}">${meta[0]}</button>`).join('')}</nav><div class="social-core__body">${content}</div>`;
    root.append(shell);
    shell.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', async () => { state.view = button.dataset.view; await render(); }));
    shell.querySelector('[data-action="compose"]')?.addEventListener('click', openComposer);
    shell.querySelector('[data-return-feed]')?.addEventListener('click', async () => { state.view = 'feed'; await render(); });
    shell.querySelectorAll('[data-feature-action]').forEach(button => button.addEventListener('click', async () => { if (button.dataset.featureAction === 'game') await progression.record('game_play', { metadata: { source: 'social_compete' } }); if (button.dataset.featureAction === 'challenge') await progression.record('challenge_progress', { metadata: { source: 'social_compete' } }); await render(); }));
    const feed = shell.querySelector('[data-region="feed"]');
    if (feed) renderFeed(feed);
  }

  function renderFeed(feed) {
    if (!state.posts.length) { feed.innerHTML = `<div class="social-core__empty"><div class="social-core__empty-icon">+</div><h2>Your community starts here</h2><p>Share a discovery, helpful tip, verification, route or win. Every useful contribution can feed your progression.</p><button type="button" data-empty-share>Share your first post</button></div>`; feed.querySelector('[data-empty-share]').addEventListener('click', openComposer); return; }
    feed.innerHTML = state.posts.map(post => `<article class="social-core__post" data-post-id="${escapeAttr(post.id)}"><div class="social-core__post-meta"><strong>${escapeHtml(post.kind || 'Community post')}</strong><span>${formatDate(post.created_at)}</span></div><p>${escapeHtml(post.content || '')}</p>${post.media_url ? `<img src="${escapeAttr(post.media_url)}" alt="Community media" loading="lazy">` : ''}<div class="social-core__post-actions"><button type="button" data-like="${post.id}">Like</button><button type="button" data-save="${post.id}">Save</button><button type="button" data-comment="${post.id}">Comment</button></div></article>`).join('');
    feed.querySelectorAll('[data-like]').forEach(b => b.addEventListener('click', async () => { await toggleLike(b.dataset.like); b.classList.toggle('active'); }));
    feed.querySelectorAll('[data-save]').forEach(b => b.addEventListener('click', async () => { await toggleSave(b.dataset.save); b.classList.toggle('active'); }));
    feed.querySelectorAll('[data-comment]').forEach(b => b.addEventListener('click', async () => { const text = window.prompt('Add a helpful comment'); if (text) { await addComment(b.dataset.comment, text); await render(); } }));
  }

  function openComposer() {
    requireUser();
    if (state.composer) state.composer.remove();
    const modal = document.createElement('dialog'); state.composer = modal; modal.className = 'social-core__dialog';
    modal.innerHTML = `<form class="social-core__composer"><div class="social-core__composer-head"><div><div class="social-core__eyebrow">COMMUNITY POST</div><h2>Share with the community</h2></div><button type="button" class="social-core__close" data-cancel aria-label="Close">×</button></div><select name="kind"><option value="discovery">Discovery</option><option value="tip">Tip</option><option value="verification">Verification</option><option value="review">Review</option><option value="route">Route</option><option value="win">Community win</option></select><textarea name="content" maxlength="2000" required placeholder="Share something useful with Kleenest…"></textarea><label class="social-core__file"><span>Add a photo</span><input name="media" type="file" accept="image/jpeg,image/png,image/webp"></label><div class="social-core__composer-actions"><button type="button" data-cancel>Cancel</button><button type="submit" value="publish">Publish</button></div></form>`;
    document.body.append(modal); modal.showModal();
    const close = () => { try { modal.close(); } catch (_) {} state.composer = null; modal.remove(); };
    modal.querySelectorAll('[data-cancel]').forEach(b => b.addEventListener('click', close));
    modal.addEventListener('cancel', e => { e.preventDefault(); close(); });
    modal.querySelector('form').addEventListener('submit', async e => { e.preventDefault(); const form=e.currentTarget, submit=form.querySelector('[value="publish"]'); submit.disabled=true; submit.textContent='Publishing…'; try { await createPost({ content: form.content.value, kind: form.kind.value, file: form.media.files[0] || null }); close(); await render(); } catch(error) { submit.disabled=false; submit.textContent='Publish'; alert(error.message); } });
  }

  function subscribe() { if (!state.user) return; const channel=supabase.channel(`social-core-v2-${state.user.id}`).on('postgres_changes',{event:'*',schema:'public',table:'social_posts'},()=>{if(!state.destroyed&&state.view==='feed')render()}).subscribe(); state.channels.push(channel); }
  function destroy() { state.destroyed=true; if(state.composer){try{state.composer.close()}catch(_){} state.composer.remove(); state.composer=null;} state.channels.forEach(c=>{try{supabase.removeChannel(c)}catch(_){}}); state.channels.length=0; root.replaceChildren(); }
  function formatDate(value){if(!value)return '';const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleDateString(undefined,{month:'short',day:'numeric'});}
  function escapeHtml(value){return String(value??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));}
  const escapeAttr=escapeHtml;
  subscribe();
  return Object.freeze({ render, destroy, getPosts, createPost, deletePost, toggleLike, toggleSave, addComment, getComments, getCompetitions, getActivity, requireUser, get state(){return {...state}} });
}
