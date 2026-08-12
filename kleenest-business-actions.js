/* Kleenest business management actions. All mutations delegate to secured Postgres RPCs. */
(function () {
  'use strict';
  window.KleenestBusinessActions=window.KleenestBusinessActions||{};
  function client(){if(!window.KleenestSupabase?.client)throw new Error('Supabase is not ready.');return window.KleenestSupabase.client();}
  async function auth(){const s=await window.KleenestSupabase.session();if(!s)throw new Error('Please sign in to continue.');return s;}
  async function rpc(name,args){await auth();const {data,error}=await client().rpc(name,args||{});if(error)throw error;window.dispatchEvent(new CustomEvent('kleenest:business-mutated',{detail:{operation:name,data}}));return data;}
  window.KleenestBusinessActions.inviteMember=(businessId,userId,role)=>rpc('business_invite_member',{p_business_id:businessId,p_user_id:userId,p_role:role});
  window.KleenestBusinessActions.changeMemberRole=(businessId,userId,role)=>rpc('business_change_member_role',{p_business_id:businessId,p_user_id:userId,p_role:role});
  window.KleenestBusinessActions.removeMember=(businessId,userId)=>rpc('business_remove_member',{p_business_id:businessId,p_user_id:userId});
  window.KleenestBusinessActions.transferOwnership=(businessId,newOwnerId)=>rpc('business_transfer_ownership',{p_business_id:businessId,p_new_owner_id:newOwnerId});
  window.KleenestBusinessActions.createLocation=(businessId,payload)=>rpc('business_create_location',{p_business_id:businessId,p_name:payload.name,p_address:payload.address,p_city:payload.city,p_state:payload.state,p_postal_code:payload.postalCode,p_latitude:payload.latitude,p_longitude:payload.longitude,p_phone:payload.phone,p_website:payload.website});
  window.KleenestBusinessActions.updateLocation=(locationId,payload)=>rpc('business_update_location',{p_location_id:locationId,p_name:payload.name,p_address:payload.address,p_phone:payload.phone,p_website:payload.website,p_active:payload.active});
  window.KleenestBusinessActions.createPromotion=(businessId,payload)=>rpc('business_create_promotion',{p_business_id:businessId,p_location_id:payload.locationId,p_title:payload.title,p_description:payload.description,p_discount:payload.discount,p_starts_at:payload.startsAt,p_ends_at:payload.endsAt});
  window.KleenestBusinessActions.setPromotionActive=(promotionId,active)=>rpc('business_set_promotion_active',{p_promotion_id:promotionId,p_active:!!active});
})();
