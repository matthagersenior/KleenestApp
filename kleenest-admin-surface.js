/* Modular Admin surface: explicit privileged boundary; no browser-side role escalation. */
(function(){'use strict';
 const A=window.KleenestAdminSurface=window.KleenestAdminSurface||{};
 const rpc=async(name,args={})=>{const api=window.KleenestSupabase;if(!api||typeof api.rpc!=='function')throw new Error('Supabase admin boundary unavailable');return api.rpc(name,args)};
 A.getOverview=()=>rpc('admin_get_overview');
 A.getPendingBusinesses=()=>rpc('admin_list_pending_businesses');
 A.getReports=()=>rpc('admin_list_reports');
 A.verifyBusiness=(id,status)=>rpc('admin_set_business_verification',{p_business_id:id,p_status:status});
 A.setBusinessTier=(id,tier)=>rpc('admin_set_business_tier',{p_business_id:id,p_tier:tier});
 A.renderSummary=(root,data)=>{if(!root)return;const d=data||{};root.innerHTML=`<section class="kleenest-modular-surface"><header><h2>Admin</h2><p>Moderation, verification, platform health and business controls.</p></header><div class="kleenest-modular-grid"><article><h3>Pending businesses</h3><p>${Array.isArray(d.pending_businesses)?d.pending_businesses.length:0}</p></article><article><h3>Reports</h3><p>${Array.isArray(d.reports)?d.reports.length:0}</p></article><article><h3>Platform health</h3><p>${String(d.health||'Protected')}</p></article></div></section>`};
})();
