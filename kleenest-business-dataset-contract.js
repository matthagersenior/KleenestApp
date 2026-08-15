/* Dataset contract: prevents frontend fallbacks from presenting the wrong metric under a selected dataset. */
(function(){'use strict';
const C=window.KleenestBusinessDatasetContract={};
const A=window.kleenestBusinessAnalytics;
C.validate=function(key,data){const fields=A?.fields?.[key]||[];const d=data||{};return{key,missing:fields.filter(f=>d[f]===undefined),values:Object.fromEntries(fields.map(f=>[f,d[f]??null]))};};
C.render=function(key,data){const v=C.validate(key,data);return{key,complete:v.missing.length===0,missing:v.missing,values:v.values};};
})();