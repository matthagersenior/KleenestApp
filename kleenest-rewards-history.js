/* Kleenest rewards history and badge data layer. */
(function () {
  'use strict';
  window.KleenestRewardsHistory = window.KleenestRewardsHistory || {};
  function client() { if (!window.KleenestSupabase?.client) throw new Error('Supabase is not ready.'); return window.KleenestSupabase.client(); }
  async function auth() { const s=await window.KleenestSupabase.session(); if(!s) throw new Error('Please sign in to continue.'); return s; }
  window.KleenestRewardsHistory.load = async function (limit=50) {
    await auth();
    const {data,error}=await client().rpc('user_rewards_history',{p_limit:limit});
    if(error) throw error;
    const result=data||{};
    window.dispatchEvent(new CustomEvent('kleenest:rewards-history-loaded',{detail:result}));
    return result;
  };
})();
