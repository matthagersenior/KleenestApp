/* Canonical Admin Tab Core — the sole Admin surface owner. */
export function createAdminCore({root,user=null}={}){
 if(!root)throw new Error('Admin Core requires a mount root.');
 const loadCards=()=>new Promise((resolve,reject)=>{if(window.KleenestSurfaceCardNavV1)return resolve();const s=document.createElement('script');s.src='kleenest-surface-card-nav-v1.js?ui=2';s.onload=resolve;s.onerror=()=>reject(Error('Surface card navigation unavailable.'));document.head.appendChild(s)});
 async function mount(){if(!window.KleenestAdminCanonicalRuntimeV3?.render)throw new Error('Canonical Admin implementation unavailable.');await window.KleenestAdminCanonicalRuntimeV3.render(root,user);await loadCards();window.KleenestSurfaceCardNavV1?.enhance(root);return root;}
 function destroy(){root.replaceChildren();}
 return Object.freeze({name:'admin',version:'canonical-v2',mount,destroy});
}
