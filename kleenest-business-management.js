/* Kleenest business management actions. */
(function () {
  'use strict';
  window.KleenestBusinessManagement = window.KleenestBusinessManagement || {};
  function client() { if (!window.KleenestSupabase?.client) throw new Error('Supabase is not ready.'); return window.KleenestSupabase.client(); }
  async function auth() { const s=await window.KleenestSupabase.session(); if(!s) throw new Error('Please sign in to continue.'); return s; }

  window.KleenestBusinessManagement.createLocation = async function (businessId, input) {
    await auth(); input=input||{};
    const {data,error}=await client().rpc('business_create_location',{p_business_id:businessId,p_name:input.name,p_address:input.address||null,p_city:input.city||null,p_state:input.state||null,p_postal_code:input.postalCode||null,p_latitude:Number(input.latitude),p_longitude:Number(input.longitude),p_phone:input.phone||null,p_website:input.website||null});
    if(error) throw error; return data;
  };

  window.KleenestBusinessManagement.updateLocation = async function (locationId, input) {
    await auth(); input=input||{};
    const {data,error}=await client().rpc('business_update_location',{p_location_id:locationId,p_name:input.name??null,p_address:input.address??null,p_phone:input.phone??null,p_website:input.website??null,p_active:input.active??null});
    if(error) throw error; return data;
  };

  window.KleenestBusinessManagement.createPromotion = async function (businessId, input) {
    await auth(); input=input||{};
    const {data,error}=await client().rpc('business_create_promotion',{p_business_id:businessId,p_location_id:input.locationId||null,p_title:input.title,p_description:input.description||null,p_discount:input.discount||null,p_starts_at:input.startsAt||null,p_ends_at:input.endsAt||null});
    if(error) throw error; return data;
  };

  window.KleenestBusinessManagement.setPromotionActive = async function (promotionId, active) {
    await auth();
    const {data,error}=await client().rpc('business_set_promotion_active',{p_promotion_id:promotionId,p_active:Boolean(active)});
    if(error) throw error; return data;
  };
})();
