/* Canonical Home Tab Core — the sole Home surface owner. */
export function createHomeCore({root,user=null}={}){
 if(!root)throw new Error('Home Core requires a mount root.');
 async function mount(){
  if(root.__kleenestHomeOwner){root.__kleenestHomeOwner.destroy?.();root.replaceChildren();}
  root.__kleenestHomeOwner={destroy(){}};
  const rich=window.KleenestHomeV3;
  if(!rich?.render)throw new Error('Canonical rich Home implementation unavailable.');
  await rich.render(root,user);
  const owner=root.__kleenestHomeOwner;
  owner.destroy=function(){
   if(root.__kleenestHomeOwner===owner){root.replaceChildren();delete root.__kleenestHomeOwner;}
  };
  return owner;
 }
 function destroy(){
  if(root.__kleenestHomeOwner?.destroy)root.__kleenestHomeOwner.destroy();
  else root.replaceChildren();
 }
 return Object.freeze({name:'home',version:'canonical-v3-sole-owner',mount,destroy});
}