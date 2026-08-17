/* Canonical Maps Tab Core — one tab-level owner. Supporting Maps modules remain internal dependencies. */
export async function createMapsCore({root,user=null,supabase}={}){
 if(!root)throw new Error('Maps Core requires a mount root.');
 async function mount(){
  if(!window.KleenestMapsSafeRuntimeV1?.render)throw new Error('Canonical Maps implementation unavailable.');
  return window.KleenestMapsSafeRuntimeV1.render(root,{user,supabase});
 }
 function destroy(){root.replaceChildren();}
 return Object.freeze({name:'maps',version:'canonical-v1',mount,destroy});
}
