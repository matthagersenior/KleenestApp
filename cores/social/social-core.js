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

  function subscribe() {
    if (!state.user || state.destroyed) return;
    const channel = supabase.channel(`social-core-${state.user.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'social_posts' }, () => { if (!state.destroyed && state.view === 'feed') render(); }).subscribe();
    state.channels.push(channel);
  }

  function panel(view) {
    const [title, description] = views[view];
    if (view === 'feed') return '<div class="social-core__feed" data-region="feed"></div>';
    const action = view === 'network' ? 'Find people' : view === 'discover' ? 'Explore discoveries' : view === 'compete' ? 'View challenges' : view === 'messages' ? 'Start a conversation' : 'Review activity';
    return `<section class="social-core__panel"><div class="social-core__panel-icon">${title.slice(0,1)}</div><div><h2>${title}</h2><p>${description}</p><button type="button" class="social-core__panel-action" data-panel-action="${view}">${action}</button></div></section>`;
  }

  async function render() {
    if (state.destroyed) return;
    const posts = state.view === 'feed' ? await getPosts() : [];
    root.replaceChildren();
    const shell = document.createElement('section'); shell.className = 'social-core';
    shell.innerHTML = `
      <header class="social-core__header">
        <div class="social-core__eyebrow">KLEENEST COMMUNITY</div>
        <div class="social-core__header-row"><div><h1>Social</h1><p>${views[state.view][1]}</p></div><button type="button" class="social-core__share" data-action="compose"><span>+</span> Share</button></div>
      </header>
      <nav class="social-core__nav" aria-label="Social sections">
        ${Object.entries(views).map(([view, meta]) => `<button type="button" class="${state.view === view ? 'active' : ''}" data-view="${view}" aria-current="${state.view === view ? 'page' : 'false'}">${meta[0]}</button>`).join('')}
      </nav>
      ${panel(state.view)}`;
    root.append(shell);
    shell.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { state.view = button.dataset.view; render(); }));
    shell.querySelector('[data-action="compose"]').addEventListener('click', openComposer);
    const feed = shell.querySelector('[data-region="feed"]');
    if (feed) {
      if (!posts.length) feed.innerHTML = '<div class="social-core__empty"><div class="social-core__empty-icon">+</div><h2>Your community starts here</h2><p>Share a discovery, helpful tip, verification, route or win with other Kleenest members.</p><button type="button" data-empty-share>Share your first post</button></div>';
      else feed.innerHTML = posts.map(post => `<article class="social-core__post" data-post-id="${escapeAttribute(post.id)}"><div class="social-core__post-meta"><strong>${escapeHtml(post.kind || 'Community post')}</strong><span>${formatDate(post.created_at)}</span></div><p>${escapeHtml(post.content || '')}</p>${post.media_url ? `<img src="${escapeAttribute(post.media_url)}" alt="Community media" loading="lazy">` : ''}</article>`).join('');
      shell.querySelector('[data-empty-share]')?.addEventListener('click', openComposer);
    }
    shell.querySelector('[data-panel-action]')?.addEventListener('click', () => {
      if (state.view === 'network') state.view = 'discover';
      else if (state.view === 'discover') state.view = 'feed';
      else if (state.view === 'compete') state.view = 'notifications';
      else if (state.view === 'messages') { if (!state.user) return openSignInHint(); }
      else state.view = 'feed';
      render();
    });
  }

  function openSignInHint() { alert('Sign in to use community conversations.'); }

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
      catch (error) { submit.disabled = false; submit.textContent = 'Publish'; alert(error.message); }
    });
  }

  function formatDate(value) { if (!value) return ''; const d = new Date(value); return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>\"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;' }[char])); }
  const escapeAttribute = escapeHtml;
  function destroy() { state.destroyed = true; if (state.composer) { try { state.composer.close(); } catch (_) {} state.composer.remove(); state.composer = null; } state.channels.forEach(channel => { try { supabase.removeChannel(channel); } catch (_) {} }); state.channels.length = 0; root.replaceChildren(); }
  subscribe();
  return Object.freeze({ render, destroy, getPosts, createPost, deletePost, requireUser, get state() { return { ...state }; } });
}