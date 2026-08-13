/* Safe bootstrap for legacy/demo locations. No fabricated businesses or partnerships. */
(function(){'use strict';
 async function sync(){
  if(!window.kleenestLocationAdapter||!window.kleenestDemoSync)return {ok:false,reason:'dependencies_missing'};
  const local=window.kleenestLocationAdapter.get();
  const resolved=[];
  for(const item of local){
   try{const r=await window.kleenestLocationIdentity.resolve(item); if(r.ok)resolved.push({localId:item.id,supabaseId:r.location_id,businessId:r.business_id,matchType:r.match_type});}
   catch(e){console.warn('[Kleenest] location resolution failed',item?.id,e?.message||e);}
  }
  return {ok:true,resolved};
 }
 window.kleenestDemoBootstrap={sync};
})();
