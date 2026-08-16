import { ensureSocialStyles } from './social-theme.js';

/** Canonical Social Core. UI and behavior are owned here; Storage is owned by Media Core. */
export function createSocialCore({ supabase, mediaCore, root, user = null } = {}) {
  if (!supabase) throw new Error('Social Core requires Supabase.');
  if (!root) throw new Error('Social Core requires a mount root.');
  ensureSocialStyles();
  const state = { user, view: 'feed', channels: [], destroyed: false, composer: null };
  const requireUser = () => { if (!state.user) throw new Error('Sign in required.'); return state.user; };
  const query = table => supabase.from(table);
  const views = {
    feed: ['Feed', 'Community posts, discoveries, tips and wins.'],
    network: ['Network', 'People and activity from your Kleenest community.'],
    discover: ['Discover', 'Find useful places, discoveries and community knowledge.'],
    compete: ['Compete', 'Challenges, contests, leaderboards and community progress.'],
    messages: ['Messages', 'Your community conversations.'],
    notifications: ['Notifications', 'Updates about your community activity.']
  };

  async function getPosts({ limit = 50 } = {}) {
    const { data, error } = await query('social_posts').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
  }

  async function rows(table, build) {
    try {
      let q = query(table).select('*');
      if (build) q = build(q) || q;
      const { data, error } = await q.limit(40);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn(`[Kleenest] Social ${table} details unavailable`, error);
      return [];
    }
  }

  async function createPost({ content, kind = 'discovery', file = null, mediaMetadata = {} } = {}) {
    const current = requireUser();
    if (!content?.trim()) throw new Error('Post content is required.');
    let media = null;
    if (file) {
      if (!mediaCore) throw new Error('Media Core is unavailable.');
      media = await mediaCore.upload(file, { userId: current.id, namespace: 'social', pathPrefix: 'posts', metadata: mediaMetadata });
    }
    const payload = { user_id: current.id, content: content.trim(), kind,
      ...(media ? { media_url: media.url, media_type: media.media_type, media_storage_path: media.storage_path, media_size_bytes: media.media_size_bytes } : {}) };
    try {
      const { data, error } = await query('social_posts').insert(payload).select().single();
      if (error) throw error;
      return data;
    } catch (error) {
      if (media?.storage_path) { try { await mediaCore.remove(media.storage_path, { userId: current.id, namespace: 'social' }); } catch (_) {} }
      throw error;
    }
  }

  async function deletePost(post) {
    const current = requireUser();
    if (!post?.id) throw new Error('Post is required.');
    const { error } = await query('social_posts').delete().eq('id', post.id).eq('user_id', current.id);
    if (error) throw error;
    if (post.media_storage_path && mediaCore) await mediaCore.remove(post.media_storage_path, { userId: current.id, namespace: 'social' });
  }

  async function getPanelData(view) {
    if (view === 'network') {
      const following = state.user ? await rows('follows', q => q.eq('follower_id', state.user.id).order('created_at', { ascending: false })) : [];
      const activity = await rows('social_activity', q => q.order('created_at', { ascending: false }));
      return { following, activity };
    }
    if (view === 'discover') {
      const locations = await rows('locations', q => q.eq('is_active', true).order('updated_at', { ascending: false }));
      const events = await rows('business_events', q => q.eq('status', 'active').order('event_date', { ascending: true }));
      const promotions = await rows('promotions', q => q.eq('active', true).order('created_at', { ascending: false }));
      return { locations, events, promotions };
    }
    if (view === 'compete') {
      const contests = await rows('contests', q => q.in('status', ['scheduled', 'active']).order('starts_at', { ascending: true }));
      const challenges = await rows('progression_challenges', q => q.eq('enabled', true).order('created_at', { ascending: false }));
      const games = await rows('progression_games', q => q.eq('enabled', true).order('created_at', { ascending: false }));
      return { contests, challenges, games };
    }
    if (view === 'messages') {
      if (!state.user) return { messages: [] };
      const messages = await rows('messages', q => q.or(`from_id.eq.${state.user.id},to_id.eq.${state.user.id}`).order('created_at', { ascending: false }));
      return { messages };
    }
    if (view === 'notifications') {
      if (!state.user) return { notifications: [] };
      const notifications = await rows('notifications', q => q.eq('user_id', state.user.id).order('created_at', { ascending: false }));
      return { notifications };
    }
    return {};
  }

  function esc(value) { return String(value ?? '').replace(/[&<>\"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;' }[char])); }
  const card = (title, text, meta = '') => `<article class="social-core__detail-card"><div class="social-core__detail-title">${esc(title)}</div>${meta ? `<div class="social-core__detail-meta">${esc(meta)}</div>` : ''}<p>${esc(text)}</p></article>`;

  async function panel(view) {
    if (view === 'feed') return '<div class="social-core__feed" data-region="feed"></div>';
    const data = await getPanelData(view);
    if (view === 'network') {
      const following = data.following.map(x => card('Following', `Member ${x.following_id}`, new Date(x.created_at).toLocaleDateString())).join('');
      const activity = data.activity.map(x => card(x.activity_type || 'Community activity', x.metadata?.message || 'Community activity recorded.', new Date(x.created_at).toLocaleDateString())).join('');
      return `<section class="social-core__detail-grid"><div class="social-core__detail-section"><div class="social-core__section-head"><div><span>NETWORK</span><h2>Your community network</h2></div><strong>${data.following.length}</strong></div>${following || '<div class="social-core__empty-inline">You are not following anyone yet.</div>'}</div><div class="social-core__detail-section"><div class="social-core__section-head"><div><span>ACTIVITY</span><h2>Recent community activity</h2></div></div>${activity || '<div class="social-core__empty-inline">No recent community activity.</div>'}</div></section>`;
    }
    if (view === 'discover') {
      return `<section class="social-core__detail-grid"><div class="social-core__detail-section"><div class="social-core__section-head"><div><span>PLACES</span><h2>Recent discoveries</h2></div><strong>${data.locations.length}</strong></div>${data.locations.map(x => card(x.name || 'Location', x.address || x.city || 'Nearby place', x.place_type || 'Place')).join('') || '<div class="social-core__empty-inline">No discoverable places are available yet.</div>'}</div><div class="social-core__detail-section"><div class="social-core__section-head"><div><span>EVENTS & OFFERS</span><h2>Community opportunities</h2></div></div>${data.events.map(x => card(x.title || 'Event', x.description || 'Community event', x.event_date || '')).join('')}${data.promotions.map(x => card(x.title || 'Promotion', x.description || x.discount || 'Business offer', x.ends_at ? `Ends ${new Date(x.ends_at).toLocaleDateString()}` : '')).join('') || '<div class="social-core__empty-inline">No active events or promotions yet.</div>'}</div></section>`;
    }
    if (view === 'compete') {
      return `<section class="social-core__detail-grid"><div class="social-core__detail-section"><div class="social-core__section-head"><div><span>CONTESTS</span><h2>Live competition</h2></div></div>${data.contests.map(x => card(x.name, x.description || 'Community contest', `${x.status} · ${new Date(x.ends_at).toLocaleDateString()}`)).join('') || '<div class="social-core__empty-inline">No active contests yet.</div>'}</div><div class="social-core__detail-section"><div class="social-core__section-head"><div><span>PROGRESSION</span><h2>Challenges & games</h2></div></div>${data.challenges.map(x => card(x.name, x.description, `${x.period} · ${x.reward_points || 0} XP`)).join('')}${data.games.map(x => card(x.name, x.description, `${x.difficulty} · ${x.reward_points || 0} XP`)).join('') || '<div class="social-core__empty-inline">No enabled challenges or games yet.</div>'}</div></section>`;
    }
    if (view === 'messages') {
      return `<section class="social-core__detail-section"><div class="social-core__section-head"><div><span>INBOX</span><h2>Your conversations</h2></div><strong>${data.messages.length}</strong></div>${data.messages.map(x => card(x.from_id === state.user?.id ? 'You' : 'Community member', x.content, `${x.status} · ${new Date(x.created_at).toLocaleDateString()}`)).join('') || '<div class="social-core__empty-inline">No messages yet. Start a conversation when you connect with another member.</div>'}</section>`;
    }
    return `<section class="social-core__detail-section"><div class="social-core__section-head"><div><span>UPDATES</span><h2>Your notifications</h2></div><strong>${data.notifications.length}</strong></div>${data.notifications.map(x => card(x.title || x.type || 'Notification', x.body || 'Community update', new Date(x.created_at).toLocaleDateString())).join('') || '<div class="social-core__empty-inline">You're all caught up.</div>'}</section>`;
  }

  function subscribe() {
    if (!state.user || state.destroyed) return;
    const channel = supabase.channel(`social-core-${state.user.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'social_posts' }, () => { if (!state.destroyed && state.view === 'feed') render(); }).subscribe();
    state.channels.push(channel);
  }

  async function render() {
    if (state.destroyed) return;
    const posts = state.view === 'feed' ? await getPosts() : [];
    root.replaceChildren();
    const shell = document.createElement('section'); shell.className = 'social-core';
    shell.innerHTML = `
      <header class="social-core__header">
        <div class="social-core__eyebrow">KLEENEST COMMUNITY</div>
        <div class="social-core__header-row"><div><h1>Social</h1><p>${esc(views[state.view][1])}</p></div><button type="button" class="social-core__share" data-action="compose"><span>+</span> Share</button></div>
      </header>
      <nav class="social-core__nav" aria-label="Social sections">
        ${Object.entries(views).map(([view, meta]) => `<button type="button" class="${state.view === view ? 'active' : ''}" data-view="${view}" aria-current="${state.view === view ? 'page' : 'false'}">${meta[0]}</button>`).join('')}
      </nav>
      <div data-region="panel"></div>`;
    root.append(shell);
    shell.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { state.view = button.dataset.view; render(); }));
    shell.querySelector('[data-action="compose"]').addEventListener('click', openComposer);
    const panelRoot = shell.querySelector('[data-region="panel"]');
    panelRoot.innerHTML = await panel(state.view);
    if (state.view === 'feed') {
      const feed = panelRoot.querySelector('[data-region="feed"]');
      if (!posts.length) feed.innerHTML = '<div class="social-core__empty"><div class="social-core__empty-icon">+</div><h2>Your community starts here</h2><p>Share a discovery, helpful tip, verification, route or win with other Kleenest members.</p><button type="button" data-empty-share>Share your first post</button></div>';
      else feed.innerHTML = posts.map(post => `<article class="social-core__post" data-post-id="${esc(post.id)}"><div class="social-core__post-meta"><strong>${esc(post.kind || 'Community post')}</strong><span>${formatDate(post.created_at)}</span></div><p>${esc(post.content || '')}</p>${post.media_url ? `<img src="${esc(post.media_url)}" alt="Community media" loading="lazy">` : ''}</article>`).join('');
      shell.querySelector('[data-empty-share]')?.addEventListener('click', openComposer);
    }
  }

  function openComposer() {
    requireUser();
    if (state.composer) state.composer.remove();
    const modal = document.createElement('dialog'); state.composer = modal; modal.className = 'social-core__dialog';
    modal.innerHTML = `<form class="social-core__composer"><div class="social-core__composer-head"><div><div class="social-core__eyebrow">COMMUNITY POST</div><h2>Share with the community</h2></div><button type="button" class="social-core__close" data-cancel aria-label="Close">×</button></div><select name="kind" aria-label="Post type"><option value="discovery">Discovery</option><option value="tip">Tip</option><option value="verification">Verification</option><option value="review">Review</option><option value="route">Route</option><option value="win">Community win</option></select><textarea name="content" maxlength="2000" required placeholder="Share something useful with Kleenest…"></textarea><label class="social-core__file"><span>Add a photo</span><input name="media" type="file" accept="image/jpeg,image/png,image/webp"></label><div class="social-core__composer-actions"><button type="button" data-cancel>Cancel</button><button type="submit" value="publish">Publish</button></div></form>`;
    document.body.append(modal); modal.showModal();
    const close = () => { try { modal.close(); } catch (_) {} state.composer = null; modal.remove(); };
    modal.querySelectorAll('[data-cancel]').forEach(button => button.addEventListener('click', close));
    modal.addEventListener('cancel', event => { event.preventDefault(); close(); });
    modal.querySelector('form').addEventListener('submit', async event => {
      event.preventDefault(); const form = event.currentTarget; const submit = form.querySelector('[value="publish"]'); submit.disabled = true; submit.textContent = 'Publishing…';
      try { await createPost({ content: form.content.value, kind: form.kind.value, file: form.media.files[0] || null }); close(); await render(); }
      catch (error) { submit.disabled = false; submit.textContent = 'Publish'; const message = document.createElement('div'); message.className = 'social-core__form-error'; message.textContent = error.message || 'Post could not be published.'; form.prepend(message); }
    });
  }

  function formatDate(value) { if (!value) return ''; const d = new Date(value); return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
  function destroy() { state.destroyed = true; if (state.composer) { try { state.composer.close(); } catch (_) {} state.composer.remove(); state.composer = null; } state.channels.forEach(channel => { try { supabase.removeChannel(channel); } catch (_) {} }); state.channels.length = 0; root.replaceChildren(); }
  subscribe();
  return Object.freeze({ render, destroy, getPosts, createPost, deletePost, requireUser, get state() { return { ...state }; } });
}
