/* Home Runtime Guard v2 — preserves canonical rich Home and wires Check In to the real QR scanner. */
(function(g){'use strict';
 if(!g.KleenestHomeCoreV1||typeof g.KleenestHomeCoreV1.render!=='function'||g.__KLEENEST_HOME_GUARD_V2__)return;
 g.__KLEENEST_HOME_GUARD_V2__=true;
 var original=g.KleenestHomeCoreV1.render;
 var games=[['🃏','Kleenest Cards'],['🧠','Memory Match'],['⚡','Clean Dash'],['🔎','Spot It'],['🧩','Sort It'],['🏃','Kleenest Runner'],['🎯','Location Rush'],['👥','Community Battle']];
 function wire(root){
   if(!root)return;
   var actions=root.querySelectorAll('.hc-actions .hc-action');
   actions.forEach(function(b){
     var text=(b.textContent||'').toLowerCase();
     if(text.indexOf('check in')!==-1){
       b.setAttribute('data-home-qr-checkin','1');
       b.onclick=function(e){e.preventDefault();e.stopPropagation();if(g.KleenestQR&&typeof g.KleenestQR.scan==='function'){g.KleenestQR.scan();return;}alert('QR scanner is still loading. Please try again in a moment.');};
     }
   });
 }
 function fallback(root){
   root.innerHTML='<div class="home-core"><section class="hc-hero"><div><div class="hc-kicker">YOUR KLEENEST HOME</div><h1>Find. Contribute.<br><span>Play. Earn.</span></h1><p>Everything starts here — discover clean restrooms, check in, verify places, plan routes, connect with the community and keep your progression moving.</p></div><div class="hc-progress"><div class="hc-kicker">YOUR PROGRESS</div><strong>Level 1 · 0 XP</strong><div class="hc-bar"><i style="width:0%"></i></div><small>🔥 Start your streak</small></div></section><section class="hc-section"><div class="hc-head"><div><div class="hc-kicker">QUICK ACTIONS</div><h2>What do you need?</h2></div></div><div class="hc-actions"><button class="hc-action" data-home-action="maps"><span class="hc-icon">🗺️</span><b>Find a restroom</b><small>Open live map discovery and nearby locations.</small></button><button class="hc-action" data-home-action="maps" data-home-qr-checkin="1"><span class="hc-icon">📷</span><b>Scan QR to check in</b><small>Open the QR scanner and scan a Kleenest location code.</small></button><button class="hc-action" data-home-action="maps"><span class="hc-icon">📍</span><b>Nearby check-in</b><small>Use your location to check in only when you're inside the permitted geofence.</small></button><button class="hc-action" data-home-action="social"><span class="hc-icon">👥</span><b>Join the community</b><small>Posts, challenges, likes, follows and community activity.</small></button></div></section><section class="hc-section"><div class="hc-head"><div><div class="hc-kicker">QUICK PLAY</div><h2>Pick a game</h2></div><span class="hc-empty">8 games available</span></div><div class="hc-games">'+games.map(function(v,i){return '<button class="hc-game" data-game="'+['cards','match','dash','spot','sort','runner','rush','battle'][i]+'"><span class="hc-icon">'+v[0]+'</span><span class="hc-copy"><b>'+v[1]+'</b><small>Play and build your progression</small><em>Earn XP · compete · improve</em></span><span class="hc-arrow">›</span></button>}).join('')+'</div></section><section class="hc-section"><div class="hc-competition"><article class="hc-card gold"><div class="hc-kicker">CHALLENGES & CONTESTS</div><h3>Something to win</h3><p class="hc-empty">Live challenges and contests will appear here.</p></article><article class="hc-card"><div class="hc-kicker">USER LEADERS</div><h3>Top players</h3><p class="hc-empty">Start playing to populate the leaderboard.</p></article><article class="hc-card"><div class="hc-kicker">BUSINESS WINNERS</div><h3>Worth discovering</h3><p class="hc-empty">Business winners will appear as activity grows.</p></article></div></section><section class="hc-section"><div class="hc-collection"><div><div class="hc-kicker">YOUR COLLECTION</div><h2>Badges, rewards, streaks & activity</h2><p class="hc-empty">Check-ins, verifications, reviews, favorites, routes, games and social contributions all feed the progression system.</p></div><button class="hc-button" data-home-action="profile">View progression</button></div></section></div>';
   root.querySelectorAll('[data-game]').forEach(function(b){b.onclick=function(){if(g.KleenestGameEngine&&g.KleenestGameEngine.startGame)g.KleenestGameEngine.startGame(b.dataset.game)}});
   root.querySelectorAll('[data-home-action]').forEach(function(b){b.onclick=function(){var v=b.dataset.homeAction==='profile'?'Profile':b.dataset.homeAction==='social'?'Social':'Maps';if(g.KleenestAppShell&&g.KleenestAppShell.navigate)g.KleenestAppShell.navigate(v)}});
   wire(root);
 }
 g.KleenestHomeCoreV1.render=function(root,user){
   var finished=false;
   var timer=setTimeout(function(){if(finished||!root)return;if(root.querySelector('.hc-hero'))return;fallback(root)},2500);
   return Promise.resolve(original(root,user)).then(function(v){finished=true;clearTimeout(timer);wire(root);return v},function(e){finished=true;clearTimeout(timer);fallback(root);console.warn('[Kleenest Home] canonical data load failed; rich fallback rendered',e);return undefined});
 };
})(window);