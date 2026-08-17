/* Canonical Business Tab Core v3 — one Business surface, with Fleet layered into the same lifecycle when entitled. */
export function createBusinessCore({root,user=null,supabase}={}){
 if(!root)throw new Error('Business Core requires a mount root.');
 const load=src=>new Promise((resolve,reject)=>{const base=src.split('?')[0];if(document.querySelector('script[src^="'+base+'"]'))return resolve();const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=()=>reject(Error('Failed to load '+src));document.head.appendChild(s)});
 async function mount(){
  root.innerHTML='<div class="kcard"><h2>Loading Business Workspace…</h2><p>Loading your business data and tools.</p></div>';
  try{
   if(!window.KleenestBusinessWorkspaceV1)await load('kleenest-business-workspace-v1.js?business=canonical-v6');
   if(!window.KleenestBusinessWorkspaceV1?.mount)throw Error('Canonical Business Workspace unavailable.');
   await window.KleenestBusinessWorkspaceV1.mount(root,{supabase,user});
   if(!window.KleenestBusinessGapCloserV1)await load('kleenest-business-gap-closer-v2.js?business=studio-v4');
   if(window.KleenestBusinessGapCloserV1?.enhance)await window.KleenestBusinessGapCloserV1.enhance(root);
   if(!window.KleenestBusinessStudioEntitlementGuardV1)await load('kleenest-business-studio-entitlement-guard-v1.js?business=entitlements-v2');
   if(window.KleenestBusinessStudioEntitlementGuardV1?.enforce)await window.KleenestBusinessStudioEntitlementGuardV1.enforce(root);
   await mountFleetIfEntitled();
  }catch(e){
   console.error('[Kleenest] Business Core',e);
   root.innerHTML='<div class="kcard"><h2>Business Workspace</h2><p>We could not load the business workspace.</p><button class="kbtn" type="button" id="kbw-core-retry">Retry</button></div>';
   const retry=root.querySelector('#kbw-core-retry');if(retry)retry.onclick=()=>mount();
  }
 }
 async function mountFleetIfEntitled(){
  if(!window.KleenestFleetWorkspaceV1)await load('kleenest-fleet-workspace-v1.js?fleet=canonical-v2');
  if(!window.KleenestFleetWorkspaceV1?.render)return;
  const host=document.createElement('section');host.className='business-fleet-surface';host.dataset.businessFleet='1';
  const marker=root.querySelector('[data-business-workspace]')||root.lastElementChild;
  if(marker&&marker.parentNode)marker.parentNode.appendChild(host);else root.appendChild(host);
  try{await window.KleenestFleetWorkspaceV1.render(host,{supabase,user});}
  catch(e){host.remove();if(!/Fleet tier entitlement required/i.test(String(e?.message||e)))console.warn('[Kleenest] Fleet surface unavailable',e)}
 }
 function destroy(){root.replaceChildren();}
 return Object.freeze({name:'business',version:'canonical-v3',mount,destroy});
}