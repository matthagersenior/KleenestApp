/* Explicit demo configuration. Values are supplied by the app/test harness; no production IDs are hardcoded. */
(function(){'use strict';
 window.kleenestDemoSeedConfig={
  tiers:['premium','fleet','enterprise'],
  scenarios:[
   {name:'valid partnership',expected:true},
   {name:'no partnership',expected:false},
   {name:'wrong location',expected:false},
   {name:'revoked membership',expected:false},
   {name:'revoked location',expected:false},
   {name:'inactive agreement',expected:false},
   {name:'disabled program',expected:false}
  ]
 };
})();
