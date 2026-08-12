/* Kleenest account data layer. */
(function () {
  'use strict';
  window.KleenestAccount = window.KleenestAccount || {};
  function client() { if (!window.KleenestSupabase?.client) throw new Error('Supabase is not ready.'); return window.KleenestSupabase.client(); }
  async function auth() { const s=await window.KleenestSupabase.session(); if(!s) throw new Error('Please sign in to continue.'); return s; }

  window.KleenestAccount.notifications = async function (limit=50) {
    await auth(); const {data,error}=await client().rpc('user_notifications',{p_limit:limit}); if(error) throw error; return data||[];
  };
  window.KleenestAccount.markNotificationRead = async function (notificationId) { await auth(); return window.KleenestRuntime.markNotificationRead(notificationId); };
  window.KleenestAccount.subscription = async function () { await auth(); const {data,error}=await client().rpc('user_subscription_summary'); if(error) throw error; return data||{}; };
  window.KleenestAccount.loadState = async function () {
    const s=await auth();
    const [notifications,subscription]=await Promise.all([window.KleenestAccount.notifications(50),window.KleenestAccount.subscription()]);
    const result={notifications,subscription,userId:s.user.id,loadedAt:new Date().toISOString()};
    window.dispatchEvent(new CustomEvent('kleenest:account-state-loaded',{detail:result}));
    return result;
  };
})();