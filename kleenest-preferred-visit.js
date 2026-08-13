/* Kleenest Preferred Visit — server-authoritative UI/action bridge. */
(function () {
  'use strict';

  async function authorize(locationId) {
    if (window.kleenestPreferredAuthority?.check) {
      return window.kleenestPreferredAuthority.check(locationId);
    }
    return { eligible: false, reason: 'authorization_layer_missing' };
  }

  async function activate(user, location) {
    const locationId = location?.id;
    if (!locationId) return { ok: false, reason: 'missing_location' };
    const auth = await authorize(locationId);
    if (!auth?.eligible) return { ok: false, reason: auth?.reason || 'not_eligible' };
    try {
      const result = await window.kleenestPreferredAuthority.activate(
        locationId,
        location?.partnerProgram?.id || auth.partner_program_id || null
      );
      return result ? { ok: true, data: result } : { ok: false, reason: 'activation_failed' };
    } catch (err) {
      console.warn('[Kleenest] Preferred activation failed:', err?.message || err);
      return { ok: false, reason: 'activation_failed' };
    }
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

  window.kleenestPreferredVisit = { authorize, activate, recordUse };
})();
