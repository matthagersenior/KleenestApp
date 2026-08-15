/* Pages recovery shell. Last-resort UI only; preserves the modular app when one optional module fails. */
(function(){'use strict';
  function boot(){
    var root=document.getElementById('modular-root');
    if(!root)return;
    if(root.children.length && root.querySelector('nav'))return;
    var existing=window.KleenestModular;
    if(existing&&typeof existing.render==='function')return;
    var views={Home:'home',Maps:'maps',Route:'route',Details:'details',Social:'social',Profile:'profile'};
    function call(name){try{if(typeof window[name]==='function'){window[name]();return true}}catch(e){console.error('[Kleenest recovery]',name,e)}return false}
    function render(view){
      var key=views[view]||'home';
      if(!call(key)){
        root.innerHTML='<div class="card" style="margin:16px"><h2>Kleenest</h2><p class="muted">The app is recovering from a startup module error.</p><p class="muted">Use Profile to continue to account access.</p></div>';
      }
      var nav=root.querySelector('nav');if(nav)nav.querySelectorAll('button').forEach(function(b){b.classList.toggle('active',b.dataset.recoveryNav===view)})
    }
    window.KleenestPagesRecovery={render:render};
    if(!root.querySelector('nav')){
      root.innerHTML='<header><strong>Kleenest</strong><nav aria-label="Primary navigation">'+Object.keys(views).map(function(v){return '<button type="button" data-recovery-nav="'+v+'">'+v+'</button>'}).join('')+'</nav></header><main id="kleenest-recovery-main"><div class="card"><h2>Loading Kleenest…</h2><p class="muted">Recovering the modular app.</p></div></main>';
      root.querySelectorAll('[data-recovery-nav]').forEach(function(b){b.addEventListener('click',function(){render(b.dataset.recoveryNav)})});
    }
    render('Home');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  setTimeout(boot,500);setTimeout(boot,1500);
})();
