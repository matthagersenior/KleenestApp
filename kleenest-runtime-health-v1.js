/* Kleenest Runtime Health v1 — centralized startup diagnostics. */
(function(g){'use strict';
if(g.KleenestRuntimeHealthV1)return;
const state={shell:'pending',modules:{},services:{},errors:[]};
function set(type,name,status,detail){if(type==='module')state.modules[name]={status,detail};else if(type==='service')state.services[name]={status,detail};else state[type]=status;return state;}
function error(area,e){state.errors.push({area,message:String(e?.message||e||'Unknown error'),time:new Date().toISOString()});return state.errors.at(-1);}
function report(){return JSON.parse(JSON.stringify(state));}
g.KleenestRuntimeHealthV1={set,error,report,getState:()=>state};
})(window);
