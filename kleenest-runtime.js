/* Kleenest shared runtime adapter. Uses the existing Supabase client; no credentials are stored here. */
(function(){
  'use strict';
  window.KleenestRuntime=window.KleenestRuntime||{};
  function client(){if(!window.KleenestSupabase?.getClient)throw new Error('Supabase is not ready.');return window.KleenestSupabase.getClient();}
  async function session(){if(!window.KleenestSupabase?.session)throw new Error('Supabase is not ready.');return window.KleenestSupabase.session();}
  async function auth(){const s=await session();if(!s)throw new Error('Please sign in to continue.');return s;}
  async function rpc(name,args){await auth();const {data,error}=await client().rpc(name,args||{});if(error)throw error;return data;}
  window.KleenestRuntime.session=session;
  window.KleenestRuntime.supabaseReady=()=>!!window.KleenestSupabase?.getClient;
  window.KleenestRuntime.verifyCheckin=(qrCode,latitude,longitude)=>rpc('verify_checkin',{p_qr_code:qrCode,p_latitude:latitude,p_longitude:longitude});
  window.KleenestRuntime.redeemPromotion=(promotionId,locationId)=>rpc('redeem_promotion',{p_promotion_id:promotionId,p_location_id:locationId||null});
  window.KleenestRuntime.markNotificationRead=(notificationId)=>rpc('mark_notification_read',{p_notification_id:notificationId});
  window.KleenestRuntime.replyToReview=(reviewId,reply)=>rpc('reply_to_review',{p_review_id:reviewId,p_reply:reply});
  window.KleenestRuntime.signOut=async()=>{if(!window.KleenestSupabase?.signOut)throw new Error('Supabase is not ready.');return window.KleenestSupabase.signOut();};
})();