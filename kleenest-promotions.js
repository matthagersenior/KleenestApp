/* Kleenest promotion and subscription data layer. */
(function () {
  'use strict';
  window.KleenestPromotions = window.KleenestPromotions || {};
  function client() { if (!window.KleenestSupabase?.client) throw new Error('Supabase is not ready.'); return window.KleenestSupabase.client(); }
  async function auth() { const s=await window.KleenestSupabase.session(); if(!s) throw new Error('Please sign in to continue.'); return s; }

  window.KleenestPromotions.get = async function (promotionId) {
    await auth();
    const {data,error}=await client().rpc('promotion_redemption_summary',{p_promotion_id:promotionId});
    if(error) throw error; return data;
  };

  window.KleenestPromotions.redeem = async function (promotionId, locationId) {
    await auth();
    const redemption=await window.KleenestRuntime.redeemPromotion(promotionId, locationId || null);
    if(!redemption?.id) return redemption;
    return window.KleenestPromotions.syncRedemption(redemption.id);
  };

  window.KleenestPromotions.syncRedemption = async function (redemptionId) {
    await auth();
    const {data,error}=await client().rpc('promotion_redemption_rewards_summary',{p_redemption_id:redemptionId});
    if(error) throw error;
    const result=data||{};
    const profile=result.profile||{};
    const user={id:(await window.KleenestSupabase.session()).user.id,points:Number(profile.points||0),level:Number(profile.level||1),streak:Number(profile.streak||0),totalCheckIns:Number(profile.total_check_ins||0),totalReviews:Number(profile.total_reviews||0),source:'supabase'};
    if(window.KleenestRuntime) window.KleenestRuntime.user=Object.assign({},window.KleenestRuntime.user||{},user);
    if(typeof state!=='undefined'&&state.session) state.session=Object.assign({},state.session,user);
    window.dispatchEvent(new CustomEvent('kleenest:promotion-redeemed',{detail:{redemption:result.redemption,promotion:result.promotion,profile:user,transactions:result.transactions||[]}}));
    if(typeof render==='function') render();
    return result;
  };

  window.KleenestPromotions.activeForLocation = async function (locationId, limit=50) {
    if(!locationId) return [];
    const {data,error}=await client().from('promotions').select('id,business_id,location_id,title,description,discount,starts_at,ends_at,days_of_week,start_hour,end_hour,active,created_at').eq('location_id',locationId).eq('active',true).order('starts_at',{ascending:false}).limit(Math.min(Math.max(Number(limit),1),100));
    if(error) throw error; return data||[];
  };

  window.KleenestPromotions.redemptionHistory = async function (limit=50) {
    await auth();
    const {data,error}=await client().from('promotion_redemptions').select('id,promotion_id,location_id,redeemed_at').order('redeemed_at',{ascending:false}).limit(Math.min(Math.max(Number(limit),1),100));
    if(error) throw error; return data||[];
  };
})();