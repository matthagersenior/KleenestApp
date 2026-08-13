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
})();
