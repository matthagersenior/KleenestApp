/* Canonical Admin Tab Core v4 — Dataset Control Center + Admin Tools. */
export function createAdminCore({root,user=null}={}){
 if(!root)throw new Error('Admin Core requires a mount root.');
 let toolsHost=null,stopCards=null;
 const loadScript=(src,globalName)=>new Promise((resolve,reject)=>{if(globalName&&window[globalName])return resolve();const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error(`Failed to load ${src}`));document.head.appendChild(s)});
 async function mount(){
  if(!window.KleenestAdminCanonicalRuntimeV3?.render)throw new Error('Canonical Admin implementation unavailable.');
  await window.KleenestAdminCanonicalRuntimeV3.render(root,user);
  await loadScript('kleenest-admin-tools-dashboard-v1.js?admin-tools=1','KleenestAdminToolsDashboardV1');
  const wrap=document.createElement('section');wrap.className='admin-control-center-tools';wrap.style.cssText='margin-top:14px';
  wrap.innerHTML='<nav aria-label="Admin control center" style="display:flex;gap:8px;overflow:auto;margin-bottom:10px"><button type="button" data-admin-view="datasets" style="border:1px solid #cfe0d9;border-radius:11px;background:#0e7c6b;color:#fff;padding:10px 13px;font-weight:900;white-space:nowrap">Datasets</button><button type="button" data-admin-view="tools" style="border:1px solid #cfe0d9;border-radius:11px;background:#fff;color:#165e51;padding:10px 13px;font-weight:900;white-space:nowrap">Admin Tools</button></nav><div data-admin-tools-host hidden></div>';
  root.appendChild(wrap);toolsHost=wrap.querySelector('[data-admin-tools-host]');const datasetButton=wrap.querySelector('[data-admin-view="datasets"]'),toolsButton=wrap.querySelector('[data-admin-view="tools"]');
  const setView=view=>{const tools=view==='tools';toolsHost.hidden=!tools;datasetButton.style.background=tools?'#fff':'#0e7c6b';datasetButton.style.color=tools?'#165e51':'#fff';toolsButton.style.background=tools?'#0e7c6b':'#fff';toolsButton.style.color=tools?'#fff':'#165e51';if(tools)window.KleenestAdminToolsDashboardV1.render(toolsHost)};
  datasetButton.onclick=()=>setView('datasets');toolsButton.onclick=()=>setView('tools');
  return root;
 }
 function destroy(){stopCards?.();stopCards=null;toolsHost=null;root.replaceChildren();}
 return Object.freeze({name:'admin',version:'canonical-v4',mount,destroy});
}
