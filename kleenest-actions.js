/* Kleenest action adapters.
 * These are additive and do not modify the legacy UI. Existing UI handlers can
 * call these methods when their corresponding controls are migrated.
 */
(function () {
  'use strict';
  window.KleenestActions = window.KleenestActions || {};

  function runtime() {
    if (!window.KleenestRuntime) throw new Error('Kleenest runtime is not loaded.');
    return window.KleenestRuntime;
  }

  window.KleenestActions.checkIn = async function (qrCode, latitude, longitude) {
    if (!qrCode) throw new Error('A QR code is required.');
    if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
      throw new Error('A valid location is required for check-in.');
    }
    return runtime().verifyCheckin(String(qrCode).trim(), Number(latitude), Number(longitude));
  };

  window.KleenestActions.replyToReview = async function (reviewId, text) {
    if (!reviewId) throw new Error('A review ID is required.');
    const reply = String(text || '').trim();
    if (!reply) throw new Error('A reply is required.');
    return runtime().replyToReview(reviewId, reply);
  };

  window.KleenestActions.redeemPromotion = async function (promotionId, locationId) {
    if (!promotionId) throw new Error('A promotion ID is required.');
    return runtime().redeemPromotion(promotionId, locationId || null);
  };

  window.KleenestActions.markNotificationRead = async function (notificationId) {
    if (!notificationId) throw new Error('A notification ID is required.');
    return runtime().markNotificationRead(notificationId);
  };
})();
