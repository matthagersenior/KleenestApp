/* Kleenest Maps Core v3 — the single canonical owner of the Maps tab. */
export async function createMapsCore({root,user=null,supabase=null}={}){
 if(!root)throw new Error('Maps Core requires a mount root.');
 let runtime=null;
 async function ensureRuntime(){
  if(window.KleenestMapsSafeRuntimeV1?.render)return window.KleenestMapsSafeRuntimeV1;
  await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='kleenest-maps-safe-runtime-v1.js?maps-core=15';s.onload=resolve;s.onerror=()=>reject(Error('Canonical Maps renderer failed to load.'));document.head.appendChild(s)});
  if(!window.KleenestMapsSafeRuntimeV1?.render)throw new Error('Canonical Maps renderer unavailable.');
  return window.KleenestMapsSafeRuntimeV1;
 }
 async function mount(){runtime=await ensureRuntime();return runtime.render(root,{user,supabase:supabase||window.KleenestSupabaseClient})}
 function destroy(){try{runtime?.destroy?.()}finally{root.replaceChildren();runtime=null}}
 return Object.freeze({name:'maps',version:'3.0.0',mount,destroy});
}
