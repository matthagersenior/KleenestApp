/* P1 location intelligence: trust score, health and accessibility presentation. */
(function(g){'use strict';if(g.__KLEENEST_LOCATION_INTELLIGENCE_V1__)return;g.__KLEENEST_LOCATION_INTELLIGENCE_V1__=true;
const client=()=>g.KleenestSupabase?.getClient?.()||g.KleenestSupabase?.client||g.supabaseClient||null;
const uuid=v=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||''));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const scoreLabel=s=>s>=85?'Trusted':s>=65?'High confidence':s>=40?'Moderate':'Needs verification';
async function confidence(id){const c=client();if(!c||!uuid(id))return null;const q=await c.rpc('kleenest_location_confidence',{p_location_id:id});if(q.error)throw q.error;return Array.isArray(q.data)?q.data[0]:q.data}
async function decorate(root){if(!root)return;const results=[...root.querySelectorAll('.km-result[data-id]')];for(const el of results){const id=el.dataset.id;if(!uuid(id)||el.querySelector('[data-kli]'))continue;try{const x=await confidence(id);if(!x)continue;const score=Number(x.score||0);const badge=document.createElement('span');badge.dataset.kli='';badge.className='km-badge';badge.textContent=`${score}/100 ${scoreLabel(score)}`;el.appendChild(badge);el.setAttribute('data-confidence-level',String(x.level||'unknown'));}catch(e){console.warn('[Kleenest Location Intelligence]',e)}}}
function style(){if(document.getElementById('kli-v1'))return;const s=document.createElement('style');s.id='kli-v1';s.textContent='.kli-panel{margin-top:8px;border:1px solid #d9e6df;border-radius:12px;background:#f7faf8;padding:10px;font-size:.84rem}.kli-title{font-weight:900;color:#173f32}.kli-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:7px}.kli-item{background:#fff;border-radius:9px;padding:8px}.kli-muted{color:#66766f;font-size:.76rem}';document.head.appendChild(s)}
function attach(root){style();decorate(root);const obs=new MutationObserver(()=>decorate(root));obs.observe(root,{childList:true,subtree:true});return()=>obs.disconnect()}
g.KleenestLocationIntelligenceV1={confidence,attach,scoreLabel};
})(window);
