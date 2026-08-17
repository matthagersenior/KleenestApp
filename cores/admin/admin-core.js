/* Canonical Admin Tab Core — the sole Admin surface owner. */
export function createAdminCore({root,user=null}={}){
 if(!root)throw new Error('Admin Core requires a mount root.');
 async function mount(){if(!window.KleenestAdminCanonicalRuntimeV3?.render)throw new Error('Canonical Admin implementation unavailable.');return window.KleenestAdminCanonicalRuntimeV3.render(root,user);}
 function destroy(){root.replaceChildren();}
 return Object.freeze({name:'admin',version:'canonical-v1',mount,destroy});
}
