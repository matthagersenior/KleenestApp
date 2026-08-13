/* Business Preferred Analytics — compact live dashboard component. */
(function(){'use strict';
 async function render(container){
  if(!container||!window.kleenestBusinessAnalytics)return;
  container.textContent='Loading Preferred analytics…';
  try{
   const all=await window.kleenestBusinessAnalytics.current();
   const rows=(all||[]).flatMap(x=>Array.isArray(x?.locations)?x.locations:[]);
   const totals=(all||[]).reduce((a,x)=>{a.activations+=Number(x?.total_activations||0);a.uses+=Number(x?.total_uses||0);a.users+=Number(x?.unique_users||0);return a;},{activations:0,uses:0,users:0});
   container.innerHTML='<section class="business-analytics-panel"><h3>Preferred Analytics</h3><div class="business-analytics-totals" data-totals></div><div data-summary></div></section>';
   container.querySelector('[data-totals]').textContent=`Activations: ${totals.activations} · Uses: ${totals.uses} · Unique users: ${totals.users}`;
   const box=container.querySelector('[data-summary]');
   if(!rows.length){box.textContent='No Preferred activity yet.';return;}
   const table=document.createElement('table');table.innerHTML='<thead><tr><th>Location</th><th>Users</th><th>Uses</th></tr></thead><tbody></tbody>';
   const body=table.querySelector('tbody');rows.forEach(r=>{const tr=document.createElement('tr');tr.innerHTML='<td></td><td></td><td></td>';tr.cells[0].textContent=r.location_name||r.location_id||'Location';tr.cells[1].textContent=Number(r.unique_users||0);tr.cells[2].textContent=Number(r.uses||0);body.appendChild(tr);});box.appendChild(table);
  }catch(e){container.textContent='Unable to load Preferred analytics.';window.KleenestUI?.reportError?.('preferred-analytics',e);}
 }
 window.kleenestRenderBusinessAnalytics=render;
})();
