/* Canonical Business Tab Core v11 — visible Workspace + full feature/QR/Fleet stack. */
export function createBusinessCore({root,user=null,supabase}={}){
 if(!root)throw new Error('Business Core requires a mount root.');
 const load=src=>new Promise((resolve,reject)=>{const base=src.split('?')[0];const existing=[...document.scripts].find(s=>s.src.includes(base));if(existing&&existing.dataset.kleenestLoaded==='1')return resolve();const s=document.createElement('script');s.src=src;s.async=false;s.dataset.kleenestLoaded='1';s.onload=resolve;s.onerror=()=>reject(Error('Failed to load '+src));document.head.appendChild(s)});
 let workspaceMounted=false,fleetHost=null;
 async function mountWorkspace(){if(workspaceMounted)return;workspaceMounted=true;if(!window.KleenestBusinessWorkspaceV1)await load('kleenest-business-workspace-v1.js?business=canonical-v18');await window.KleenestBusinessWorkspaceV1.mount(root,{supabase,user})}
 async function mount(){root.dataset.kleenestSurface='business';root.innerHTML='<div class="kcard"><h2>Loading Business Workspace…</h2><p>Loading business tools, datasets, QR Studio and Fleet controls.</p></div>';try{
  await mountWorkspace();
  if(!window.KleenestBusinessGapCloserV1)await load('kleenest-business-gap-closer-v2.js?business=studio-v5');
  await window.KleenestBusinessGapCloserV1?.enhance?.(root);
  if(!window.KleenestBusinessFeatureEntitlementEnforcerV3)await load('kleenest-business-feature-entitlement-enforcer-v3.js?business=pricing-v5');
  await window.KleenestBusinessFeatureEntitlementEnforcerV3?.enforce?.(root);
  if(!window.KleenestBusinessStudioEntitlementGuardV1)await load('kleenest-business-studio-entitlement-guard-v1.js?business=entitlements-v10');
  await window.KleenestBusinessStudioEntitlementGuardV1?.enforce?.(root);
  if(!window.KleenestFleetWorkspaceV1)await load('kleenest-fleet-workspace-v1.js?fleet=canonical-v5');
  if(window.KleenestFleetWorkspaceV1?.render){fleetHost=document.createElement('section');fleetHost.className='business-fleet-surface';fleetHost.dataset.businessFleet='1';fleetHost.style.cssText='margin-top:16px';root.appendChild(fleetHost);try{await window.KleenestFleetWorkspaceV1.render(fleetHost,{supabase,user})}catch(e){fleetHost.remove();fleetHost=null;if(!/Fleet tier entitlement required/i.test(String(e?.message||e)))console.warn('[Kleenest] Fleet surface unavailable',e)}}
 }catch(e){console.error('[Kleenest] Business Core',e);root.innerHTML='<div class="kcard"><h2>Business Workspace</h2><p>We could not load the business workspace.</p><button class="kbtn" type="button" id="kbw-core-retry">Retry</button></div>';root.querySelector('#kbw-core-retry')?.addEventListener('click',()=>mount())}}
 function destroy(){workspaceMounted=false;fleetHost=null;root.replaceChildren()}
 return Object.freeze({name:'business',version:'canonical-v11',mount,destroy,mountWorkspace})
}