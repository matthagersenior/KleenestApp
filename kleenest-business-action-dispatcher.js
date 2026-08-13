/* Kleenest business action dispatcher. */
(function(){'use strict';
  const api=window.KleenestBusinessActionDispatcher=window.KleenestBusinessActionDispatcher||{};
  function normalize(action,payload){if(typeof action==='string')return {action,payload:payload||{}};const el=action;return {action:el?.dataset?.kleenestBusinessAction||el?.dataset?.kleenestAction||'',payload:Object.assign({},el?.dataset||{},payload||{})};}
  async function dispatch(action,payload){const item=normalize(action,payload);if(!item.action)throw new Error('Business action is required.');if(!window.KleenestBusinessActions?.run)throw new Error('Business action layer is not ready.');try{const result=await window.KleenestBusinessActions.run(item.action,item.payload);window.KleenestEvents?.emit?.('business-action-complete',{action:item.action,result});return result;}catch(error){window.KleenestEvents?.report?.('business-action-dispatch',error,{action:item.action});throw error;}}
  api.dispatch=dispatch;
  window.KleenestUI=window.KleenestUI||{};window.KleenestUI.runBusinessAction=dispatch;
})();