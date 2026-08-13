/* Business Preferred Analytics — lightweight dashboard component. */
(function(){'use strict';
 async function render(container){
  if(!container||!window.kleenestBusinessAnalytics)return;
  container.textContent='Loading Preferred Location analytics…';
  try{
   const rows=await window.kleenestBusinessAnalytics.preferredSummary();
   container.innerHTML='<section class="business-analytics-panel"><h3>Preferred Location Analytics</h3><div data-summary></div></section>';
   const box=container.querySelector('[data-summary]');
   if(!rows.length){box.textContent='No Preferred Location activity yet.';return;}
   const table=document.createElement('table');
   table.innerHTML='<thead><tr><th>Location</th><th>Unique users</th><th>Uses</th></tr></thead><tbody></tbody>';
   const body=table.querySelector('tbody');
   rows.forEach(r=>{const tr=document.createElement('tr');tr.innerHTML='<td></td><td></td><td></td>';tr.cells[0].textContent=r.location_name||r.location_id||'Location';tr.cells[1].textContent=Number(r.unique_users||0);tr.cells[2].textContent=Number(r.uses||0);body.appendChild(tr);});
   box.appendChild(table);
  }catch(e){container.textContent='Unable to load Preferred Location analytics.';console.warn('[Kleenest]',e);}
 }
 window.kleenestRenderBusinessAnalytics=render;
})();
