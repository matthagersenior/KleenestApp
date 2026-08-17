/* Canonical Profile Tab Core — the sole Profile surface owner. */
export function createProfileCore({root,user=null}={}){
 if(!root)throw new Error('Profile Core requires a mount root.');
 let stopCards=null;
 const loadCards=()=>new Promise((resolve,reject)=>{if(window.KleenestSurfaceCardNavV1)return resolve();const s=document.createElement('script');s.src='kleenest-surface-card-nav-v1.js?ui=3';s.onload=resolve;s.onerror=()=>reject(Error('Surface card navigation unavailable.'));document.head.appendChild(s)});
 async function mount(){const core=window.KleenestProfileCoreV2;if(!core?.render)throw new Error('Canonical Profile Core v2 unavailable.');await core.render(root,user);if(window.KleenestProfileConnectedAccountsV1)await window.KleenestProfileConnectedAccountsV1.enhance?.(root);await loadCards();stopCards=window.KleenestSurfaceCardNavV1?.enhance(root)||null;}
 function destroy(){stopCards?.();stopCards=null;root.replaceChildren();}
 return Object.freeze({name:'profile',version:'canonical-v3',mount,destroy});
}
