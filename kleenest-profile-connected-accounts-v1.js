/* Profile connected accounts enhancer — Supabase Auth is authoritative for Google, Apple, X and Facebook. */
(function(g){'use strict';if(g.KleenestProfileConnectedAccountsV1)return;
async function enhance(root){
 const s=g.KleenestSupabaseClient||(g.KleenestSupabase&&g.KleenestSupabase.client&&g.KleenestSupabase.client());if(!s?.auth||!root)return;
 const userResult=await s.auth.getUser().catch(()=>({data:{user:null}}));const user=userResult.data?.user||null;
 const card=[...root.querySelectorAll('.pf2-card')].find(x=>/CONNECTED ACCOUNTS/i.test(x.textContent||''));if(!card)return;
 const ids=user?.identities||[];const providers=new Set(ids.map(x=>String(x.provider||'').toLowerCase()));
 const map=[['Google','google'],['Apple','apple'],['X','twitter'],['Facebook','facebook']];
 const status=document.createElement('div');status.className='pf2-connected-status';status.style.cssText='display:grid;gap:8px;margin-top:12px';
 const buttons=[...card.querySelectorAll('[data-a^="oauth-"]')];
 function render(){status.innerHTML=map.map(([label,key])=>'<div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><span>'+label+'</span><strong style="font-size:.8rem;color:'+(providers.has(key)?'#0e7c6b':'#6b7974')+'">'+(providers.has(key)?'Connected':'Not connected')+'</strong></div>').join('');buttons.forEach(b=>{const key=b.dataset.a.slice(6);b.textContent=providers.has(key)?'Connected':'Connect '+({google:'Google',apple:'Apple',twitter:'X',facebook:'Facebook'}[key]||key);b.disabled=providers.has(key);});}
 async function connect(provider,button){button.disabled=true;button.textContent='Connecting…';try{
   if(!user){const r=await s.auth.signInWithOAuth({provider,options:{redirectTo:location.origin+location.pathname}});if(r.error)throw r.error;return;}
   if(typeof s.auth.linkIdentity==='function'){const r=await s.auth.linkIdentity({provider,options:{redirectTo:location.origin+location.pathname}});if(r.error)throw r.error;return;}
   const r=await s.auth.signInWithOAuth({provider,options:{redirectTo:location.origin+location.pathname}});if(r.error)throw r.error;
 }catch(e){button.disabled=false;button.textContent='Connect '+({google:'Google',apple:'Apple',twitter:'X',facebook:'Facebook'}[provider]||provider);let msg=card.querySelector('.pf2-connected-error');if(!msg){msg=document.createElement('div');msg.className='pf2-connected-error';msg.style.cssText='margin-top:8px;color:#9b3030;font-weight:700';card.append(msg)}msg.textContent=e?.message||'Unable to connect account.';}}
 buttons.forEach(b=>{const provider=b.dataset.a.slice(6);b.onclick=()=>connect(provider,b)});render();card.append(status);
}
g.KleenestProfileConnectedAccountsV1={enhance:enhance}})(window);