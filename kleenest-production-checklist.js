/* Production acceptance checklist. Diagnostics only; no destructive actions. */
(function(){'use strict';
 window.kleenestProductionChecklist=function(){
  const d=window.kleenestAcceptance?.dependencies?.()||{};
  return {core:d.supabase===true,preferred:d.preferredAccess===true&&d.preferredVisit===true,visits:d.visitTracking===true,analytics:d.businessAnalytics===true,programs:d.partnerPrograms===true,scope:!!window.kleenestProgramScope,enrollment:!!window.kleenestEnrollment};
 };
})();
