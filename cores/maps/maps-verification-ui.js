/* Maps Verification UI — collects the required explicit bathroom answer and resolves public OSM records to real Kleenest locations before trusted verification. */
export function bindMapsVerificationUI(root,core){
 if(!root||!core)return()=>{};
 const onVerify=async event=>{
  const button=event.target?.closest?.('[data-detail-verify]');
  if(!button||!root.contains(button))return;
  event.preventDefault();event.stopImmediatePropagation();
  const selectedId=core.state?.selectedLocationId;if(!selectedId)return;
  const selected=(core.state?.locations||[]).find(x=>String(x.id)===String(selectedId));
  const result=window.confirm('Does this location have a public bathroom?\n\nChoose OK for Yes or Cancel for No. Your current GPS position will be used to verify the location.');
  const status=root.querySelector('[data-map-details] small');
  try{
   let locationId=selectedId;
   if(selected?.external&&String(selected.source||'').toLowerCase()==='osm'){
    if(status)status.textContent='Saving public location…';
    locationId=await core.modules?.discovery?.promoteExternal?.(selected);
    if(!locationId)throw new Error('The public location could not be linked to a Kleenest location.');
   }
   const detail=await core.modules?.details?.open?.(locationId,{state:core.state,user:core.user});
   const verify=detail?.actions?.verify;
   if(typeof verify!=='function')throw new Error('Verification is unavailable for this location.');
   await verify({hasPublicBathroom:result});
   if(status)status.textContent='Verification submitted';
   await core.refreshDiscovery?.({position:core.state?.position,recenter:false});
  }catch(error){if(status)status.textContent=error?.message||'Verification failed.';}
 };
 root.addEventListener('click',onVerify,true);
 return()=>root.removeEventListener('click',onVerify,true);
}
