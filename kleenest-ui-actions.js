/* Shared Kleenest UI action dispatcher. */
(function(){'use strict';
  const api=window.KleenestUIActions=window.KleenestUIActions||{};
  api.run=async function(action,p){
    p=p||{};
    const A=window.KleenestActions,R=window.KleenestRuntime;
    if(action==='signout')return R.signOut();
    if(!A)throw new Error('Consumer action layer is not ready.');
    if(action==='notification-read')return A.markNotificationRead(p.notificationId);
    if(action==='redeem-promotion')return A.redeemPromotion(p.promotionId,p.locationId);
    if(action==='reply-review')return A.replyToReview(p.reviewId,p.reply||'');
    if(action==='checkin')return A.checkIn(p.qrCode,p.latitude,p.longitude);
    throw new Error('Unknown Kleenest UI action: '+action);
  };
  window.KleenestUI=window.KleenestUI||{};
  window.KleenestUI.run=api.run;
})();