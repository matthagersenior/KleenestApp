/* Kleenest UI integration bridge.
 * Explicit action hooks are supported, plus a narrow capture-phase migration
 * for the existing check-in and review controls. The legacy UI stays intact;
 * only authenticated, backend-capable actions are intercepted.
 */
(function () {
  'use strict';
  window.KleenestUI = window.KleenestUI || {};

  function emit(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
  }

  function setBusy(el, busy) {
    if (!el) return;
    el.disabled = !!busy;
    el.setAttribute('aria-busy', busy ? 'true' : 'false');
  }

  async function run(el, fn) {
    setBusy(el, true);
    try { return await fn(); }
    catch (error) {
      emit('kleenest:action-error', { action: el?.dataset?.kleenestAction || '', error });
      throw error;
    }
    finally { setBusy(el, false); }
  }

  async function handle(el) {
    const action = el.dataset.kleenestAction;
    if (!action) return;

    if (action === 'signout') return run(el, () => KleenestRuntime.signOut());
    if (action === 'notification-read') return run(el, () => KleenestActions.markNotificationRead(el.dataset.notificationId));
    if (action === 'redeem-promotion') return run(el, () => KleenestActions.redeemPromotion(el.dataset.promotionId, el.dataset.locationId));
    if (action === 'reply-review') return run(el, () => KleenestActions.replyToReview(el.dataset.reviewId, el.dataset.reply || ''));
    if (action === 'checkin') return run(el, () => KleenestActions.checkIn(el.dataset.qrCode, Number(el.dataset.latitude), Number(el.dataset.longitude)));
  }

  document.addEventListener('click', function (event) {
    const el = event.target.closest?.('[data-kleenest-action]');
    if (!el) return;
    handle(el).catch(function () {});
  });

  /* Migration: existing "Check In Now" controls. Capture runs before the
     legacy localStorage handler. A backend success commits the visit; a backend
     failure leaves the action uncommitted rather than silently writing local data.
   */
  document.addEventListener('click', async function (event) {
    const el = event.target.closest?.('[data-checkin]');
    if (!el || el.dataset.kleenestMigrated === '1') return;
    if (!window.KleenestRuntime?.supabaseReady?.()) return;
    const user = typeof currentUser === 'function' ? currentUser() : null;
    if (!user) return; // preserve the legacy login prompt for guests
    const location = typeof selected !== 'undefined' ? selected : null;
    if (!location?.id) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    el.dataset.kleenestMigrated = '1';
    setBusy(el, true);
    try {
      const pos = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('Location is required for a live check-in.'));
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
      });
      const result = await KleenestRuntime.verifyCheckin(location.id, pos.coords.latitude, pos.coords.longitude);
      if (typeof KleenestRewards?.syncCheckin === 'function' && result?.id) {
        await KleenestRewards.syncCheckin(result.id).catch(() => {});
      }
      emit('kleenest:checkin-live', { result, locationId: location.id });
      alert('✓ Live check-in confirmed. Your rewards were synchronized from Supabase.');
      if (typeof render === 'function') render();
    } catch (error) {
      emit('kleenest:action-error', { action: 'checkin', error });
      alert(error?.message || 'Live check-in could not be completed.');
    } finally {
      el.dataset.kleenestMigrated = '0';
      setBusy(el, false);
    }
  }, true);

  /* Migration: existing review submit control. We only intercept once the
     authenticated Supabase review RPC is available. The existing UI remains
     the fallback when Supabase is not ready, preserving demo/offline behavior.
   */
  document.addEventListener('click', async function (event) {
    const el = event.target.closest?.('[data-submit-review]');
    if (!el || el.dataset.kleenestMigrated === '1') return;
    if (!window.KleenestRuntime?.supabaseReady?.() || typeof KleenestReviews?.create !== 'function') return;
    const user = typeof currentUser === 'function' ? currentUser() : null;
    const location = typeof selected !== 'undefined' ? selected : null;
    if (!user || !location?.id) return; // legacy handler handles guest state

    const text = document.getElementById('review-text')?.value?.trim() || '';
    if (text.length < 10) return; // let the existing validation/message handle this
    const stars = Number(typeof reviewStars !== 'undefined' ? reviewStars : 5);
    const amenities = [...document.querySelectorAll('.rev-amenity:checked')].map(x => x.value);

    event.preventDefault();
    event.stopImmediatePropagation();
    el.dataset.kleenestMigrated = '1';
    setBusy(el, true);
    try {
      const cleanliness = Number.isFinite(Number(location.cleanlinessPct)) && Number(location.cleanlinessPct) > 0
        ? Number(location.cleanlinessPct) : null;
      const created = await KleenestReviews.create(location.id, null, stars, cleanliness, text);
      emit('kleenest:review-live', { review: created, locationId: location.id, amenities });
      alert('✓ Review saved to Supabase.');
      if (typeof render === 'function') render();
    } catch (error) {
      emit('kleenest:action-error', { action: 'review-create', error });
      alert(error?.message || 'The review could not be saved to Supabase.');
    } finally {
      el.dataset.kleenestMigrated = '0';
      setBusy(el, false);
    }
  }, true);

  window.KleenestUI.run = function (action, params) {
    params = params || {};
    if (action === 'signout') return KleenestRuntime.signOut();
    if (action === 'notification-read') return KleenestActions.markNotificationRead(params.notificationId);
    if (action === 'redeem-promotion') return KleenestActions.redeemPromotion(params.promotionId, params.locationId);
    if (action === 'reply-review') return KleenestActions.replyToReview(params.reviewId, params.reply);
    if (action === 'checkin') return KleenestActions.checkIn(params.qrCode, params.latitude, params.longitude);
    throw new Error('Unknown Kleenest UI action: ' + action);
  };

  window.KleenestUI.authReady = function () {
    return !!(window.KleenestRuntime && window.KleenestRuntime.supabaseReady && window.KleenestRuntime.supabaseReady());
  };
})();
