/* Kleenest Supabase runtime bootstrap.
 * This file intentionally does not replace the existing localStorage data layer yet.
 * It establishes a safe bridge so the UI can be migrated feature-by-feature without
 * changing the existing application behavior in one large risky rewrite.
 */
(function () {
  'use strict';

  function ready() {
    return !!(window.KleenestSupabase && window.KleenestSupabase.client);
  }

  window.KleenestRuntime = window.KleenestRuntime || {};
  window.KleenestRuntime.supabaseReady = ready;
  window.KleenestRuntime.getSession = async function () {
    if (!ready()) return null;
    return window.KleenestSupabase.session();
  };

  // Make the integration observable without changing the existing UI state.
  window.dispatchEvent(new CustomEvent('kleenest:supabase-ready', {
    detail: { ready: ready() }
  }));
})();
