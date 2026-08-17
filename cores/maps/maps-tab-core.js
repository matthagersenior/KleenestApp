/* Canonical Maps Tab Core — one tab-level owner. Supporting Maps modules remain internal dependencies. */
export async function createMapsCore({root,user=null,supabase}={}){
 if(!root)throw new Error('Maps Core requires a mount root.');
 let cleanup=null;
 async function mount(){
  if(!window.KleenestMapsSafeRuntimeV1?.render)throw new Error('Canonical Maps implementation unavailable.');
  const shellRoot=document.getElementById('modular-root');
  if(shellRoot&&shellRoot!==root){shellRoot.id='kleenest-shell-root';root.id='modular-root';}
  try{cleanup=await window.KleenestMapsSafeRuntimeV1.render(root,{user,supabase});return cleanup;}finally{if(shellRoot&&shellRoot!==root){root.id='k13-maps';shellRoot.id='modular-root';}}
 }
 function destroy(){try{cleanup?.destroy?.();if(typeof cleanup==='function')cleanup();}finally{root.replaceChildren();}}
 return Object.freeze({name:'maps',version:'canonical-v1',mount,destroy});
}
