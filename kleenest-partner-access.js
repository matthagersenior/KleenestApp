/* Kleenest partner/preferred access guard.
 * Preferred locations are earned through an actual business/program connection,
 * not merely by holding Premium/Fleet/Enterprise.
 */
(function () {
  function connectedToProgram(user, restroom) {
    if (!user || !restroom) return false;
    const club = restroom.membershipClub;
    if (club?.active && Array.isArray(club.members) && club.members.includes(user.id)) return true;
    const prog = restroom.partnerProgram;
    if (prog?.enabled && Array.isArray(prog.memberIds) && prog.memberIds.includes(user.id)) return true;
    if (prog?.enabled && Array.isArray(prog.members) && prog.members.includes(user.id)) return true;
    return false;
  }

  window.kleenestPreferredAccess = {
    connectedToProgram,
    eligible(user, restroom) {
      const tier = user && !user.isBusinessUser && ['Premium','Fleet','Enterprise'].includes(user.subscriptionLevel);
      return !!(tier && restroom?.partnerProgram?.enabled && restroom?.partnerProgram?.preferredAccess && connectedToProgram(user, restroom));
    }
  };

  // Do not manufacture partner programs for locations without a real relationship.
  window.ensurePartnerProgram = function (r) {
    if (!r) return;
    if (!r.partnerProgram) {
      r.partnerProgram = {
        enabled: false,
        preferredAccess: false,
        matchDiscountBonus: 0,
        customPerk: '',
        coopAgreements: []
      };
    }
  };

  const previous = window.partnerBenefitsFor;
  if (typeof previous === 'function') {
    window.partnerBenefitsFor = function (user, restroom) {
      if (!window.kleenestPreferredAccess.eligible(user, restroom)) return null;
      return previous(user, restroom);
    };
  }

  window.kleenestRecordPreferredActivation = async function (locationId, programId) {
    try {
      const client = window.kleenestSupabase;
      if (!client || !locationId) return null;
      const { data, error } = await client.rpc('activate_preferred_location', {
        p_location_id: locationId,
        p_partner_program_id: programId || null
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[Kleenest] Preferred activation tracking unavailable:', err?.message || err);
      return null;
    }
  };

  // The refactor retained initMap()/wireGps() but the monolith's Maps view renderer
  // was removed. Keep the page contract explicit and render a real Leaflet map using
  // the existing state and map lifecycle functions. This is intentionally global
  // because render() invokes maps() from the legacy page shell.
  if (typeof window.maps !== 'function') {
    window.maps = function maps() {
      const locations = Array.isArray(window.state?.restrooms) ? window.state.restrooms : [];
      const sorted = locations
        .filter(r => Number.isFinite(Number(r?.lat)) && Number.isFinite(Number(r?.lng)))
        .slice()
        .sort((a, b) => (Number(a?._distance ?? 999999) - Number(b?._distance ?? 999999)))
        .slice(0, 12);
      const loc = window.state?.location;
      const status = loc ? 'Location enabled' : 'Use your location to sort nearby restrooms';
      const rows = sorted.map(r => {
        const rating = Number(r.rating || 0);
        const clean = Number(r.cleanlinessPct || 0);
        const dist = r.distance || (Number.isFinite(Number(r._distance)) ? `${Number(r._distance).toFixed(1)} mi` : '');
        return `<div class="restroom-item" data-restroom="${String(r.id || '').replace(/"/g, '&quot;')}">
          <div><div class="name">${window.esc ? window.esc(r.name || 'Public Restroom') : (r.name || 'Public Restroom')}</div>
          <div class="addr">${window.esc ? window.esc(r.address || 'Address unavailable') : (r.address || 'Address unavailable')}</div>
          <div class="badges"><span class="badge">${clean ? clean + '% clean' : 'New'}</span>${rating ? `<span class="badge verified">${rating.toFixed(1)} ★</span>` : ''}</div></div>
          <div class="rating-tag"><span class="num">${rating ? rating.toFixed(1) : '—'}</span><span class="dist">${dist}</span></div>
        </div>`;
      }).join('');
      return `<div class="stack">
        <div><h2 class="page-title brand-color">🗺️ Find trusted restrooms</h2><p class="profile-sub">${status}</p></div>
        <div class="gps-bar"><button id="use-location" class="btn btn-primary btn-sm">📍 Use my location</button><span id="gps-status" class="gps-status">${status}</span></div>
        <div id="map" aria-label="Kleenest restroom map"></div>
        <div class="stack" style="gap:8px"><h3 class="section-title">Nearby restrooms</h3>${rows || '<div class="card card-pad"><p class="profile-sub">No mapped restrooms are available yet.</p></div>'}</div>
      </div>`;
    };
  }
})();
