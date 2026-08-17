/* Kleenest deterministic startup loader v1. */
(function(g){'use strict';
  var root=function(){return document.getElementById('modular-root')};
  var status=function(){return document.getElementById('boot-status')};
  var done=false;
  function fail(e){if(done)return;var s=status();if(s)s.textContent='Kleenest could not start: '+String(e&&e.message||e||'application shell unavailable');console.error('[Kleenest startup]',e)}
  function start(){
    if(done)return;
    var existing=g.KleenestModularShellV2;
    if(existing&&typeof existing.render==='function'){done=true;existing.render().catch(fail);return}
    var script=document.createElement('script');
    script.src='kleenest-modular-shell-v2.js?startup=81';
    script.async=false;
    script.onload=function(){
      var shell=g.KleenestModularShellV2;
      if(!shell||typeof shell.render!=='function'){fail(new Error('Canonical application shell loaded but did not register.'));return}
      done=true;
      Promise.resolve(shell.render()).catch(fail);
    };
    script.onerror=function(){fail(new Error('Canonical application shell could not be loaded.'))};
    document.head.appendChild(script);
    setTimeout(function(){if(!done&&!g.KleenestModularShellV2)fail(new Error('Application shell timed out after 10 seconds.'))},10000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(window);