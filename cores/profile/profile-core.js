/* Canonical Profile Tab Core — the sole Profile surface owner. */
export function createProfileCore({root,user=null}={}){
 if(!root)throw new Error('Profile Core requires a mount root.');
 async function mount(){const core=window.KleenestCanonicalProfileCoreV2||window.KleenestProfileCoreV2;if(!core?.render)throw new Error('Canonical Profile implementation unavailable.');await core.render(root,user);if(window.KleenestProfileConnectedAccountsV1)await window.KleenestProfileConnectedAccountsV1.enhance?.(root);}
 function destroy(){root.replaceChildren();}
 return Object.freeze({name:'profile',version:'canonical-v1',mount,destroy});
}
