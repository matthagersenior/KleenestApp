/* Kleenest Preferred Visit — authoritative UI/action bridge.
 * A Preferred Location exists only when the user has an eligible tier AND
 * an actual active business/program connection. Never infer eligibility
 * from tier alone.
 */
(function () {
  'use strict';

  function eligible(user, location) {
    return !!(window.kleenestPreferredAccess && window.kleenestPreferredAccess.eligible(user, location));
  }

  async function activate(user, location) {
    if (!eligible(user, location)) {
      return { ok: false, reason: 'not_eligible' };
    }
    const program = location && location.partnerProgram;
    const tracker = window.kleenestRecordPreferredActivation;
    if (typeof tracker !== 'function') {
      return { ok: false, reason: 'tracking_unavailable' };
    }
    const result = await tracker(location.id, program && program.id);
    return result ? { ok: true, data: result } : { ok: false, reason: 'activation_failed' };
  }

  async function recordUse(locationId) {
    const client = window.kleenestSupabase;
    if (!client || !locationId) return null;
    try {
      const { data, error } = await client.rpc('record_preferred_location_use', {
        p_location_id: locationId
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[Kleenest] Preferred visit usage tracking unavailable:', err?.message || err);
      return null;
    }
  }

  window.kleenestPreferredVisit = { eligible, activate, recordUse };
})();
