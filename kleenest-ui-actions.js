/* Shared Kleenest UI action compatibility adapter. */
(function(){'use strict';
  const api=window.KleenestUIActions=window.KleenestUIActions||{};
  api.run=async function(action,p){p=p||{};if(action==='signout')return window.KleenestAuth?.signOut?.()||window.KleenestRuntime?.signOut?.();if(!window.KleenestActionDispatcher?.dispatch)throw new Error('Unified action dispatcher is not ready.');return window.KleenestActionDispatcher.dispatch(action,p);};
  window.KleenestUI=window.KleenestUI||{};window.KleenestUI.run=api.run;
})();