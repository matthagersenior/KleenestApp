/* Canonical Home Tab Core — the sole Home surface owner. */
export function createHomeCore({root,user=null}={}){
 if(!root)throw new Error('Home Core requires a mount root.');
 async function mount(){const core=window.KleenestHomeCoreV1;if(!core?.render)throw new Error('Canonical Home implementation unavailable.');return core.render(root,user);}
 function destroy(){root.replaceChildren();}
 return Object.freeze({name:'home',version:'canonical-v1',mount,destroy});
}
