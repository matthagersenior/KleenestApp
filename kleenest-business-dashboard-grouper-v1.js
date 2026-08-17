/* Business dashboard grouper v2 — canonical Control Center presentation bridge. */
(function(g){'use strict';if(g.KleenestBusinessDashboardGrouperV1)return;
async function load(){if(g.KleenestBusinessControlCenterV1)return;await new Promise(resolve=>{const s=document.createElement('script');s.src='kleenest-business-control-center-v1.js?business=control-center-v1';s.onload=resolve;s.onerror=resolve;document.head.appendChild(s)})}
async function enhance(root){if(!root)return()=>{};await load();return g.KleenestBusinessControlCenterV1?.enhance?.(root)||(()=>{})}
g.KleenestBusinessDashboardGrouperV1={enhance};})(window);