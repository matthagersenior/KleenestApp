/* Kleenest Supabase runtime bridge.
 * The legacy UI remains intact. This layer progressively moves live data behind
 * the existing functions instead of replacing the application wholesale.
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

  function mapLocation(row) {
    return {
      id: String(row.id),
      name: row.name || 'Kleenest location',
      businessId: row.business_id || null,
      address: row.address || '',
      city: row.city || '',
      state: row.state || '',
      lat: Number(row.latitude),
      lng: Number(row.longitude),
      distanceMeters: Number(row.distance_meters || 0),
      distanceMiles: Number(row.distance_meters || 0) / 1609.344,
      rating: Number(row.rating || 0),
      reviews: Number(row.review_count || 0),
      cleanlinessPct: Number(row.cleanliness_pct || 0),
      accessible: !!row.accessible,
      changing: !!row.changing_table,
      verified: true,
      source: 'supabase'
    };
  }

  function mergeSupabaseLocations(rows) {
    if (!Array.isArray(rows) || typeof state === 'undefined' || !Array.isArray(state.restrooms)) return;
    const incoming = rows.map(mapLocation).filter(r => Number.isFinite(r.lat) && Number.isFinite(r.lng));
    if (!incoming.length) return;

    const existing = new Map(state.restrooms.map(r => [String(r.id), r]));
    incoming.forEach(r => {
      const prior = existing.get(r.id);
      if (prior) Object.assign(prior, r);
      else existing.set(r.id, r);
    });
    state.restrooms = Array.from(existing.values());
    if (typeof render === 'function') render();
  }

  function installMapBridge() {
    if (!ready()) return false;
    if (typeof loadRestroomsForLocation !== 'function') return false;
    if (loadRestroomsForLocation.__supabaseWrapped) return true;

    const legacyLoad = loadRestroomsForLocation;
    async function wrappedLoad(latitude, longitude, accuracy) {
      const legacyPromise = Promise.resolve().then(() => legacyLoad(latitude, longitude, accuracy));
      const supabasePromise = window.KleenestSupabase.nearbyLocations(latitude, longitude, 15000, 100)
        .catch(err => { console.warn('Supabase nearby locations unavailable; keeping existing map data.', err); return []; });

      const [legacyResult, supabaseRows] = await Promise.all([legacyPromise, supabasePromise]);
      mergeSupabaseLocations(supabaseRows);
      return legacyResult;
    }
    wrappedLoad.__supabaseWrapped = true;
    window.loadRestroomsForLocation = wrappedLoad;
    return true;
  }

  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    if (installMapBridge() || attempts >= 100) clearInterval(timer);
  }, 25);

  window.dispatchEvent(new CustomEvent('kleenest:supabase-ready', {
    detail: { ready: ready() }
  }));
})();
