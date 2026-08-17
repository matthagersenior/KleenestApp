/* Canonical Social Tab Core — the sole Social surface owner. */
export async function createSocialCore({root,user=null,supabase}={}){
 if(!root)throw new Error('Social Core requires a mount root.');
 const mods=await Promise.all([import('./social-core-v2.js?canonical-tab=15'),import('../media/kleenest-media-core.js?canonical-tab=15')]);
 const media=mods[1].createMediaCore({supabase});
 const implementation=mods[0].createSocialCore({supabase,mediaCore:media,root,user});
 async function mount(){return implementation.render();}
 function destroy(){implementation.destroy?.();root.replaceChildren();}
 return Object.freeze({name:'social',version:'canonical-v1',mount,destroy,implementation});
}
