/* Modular Business surface: owner dashboard, verification/tier visibility and partnership hooks. */
(function(){'use strict';
 const B=window.KleenestBusinessSurface=window.KleenestBusinessSurface||{};
 const rpc=async(name,args={})=>{const api=window.KleenestSupabase;if(!api||typeof api.rpc!=='function')throw new Error('Supabase business boundary unavailable');return api.rpc(name,args)};
 B.getDashboard=()=>rpc('get_business_dashboard');
 B.getPrograms=()=>rpc('business_list_partner_programs');
 B.createListing=(name,address,phone,website,placeType)=>rpc('create_business_for_current_user',{p_name:name,p_address:address,p_phone:phone,p_website:website,p_place_type:placeType});
 B.createLocation=(businessId,name,address,city,state,postalCode,lat,lon,phone,website)=>rpc('business_create_location',{p_business_id:businessId,p_name:name,p_address:address,p_city:city,p_state:state,p_postal_code:postalCode,p_latitude:lat,p_longitude:lon,p_phone:phone,p_website:website});
 B.updateLocation=(id,name,address,phone,website,active=true)=>rpc('business_update_location',{p_location_id:id,p_name:name,p_address:address,p_phone:phone,p_website:website,p_active:active});
 B.requestPartner=(programId,partnerBusinessId)=>rpc('business_request_partner_agreement',{p_partner_program_id:programId,p_partner_business_id:partnerBusinessId});
 B.renderSummary=(root,data)=>{if(!root)return;const d=data||{};const b=d.business||d;root.innerHTML=`<section class="kleenest-modular-surface"><header><h2>Business</h2><p>Manage your listing, verification, tier, engagement and partnerships.</p></header><div class="kleenest-modular-grid"><article><h3>Verification</h3><p>${String(b.verification_status||b.verificationStatus||'Pending')}</p></article><article><h3>Tier</h3><p>${String(b.business_tier||b.tier||'Standard')}</p></article><article><h3>Locations</h3><p>${Array.isArray(d.locations)?d.locations.length:0}</p></article><article><h3>Partnerships</h3><p>${Array.isArray(d.programs)?d.programs.length:0}</p></article></div></section>`};
})();
