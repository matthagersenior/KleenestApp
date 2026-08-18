/* Canonical Home Tab Core — the sole Home surface owner. */
export function createHomeCore({root,user=null}={}){
 if(!root)throw new Error('Home Core requires a mount root.');
 async function mount(){
  /* The modular shell is the sole page owner. The legacy preloaded home bridge may
     expose the richer Home surface as KleenestHomeV3; use it here so the shell,
     tab registry and Home cannot render competing pages. */
  const rich=window.KleenestHomeV3;
  const core=window.KleenestHomeCoreV1;
  if(rich?.render)return rich.render(root,user);
  if(core?.render)return core.render(root,user);
  throw new Error('Canonical Home implementation unavailable.');
 }
 function destroy(){root.replaceChildren();}
 return Object.freeze({name:'home',version:'canonical-v2-rich',mount,destroy});
}