/* Modular Fleet/Enterprise command center: multi-location operations, member roles, analytics and growth. */
(function(){'use strict';
 const E=window.KleenestEnterprise=window.KleenestEnterprise||{};
 const rpc=async(name,args={})=>{const api=window.KleenestSupabase;if(!api||typeof api.rpc!=='function')throw new Error('Enterprise boundary unavailable');return api.rpc(name,args)};
 E.getDashboard=()=>rpc('get_business_dashboard');
 E.getMembers=(businessId)=>rpc('business_list_members',{p_business_id:businessId});
 E.getLocations=(businessId)=>rpc('business_list_locations',{p_business_id:businessId});
 E.getPrograms=()=>rpc('business_list_partner_programs');
 E.inviteMember=(businessId,userId,role)=>rpc('business_invite_member',{p_business_id:businessId,p_user_id:userId,p_role:role});
 E.updateMemberRole=(businessId,userId,role)=>rpc('business_update_member_role',{p_business_id:businessId,p_user_id:userId,p_role:role});
 E.removeMember=(businessId,userId)=>rpc('business_remove_member',{p_business_id:businessId,p_user_id:userId});
 E.snapshot=async(businessId,start,end)=>{const [overview,metrics,locations,members,programs]=await Promise.all([E.getDashboard(),window.KleenestBusinessIntelligence?.getDashboard(businessId,start,end),E.getLocations(businessId),E.getMembers(businessId),E.getPrograms()]);return {overview,metrics,locations,members,programs}};
 E.render=(root,s)=>{if(!root)return;const x=s||{};const m=x.metrics||{};root.innerHTML=`<section class="kleenest-enterprise"><header><h2>Fleet & Enterprise Command Center</h2><p>Operate locations, teams, partnerships and growth from one control surface.</p></header><div class="kleenest-modular-grid"><article><h3>Network</h3><p>${Array.isArray(x.locations)?x.locations.length:0} locations</p></article><article><h3>Workforce</h3><p>${Array.isArray(x.members)?x.members.length:0} members</p></article><article><h3>Engagement</h3><p>${Number(m.visits??0)} visits · ${Number(m.checkIns??0)} check-ins</p></article><article><h3>Reputation</h3><p>${Number(m.reviews??0)} reviews · ${Number(m.averageRating??0)} rating</p></article><article><h3>Growth</h3><p>${Number(m.promotions??0)} promotion redemptions · ${Number(m.preferredUses??0)} Preferred uses</p></article><article><h3>Partnerships</h3><p>${Array.isArray(x.programs)?x.programs.length:0} programs</p></article></div></section>`};
})();
