/* Kleenest rewards synchronization layer. */
(function () {
  'use strict';
  window.KleenestRewards = window.KleenestRewards || {};

  window.KleenestRewards.syncCheckin = async function (checkinId) {
    if (!checkinId) throw new Error('A check-in ID is required.');
    if (!window.KleenestSupabase?.client) throw new Error('Supabase is not ready.');
    const session = await window.KleenestSupabase.session();
    if (!session) throw new Error('Please sign in to continue.');

    const { data, error } = await window.KleenestSupabase.client().rpc('checkin_rewards_summary', {
      p_checkin_id: checkinId
    });
    if (error) throw error;

    const result = data || {};
    const profile = result.profile || {};
    const user = {
      id: session.user.id,
      points: Number(profile.points || 0),
      level: Number(profile.level || 1),
      streak: Number(profile.streak || 0),
      totalCheckIns: Number(profile.total_check_ins || 0),
      totalReviews: Number(profile.total_reviews || 0),
      source: 'supabase'
    };

    if (window.KleenestRuntime) {
      window.KleenestRuntime.user = Object.assign({}, window.KleenestRuntime.user || {}, user);
    }
    if (typeof state !== 'undefined' && state.session) {
      state.session = Object.assign({}, state.session, user);
    }

    window.dispatchEvent(new CustomEvent('kleenest:rewards-updated', {
      detail: { checkIn: result.check_in || null, profile: user, transactions: result.point_transactions || [], newBadges: result.new_badges || [] }
    }));
    if (typeof render === 'function') render();
    return result;
  };
})();
