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
    return window.KleenestRuntime.redeemPromotion(promotionId, locationId || null);
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
