/* Kleenest unified action dispatcher. */
(function(){'use strict';
  const api=window.KleenestActionDispatcher=window.KleenestActionDispatcher||{};
  const routes={
    checkin:(p)=>window.KleenestActions.checkIn(p.qrCode,p.latitude,p.longitude),
    'reply-review':(p)=>window.KleenestActions.replyToReview(p.reviewId,p.reply),
    'redeem-promotion':(p)=>window.KleenestActions.redeemPromotion(p.promotionId,p.locationId),
    'notification-read':(p)=>window.KleenestActions.markNotificationRead(p.notificationId)
  };
  function normalize(elOrAction,payload){if(typeof elOrAction==='string')return {action:elOrAction,payload:payload||{}};const el=elOrAction;return {action:el?.dataset?.kleenestAction||'',payload:Object.assign({},el?.dataset||{},payload||{})};}
  async function dispatch(elOrAction,payload){const {action,payload:params}=normalize(elOrAction,payload);const route=routes[action];if(!route)throw new Error('Unknown Kleenest action: '+action);try{const result=await route(params);window.KleenestEvents?.emit?.('action-complete',{action,result});return result;}catch(error){window.KleenestEvents?.report?.('action-dispatch',error,{action});throw error;}}
  api.dispatch=dispatch;api.routes=routes;
})();