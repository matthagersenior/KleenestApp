/**
 * Kleenest Social Core
 * Canonical coordinator for the Social module.
 * Feature modules should depend on this coordinator rather than the shell.
 */
export function createSocialCore({ supabase, mediaCore, root, user = null } = {}) {
  if (!supabase) throw new Error('Social Core requires Supabase.');
  if (!root) throw new Error('Social Core requires a mount root.');

  const state = { user, view: 'feed', channels: [], destroyed: false };

  const requireUser = () => {
    if (!state.user) throw new Error('Sign in required.');
    return state.user;
  };

  const query = (table) => supabase.from(table);

  async function getPosts({ limit = 50 } = {}) {
    const { data, error } = await query('social_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  async function createPost({ content, kind = 'discovery', file = null, mediaMetadata = {} } = {}) {
    const current = requireUser();
    if (!content?.trim()) throw new Error('Post content is required.');

    let media = null;
    if (file) {
      if (!mediaCore) throw new Error('Media Core is unavailable.');
      media = await mediaCore.upload(file, {
        userId: current.id,
        namespace: 'social',
        pathPrefix: 'posts',
        metadata: mediaMetadata
      });
    }

    const payload = {
      user_id: current.id,
      content: content.trim(),
      kind,
      ...(media ? {
        media_url: media.url,
        media_type: media.media_type,
        media_storage_path: media.storage_path,
        media_size_bytes: media.media_size_bytes
      } : {})
    };

    try {
      const { data, error } = await query('social_posts').insert(payload).select().single();
      if (error) throw error;
      return data;
    } catch (error) {
      if (media?.storage_path) {
        try { await mediaCore.remove(media.storage_path, { userId: current.id, namespace: 'social' }); } catch (_) {}
      }
      throw error;
    }
  }

  async function deletePost(post) {
    const current = requireUser();
    if (!post?.id) throw new Error('Post is required.');
    const { error } = await query('social_posts').delete().eq('id', post.id).eq('user_id', current.id);
    if (error) throw error;
    if (post.media_storage_path && mediaCore) {
      await mediaCore.remove(post.media_storage_path, { userId: current.id, namespace: 'social' });
    }
  }

  function subscribe() {
    if (!state.user || state.destroyed) return;
    const channel = supabase.channel(`social-core-${state.user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'social_posts' }, () => render())
      .subscribe();
    state.channels.push(channel);
  }

  async function render() {
    if (state.destroyed) return;
    const posts = await getPosts();
    root.innerHTML = '';
    const shell = document.createElement('section');
    shell.className = 'social-core';
    shell.innerHTML = `
      <header class="social-core__header">
        <div><h1>Social</h1><p>Community discoveries, tips and wins.</p></div>
        <button type="button" data-action="compose">Share</button>
      </header>
      <nav class="social-core__nav" aria-label="Social">
        <button type="button" data-view="feed">Feed</button>
        <button type="button" data-view="network">Network</button>
        <button type="button" data-view="discover">Discover</button>
        <button type="button" data-view="compete">Compete</button>
        <button type="button" data-view="messages">Messages</button>
        <button type="button" data-view="notifications">Notifications</button>
      </nav>
      <main class="social-core__feed"></main>`;
    root.append(shell);
    shell.querySelectorAll('[data-view]').forEach(button => {
      button.addEventListener('click', () => { state.view = button.dataset.view; render(); });
    });
    shell.querySelector('[data-action="compose"]').addEventListener('click', () => openComposer());

    const feed = shell.querySelector('.social-core__feed');
    if (!posts.length) {
      feed.innerHTML = '<p>No community posts yet.</p>';
      return;
    }
    feed.innerHTML = posts.map(post => `
      <article class="social-core__post" data-post-id="${escapeHtml(post.id)}">
        <div><strong>${escapeHtml(post.kind || 'Community post')}</strong></div>
        <p>${escapeHtml(post.content || '')}</p>
        ${post.media_url ? `<img src="${escapeAttribute(post.media_url)}" alt="Community media" loading="lazy">` : ''}
      </article>`).join('');
  }

  function openComposer() {
    const modal = document.createElement('dialog');
    modal.innerHTML = `
      <form method="dialog" class="social-core__composer">
        <h2>Share with the community</h2>
        <select name="kind"><option value="discovery">Discovery</option><option value="tip">Tip</option><option value="verification">Verification</option><option value="review">Review</option><option value="route">Route</option><option value="win">Community win</option></select>
        <textarea name="content" maxlength="2000" required placeholder="Share something useful with Kleenest…"></textarea>
        <input name="media" type="file" accept="image/jpeg,image/png,image/webp">
        <button value="cancel">Cancel</button><button value="publish">Publish</button>
      </form>`;
    document.body.append(modal);
    modal.showModal();
    modal.querySelector('form').addEventListener('submit', async event => {
      if (event.submitter?.value !== 'publish') return;
      event.preventDefault();
      const form = event.currentTarget;
      const submit = form.querySelector('[value="publish"]');
      submit.disabled = true;
      try {
        await createPost({ content: form.content.value, kind: form.kind.value, file: form.media.files[0] || null });
        modal.close();
        await render();
      } catch (error) {
        submit.disabled = false;
        alert(error.message);
      }
    });
    modal.addEventListener('close', () => modal.remove(), { once: true });
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>\"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[char]));
  }
  const escapeAttribute = escapeHtml;

  function destroy() {
    state.destroyed = true;
    state.channels.forEach(channel => { try { supabase.removeChannel(channel); } catch (_) {} });
    state.channels.length = 0;
    root.replaceChildren();
  }

  return Object.freeze({ render, destroy, getPosts, createPost, deletePost, requireUser, get state() { return { ...state }; } });
}
