/* Maps Verification UI — collects the required explicit bathroom answer before calling the trusted authority. */
export function bindMapsVerificationUI(root,core){
 if(!root||!core)return()=>{};
 const onVerify=async event=>{
  const button=event.target?.closest?.('[data-detail-verify]');
  if(!button||!root.contains(button))return;
  event.preventDefault();event.stopImmediatePropagation();
  const locationId=core.state?.selectedLocationId;
  if(!locationId)return;
  const location=(core.state?.locations||[]).find(x=>String(x.id)===String(locationId));
  const result=window.confirm('Does this location have a public bathroom?\n\nChoose OK for Yes or Cancel for No. Your current GPS position will be used to verify the location.');
  const status=root.querySelector('[data-map-details] small');
  try{
   const verification=core.modules?.verification;
   if(String(locationId).startsWith('osm:')){
    if(typeof verification?.promoteExternal!=='function')throw new Error('Public-location verification is unavailable.');
    await verification.promoteExternal({location,evidence:{hasPublicBathroom:result}});
   }else{
    const detail=await core.modules?.details?.open?.(locationId,{state:core.state,user:core.user});
    const verify=detail?.actions?.verify;
    if(typeof verify!=='function')throw new Error('Verification is unavailable for this location.');
    await verify({hasPublicBathroom:result});
   }
   if(status)status.textContent='Verification submitted';
   await core.refreshDiscovery({position:core.state?.position});
  }catch(error){if(status)status.textContent=error?.message||'Verification failed.';}
 };
 root.addEventListener('click',onVerify,true);
 return()=>root.removeEventListener('click',onVerify,true);
}
