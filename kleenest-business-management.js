/* Kleenest business management actions. */
(function () {
  'use strict';
  window.KleenestBusinessManagement = window.KleenestBusinessManagement || {};
  function client() { if (!window.KleenestSupabase?.client) throw new Error('Supabase is not ready.'); return window.KleenestSupabase.client(); }
  async function auth() { const s=await window.KleenestSupabase.session(); if(!s) throw new Error('Please sign in to continue.'); return s; }
  async function rpc(name,args){await auth();const {data,error}=await client().rpc(name,args||{});if(error)throw error;window.dispatchEvent(new CustomEvent('kleenest:business-mutated',{detail:{operation:name,data}}));return data;}

  window.KleenestBusinessManagement.createLocation = async function (businessId, input) {
    input=input||{}; return rpc('business_create_location',{p_business_id:businessId,p_name:input.name,p_address:input.address||null,p_city:input.city||null,p_state:input.state||null,p_postal_code:input.postalCode||null,p_latitude:Number(input.latitude),p_longitude:Number(input.longitude),p_phone:input.phone||null,p_website:input.website||null});
  };
  window.KleenestBusinessManagement.updateLocation = async function (locationId, input) {
    input=input||{}; return rpc('business_update_location',{p_location_id:locationId,p_name:input.name??null,p_address:input.address??null,p_phone:input.phone??null,p_website:input.website??null,p_active:input.active??null});
  };
  window.KleenestBusinessManagement.createPromotion = async function (businessId, input) {
    input=input||{}; return rpc('business_create_promotion',{p_business_id:businessId,p_location_id:input.locationId||null,p_title:input.title,p_description:input.description||null,p_discount:input.discount||null,p_starts_at:input.startsAt||null,p_ends_at:input.endsAt||null});
  };
  window.KleenestBusinessManagement.setPromotionActive = async function (promotionId, active) {
    return rpc('business_set_promotion_active',{p_promotion_id:promotionId,p_active:Boolean(active)});
  };
  window.KleenestBusinessManagement.inviteMember = function(businessId,userId,role){return rpc('business_invite_member',{p_business_id:businessId,p_user_id:userId,p_role:role});};
  window.KleenestBusinessManagement.changeMemberRole = function(businessId,userId,role){return rpc('business_change_member_role',{p_business_id:businessId,p_user_id:userId,p_role:role});};
  window.KleenestBusinessManagement.removeMember = function(businessId,userId){return rpc('business_remove_member',{p_business_id:businessId,p_user_id:userId});};
  window.KleenestBusinessManagement.transferOwnership = function(businessId,newOwnerId){return rpc('business_transfer_ownership',{p_business_id:businessId,p_new_owner_id:newOwnerId});};
})();
