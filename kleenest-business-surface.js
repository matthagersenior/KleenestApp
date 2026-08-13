/* Modular Business surface: owner dashboard, verification/tier visibility and partnership hooks. */
(function(){'use strict';
 const B=window.KleenestBusinessSurface=window.KleenestBusinessSurface||{};
 const rpc=async(name,args={})=>{const api=window.KleenestSupabase;if(!api||typeof api.rpc!=='function')throw new Error('Supabase business boundary unavailable');return api.rpc(name,args)};
 B.getDashboard=()=>rpc('get_business_dashboard');
 B.getLocations=()=>rpc('get_current_user_business_locations');
 B.getPrograms=()=>rpc('business_list_partner_programs');
 B.createListing=(name,address,city,state,zip)=>rpc('create_business_for_current_user',{p_name:name,p_address:address,p_city:city,p_state:state,p_zip:zip});
 B.requestPartner=(businessId,programId)=>rpc('business_request_partner_agreement',{p_business_id:businessId,p_program_id:programId});
 B.renderSummary=(root,data)=>{if(!root)return;const d=data||{};root.innerHTML=`<section class="kleenest-modular-surface"><header><h2>Business</h2><p>Manage your listing, verification, tier, engagement and partnerships.</p></header><div class="kleenest-modular-grid"><article><h3>Verification</h3><p>${String(d.verification_status||d.verificationStatus||'Pending')}</p></article><article><h3>Tier</h3><p>${String(d.tier||d.business_tier||'Standard')}</p></article><article><h3>Locations</h3><p>${Array.isArray(d.locations)?d.locations.length:0}</p></article><article><h3>Partnerships</h3><p>${Array.isArray(d.programs)?d.programs.length:0}</p></article></div></section>`};
})();
