/* Modular game loop: daily quests, challenge goals and reusable point-bearing actions. */
(function(){'use strict';
 const G=window.KleenestGame=window.KleenestGame||{};
 G.QUESTS=Object.freeze([
  {id:'daily-discover',title:'Clean Explorer',description:'Visit a clean place today.',activity:'check_in',goal:1,reward:10},
  {id:'daily-review',title:'Community Voice',description:'Leave a helpful review.',activity:'review',goal:1,reward:25},
  {id:'daily-help',title:'Community Helper',description:'Contribute a helpful community action.',activity:'community_helpful',goal:1,reward:15},
  {id:'weekly-route',title:'Route Runner',description:'Complete a multi-stop route.',activity:'route_complete',goal:1,reward:50},
  {id:'weekly-social',title:'Community Connector',description:'Follow someone new or engage with a review.',activity:'follow',goal:1,reward:1}
 ]);
 G.getState=async()=>{const [summary,contests,leaderboard]=await Promise.all([window.KleenestGamification.getSummary(),window.KleenestGamification.getContests('active'),window.KleenestGamification.getLeaderboard('global',10)]);const history=summary?.history||[];const count=a=>history.filter(x=>String(x.activity_type||x.reason||'')===a).length;return {summary,contests,leaderboard,quests:G.QUESTS.map(q=>({...q,progress:Math.min(q.goal,count(q.activity)),complete:count(q.activity)>=q.goal}))}};
 G.startQuest=async questId=>{const q=G.QUESTS.find(x=>x.id===questId);if(!q)throw new Error('Unknown quest.');return window.KleenestGamification.recordActivity(q.activity,{source:'quest',quest_id:q.id})};
 G.render=({root,state,context=''}={})=>{if(!root)return;const s=state||{};root.innerHTML=`<section class="kleenest-game-center" data-game-context="${context}"><header><h3>Play & Earn</h3><p>Daily quests, contests, points, badges and leaderboard progress.</p></header><div class="kleenest-game-grid">${(s.quests||[]).map(q=>`<article><h4>${q.title}</h4><p>${q.description}</p><strong>${q.progress}/${q.goal}</strong><small>${q.reward} pts</small></article>`).join('')}${(s.contests||[]).slice(0,3).map(c=>`<article><h4>${c.name||'Contest'}</h4><p>Compete for points, badges and leaderboard position.</p><button type="button" data-gamification-action="contest-join" data-contest-id="${c.id}">Join contest</button></article>`).join('')}</div></section>`;return state};
})();
