/* Kleenest shared event/error boundary. */
(function(){'use strict';
  const api=window.KleenestEvents=window.KleenestEvents||{};
  const PREFIX='kleenest:';
  function emit(name,detail){const eventName=name.indexOf(PREFIX)===0?name:PREFIX+name;window.dispatchEvent(new CustomEvent(eventName,{detail:detail||{}}));return eventName;}
  function normalize(error){if(error instanceof Error)return {name:error.name,message:error.message,stack:error.stack};return {name:'Error',message:String(error??'Unknown error')};}
  function report(source,error,extra){const detail=Object.assign({source,error:normalize(error),timestamp:Date.now()},extra||{});emit('error',detail);return detail;}
  function on(name,handler){window.addEventListener(name.indexOf(PREFIX)===0?name:PREFIX+name,handler);return()=>window.removeEventListener(name.indexOf(PREFIX)===0?name:PREFIX+name,handler);}
  api.emit=emit;api.report=report;api.on=on;
  window.KleenestUI=window.KleenestUI||{};window.KleenestUI.emit=emit;window.KleenestUI.reportError=report;
  window.addEventListener('unhandledrejection',e=>report('unhandledrejection',e.reason));
  window.addEventListener('error',e=>report('window-error',e.error||e.message,{filename:e.filename||'',line:e.lineno||0,column:e.colno||0}));
})();