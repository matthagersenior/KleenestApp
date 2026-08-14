/* Kleenest extracted views — Pass 9 */
(function(){
  'use strict';

  const api = window.KleenestExtractedViews = window.KleenestExtractedViews || {};

  // Extracted view implementations are installed by the Pass 9 refactor build.
  // Compatibility exports preserve the existing global function names used by
  // index.html while allowing the monolith implementations to live here.

  api.install = function install(exports) {
    if (!exports) return;
    Object.keys(exports).forEach(function(key){
      api[key] = exports[key];
      window[key] = exports[key];
    });
  };
})();
