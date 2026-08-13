/* Kleenest monolith audit and migration boundary. */
(function(){'use strict';
  const api=window.KleenestMonolithAudit=window.KleenestMonolithAudit||{};
  const checks=[
    {name:'auth',replacement:'KleenestAuth',legacy:['currentUser','[data-do-login]','[data-do-signup]','[data-do-biz-signup]','[data-logout]']},
    {name:'location',replacement:'KleenestLocation',legacy:['navigator.geolocation']},
    {name:'consumer-actions',replacement:'KleenestActionDispatcher',legacy:['KleenestActions.']},
    {name:'business-actions',replacement:'KleenestBusinessActionDispatcher',legacy:['KleenestBusinessActions.run']},
    {name:'events',replacement:'KleenestEvents',legacy:['kleenest:action-error']}
  ];
  function scan(){
    const scripts=[...document.scripts].map(s=>s.textContent||'').filter(Boolean).join('\n');
    const result=checks.map(check=>({name:check.name,replacement:check.replacement,legacyDetected:check.legacy.some(token=>scripts.includes(token))}));
    const detail={checkedAt:new Date().toISOString(),result};
    api.last=detail;
    window.KleenestEvents?.emit?.('monolith-audit-complete',detail)||window.dispatchEvent(new CustomEvent('kleenest:monolith-audit-complete',{detail}));
    return detail;
  }
  api.scan=scan;api.checks=checks;
  window.KleenestUI=window.KleenestUI||{};window.KleenestUI.auditMonolith=scan;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scan());else scan();
})();