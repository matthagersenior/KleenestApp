export function createProgressionChallengesCore({ supabase, user = null, root } = {}) {
  if (!supabase) throw new Error('Progression Challenges Core requires Supabase.');
  if (!root) throw new Error('Progression Challenges Core requires a mount root.');

  const currentUser = user || null;
  const esc = value => String(value ?? '').replace(/[&<>\"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' }[c]));
  const date = value => { const d = new Date(value); return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month:'short', day:'numeric' }); };

  async function load() {
    const { data: challenges, error: challengeError } = await supabase.from('progression_challenges').select('*').eq('enabled', true).order('created_at', { ascending: false });
    if (challengeError) throw challengeError;
    if (!currentUser?.id) return { challenges: challenges || [], entries: [] };
    const { data: entries, error: entryError } = await supabase.from('social_challenge_entries').select('*').eq('user_id', currentUser.id);
    if (entryError) throw entryError;
    return { challenges: challenges || [], entries: entries || [] };
  }

  async function join(challengeId) {
    if (!currentUser?.id) throw new Error('Sign in to join challenges.');
    const { data, error } = await supabase.from('social_challenge_entries').upsert({ challenge_id: challengeId, user_id: currentUser.id, progress: 0 }, { onConflict: 'challenge_id,user_id' }).select().single();
    if (error) throw error;
    return data;
  }

  async function complete(challengeId) {
    if (!currentUser?.id) throw new Error('Sign in to complete challenges.');
    const { data, error } = await supabase.rpc('complete_progression_challenge', { p_challenge_id: challengeId });
    if (error) throw error;
    return data;
  }

  async function render() {
    const existing = root.querySelector('[data-progression-challenges]');
    if (existing) existing.remove();
    const { challenges, entries } = await load();
    if (!challenges.length) return;
    const byChallenge = new Map(entries.map(entry => [entry.challenge_id, entry]));
    const section = document.createElement('section');
    section.className = 'progression-challenges-core';
    section.dataset.progressionChallenges = 'true';
    section.innerHTML = `<div class="progression-challenges-core__head"><div><span>PROGRESSION</span><h2>Challenges</h2><p>Complete community goals to earn configured rewards and badges.</p></div><strong>${challenges.length}</strong></div><div class="progression-challenges-core__grid">${challenges.map(challenge => {
      const entry = byChallenge.get(challenge.id);
      const target = Math.max(Number(challenge.target) || 1, 1);
      const progress = Math.max(Number(entry?.progress) || 0, 0);
      const pct = Math.min(100, Math.round(progress / target * 100));
      const complete = !!entry?.completed_at;
      const joined = !!entry;
      return `<article class="progression-challenges-core__card"><div class="progression-challenges-core__meta"><span>${esc(challenge.period || 'challenge')}</span><span>${Number(challenge.reward_points || 0)} XP</span></div><h3>${esc(challenge.name || challenge.code)}</h3><p>${esc(challenge.description || 'Community progression challenge.')}</p><div class="progression-challenges-core__bar"><span style="width:${pct}%"></span></div><div class="progression-challenges-core__progress"><span>${progress.toLocaleString()} / ${target.toLocaleString()}</span><span>${complete ? 'Completed' : joined ? `${pct}%` : 'Not joined'}</span></div><button type="button" data-challenge-action="${esc(challenge.id)}" ${complete ? 'disabled' : ''}>${complete ? 'Completed' : joined ? (progress >= target ? 'Claim reward' : 'In progress') : 'Join challenge'}</button></article>`;
    }).join('')}</div>`;
    const body = root.querySelector('.social-core__body');
    (body || root).append(section);
    section.querySelectorAll('[data-challenge-action]').forEach(button => button.addEventListener('click', async () => {
      const challengeId = button.dataset.challengeAction;
      button.disabled = true;
      try {
        const entry = byChallenge.get(challengeId);
        if (!entry) await join(challengeId);
        else if (Number(entry.progress || 0) >= Number(challenges.find(c => c.id === challengeId)?.target || 1)) await complete(challengeId);
        await render();
      } catch (error) {
        button.disabled = false;
        alert(error.message || 'Challenge action could not be completed.');
      }
    }));
  }

  return Object.freeze({ load, join, complete, render });
}
