/* Maps Action Capabilities UI — prevents exposing Kleenest-only mutations for external public-source locations. */
export function bindMapsActionCapabilitiesUI(root,core){
 if(!root||!core)return()=>{};
 const isExternal=id=>{const row=(core.state?.locations||[]).find(x=>String(x.id)===String(id));return Boolean(row&&String(row.id).startsWith('osm:'))};
 const apply=()=>{
  root.querySelectorAll('[data-detail-route],[data-detail-checkin],[data-detail-favorite],[data-detail-verify]').forEach(el=>{const external=String(core.state?.selectedLocationId||'').startsWith('osm:');el.hidden=external;el.disabled=external});
  root.querySelectorAll('[data-card-route],[data-card-favorite]').forEach(el=>{const external=isExternal(el.dataset.cardRoute||el.dataset.cardFavorite);el.hidden=external;el.disabled=external});
  root.querySelectorAll('[data-result-card]').forEach(card=>{const id=card.dataset.resultCard;if(!isExternal(id))return;let note=card.querySelector('[data-public-action-note]');if(!note){note=document.createElement('small');note.dataset.publicActionNote='1';note.className='maps-public-action-note';note.textContent='Public-source location · verify into Kleenest to unlock route, check-in and favorite actions.';card.appendChild(note)}});
 };
 const observer=new MutationObserver(apply);observer.observe(root,{subtree:true,childList:true});apply();return()=>observer.disconnect();
}
