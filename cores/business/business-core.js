/* Canonical Business Tab Core — the sole Business surface owner. */
export function createBusinessCore({root,user=null,supabase}={}){
 if(!root)throw new Error('Business Core requires a mount root.');
 async function mount(){if(!window.KleenestBusinessWorkspaceAdapterV1?.open)throw new Error('Canonical Business Workspace unavailable.');const value=window.KleenestBusinessValueCore?.createBusinessValueCore?window.KleenestBusinessValueCore.createBusinessValueCore({supabase,user}):null;return window.KleenestBusinessWorkspaceAdapterV1.open(root,{supabase,user,businessValue:value});}
 function destroy(){root.replaceChildren();}
 return Object.freeze({name:'business',version:'canonical-v1',mount,destroy});
}
