/* Benefit Swap bridge: a program may explicitly cover selected locations. */
(function(){'use strict';
 async function add(programId,locationId){return window.kleenestProgramScope.addLocation(programId,locationId);}
 async function remove(programId,locationId){return window.kleenestProgramScope.removeLocation(programId,locationId);}
 window.kleenestBenefitSwap={addLocation:add,removeLocation:remove};
})();
