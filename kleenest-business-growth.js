/* Business growth layer: connects customer engagement to actions, promotions, partnerships and enterprise operations. */
(function(){'use strict';
 const G=window.KleenestBusinessGrowth=window.KleenestBusinessGrowth||{};
 const rpc=async(name,args={})=>{const api=window.KleenestSupabase;if(!api||typeof api.rpc!=='function')throw new Error('Business growth boundary unavailable');return api.rpc(name,args)};
 G.createPromotion=(businessId,locationId,title,description,discount,start,end)=>rpc('business_create_promotion',{p_business_id:businessId,p_location_id:locationId,p_title:title,p_description:description,p_discount:discount,p_starts_at:start,p_ends_at:end});
 G.setPromotionActive=(promotionId,active)=>rpc('business_set_promotion_active',{p_promotion_id:promotionId,p_active:active});
 G.createLocation=(businessId,name,address,city,state,postal,lat,lon,phone,website)=>rpc('business_create_location',{p_business_id:businessId,p_name:name,p_address:address,p_city:city,p_state:state,p_postal_code:postal,p_latitude:lat,p_longitude:lon,p_phone:phone,p_website:website});
 G.updateLocation=(id,name,address,phone,website,active)=>rpc('business_update_location',{p_location_id:id,p_name:name,p_address:address,p_phone:phone,p_website:website,p_active:active});
 G.inviteMember=(businessId,userId,role)=>rpc('business_invite_member',{p_business_id:businessId,p_user_id:userId,p_role:role});
 G.updateMemberRole=(businessId,userId,role)=>rpc('business_update_member_role',{p_business_id:businessId,p_user_id:userId,p_role:role});
 G.removeMember=(businessId,userId)=>rpc('business_remove_member',{p_business_id:businessId,p_user_id:userId});
 G.createPartnerProgram=(name,partnerBusinessId)=>rpc('business_create_partner_program',{p_name:name,p_partner_business_id:partnerBusinessId});
 G.addProgramLocation=(programId,locationId)=>rpc('business_add_program_location',{p_partner_program_id:programId,p_location_id:locationId});
 G.setProgramAccess=(programId,preferred)=>rpc('business_set_partner_program_access',{p_partner_program_id:programId,p_preferred_access:preferred});
 G.activatePreferred=(locationId,programId)=>rpc('activate_preferred_location',{p_location_id:locationId,p_partner_program_id:programId});
 G.deactivatePreferred=(locationId)=>rpc('deactivate_preferred_location',{p_location_id:locationId});
})();
