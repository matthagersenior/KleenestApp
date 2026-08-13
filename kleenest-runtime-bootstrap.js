/* Kleenest runtime bootstrap. Loads optional modules without requiring any one feature to exist. */
(function(){'use strict';
 const modules=['kleenest-auth-modal-touch-fix.js','kleenest-partner-access.js','kleenest-preferred-visit.js','kleenest-visit-tracking.js','kleenest-business-analytics.js','kleenest-business-analytics-panel.js','kleenest-partner-program-admin.js','kleenest-business-program-panel.js','kleenest-preferred-history.js','kleenest-benefit-center.js','kleenest-program-scope.js','kleenest-benefit-swap.js','kleenest-fleet-enterprise.js','kleenest-program-scope-panel.js','kleenest-enrollment.js','kleenest-acceptance-checks.js','kleenest-production-checklist.js'];
 window.kleenestRuntime={modules,loaded:[]};
 function load(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=()=>{window.kleenestRuntime.loaded.push(src);resolve();};s.onerror=()=>reject(new Error('Failed to load '+src));document.head.appendChild(s);});}
 window.kleenestRuntime.ready=modules.reduce((p,m)=>p.then(()=>load(m)).catch(e=>{console.warn('[Kleenest runtime]',e.message);return loadNext();}),Promise.resolve());
 function loadNext(){return Promise.resolve();}
})();
