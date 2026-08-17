/* Canonical Social Tab Core — the sole Social surface owner. */
export async function createSocialCore({root,user=null,supabase}={}){
 if(!root)throw new Error('Social Core requires a mount root.');
 const mods=await Promise.all([import('./social-core-v2.js?canonical-tab=16'),import('../media/kleenest-media-core.js?canonical-tab=16')]);
 const media=mods[1].createMediaCore({supabase});
 const implementation=mods[0].createSocialCore({supabase,mediaCore:media,root,user});
 async function loadCards(){if(window.KleenestSurfaceCardNavV1)return;await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='kleenest-surface-card-nav-v1.js?ui=2';s.onload=resolve;s.onerror=()=>reject(Error('Surface card navigation unavailable.'));document.head.appendChild(s)})}
 async function mount(){await implementation.render();await loadCards();return window.KleenestSurfaceCardNavV1?.enhance(root);}
 function destroy(){implementation.destroy?.();root.replaceChildren();}
 return Object.freeze({name:'social',version:'canonical-v2',mount,destroy,implementation});
}
