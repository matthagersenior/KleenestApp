/* Kleenest UI integration bridge.
 * Binds only explicitly marked controls/data attributes. It never guesses which
 * legacy button performs a sensitive operation, preventing accidental double
 * submissions or bypasses while the legacy UI is migrated incrementally.
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
