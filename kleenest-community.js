/* Modular Community surface: combines social activity and gamification without monolith state. */
(function(){'use strict';
 const K=window.KleenestCommunity=window.KleenestCommunity||{};
 const rpc=async(name,args={})=>{const api=window.KleenestSupabase;if(!api||typeof api.rpc!=='function')throw new Error('Supabase community boundary unavailable');return api.rpc(name,args)};
 K.getFeed=(limit=50,cursor=null)=>rpc('get_community_feed',{p_limit:limit,p_cursor:cursor});
 K.getTrending=(limit=25)=>rpc('get_community_trending',{p_limit:limit});
 K.getLeaderboard=(scope='global',limit=50)=>window.KleenestGamification?.getLeaderboard(scope,limit)||rpc('get_gamification_leaderboard',{p_scope:scope,p_limit:limit});
 K.getContests=(status='active')=>window.KleenestGamification?.getContests(status)||rpc('get_contests',{p_status:status});
 K.getProfileSummary=userId=>rpc('get_community_profile_summary',{p_user_id:userId});
 K.getHomeSummary=async()=>{const [feed,trending,leaderboard,contests]=await Promise.all([K.getFeed(20),K.getTrending(10),K.getLeaderboard('global',10),K.getContests('active')]);return {feed,trending,leaderboard,contests}};
 K.renderCollection=(root,items,renderer)=>{if(!root)return;root.replaceChildren(...(items||[]).map(renderer));};
 K.bind=(root=document)=>{root.addEventListener('click',async e=>{const el=e.target.closest('[data-community-action]');if(!el)return;try{let result;if(el.dataset.communityAction==='refresh')result=await K.getHomeSummary();if(el.dataset.communityAction==='feed')result=await K.getFeed(Number(el.dataset.limit||20));el.dispatchEvent(new CustomEvent('kleenest:community-result',{detail:{action:el.dataset.communityAction,result},bubbles:true}))}catch(error){el.dispatchEvent(new CustomEvent('kleenest:community-error',{detail:{action:el.dataset.communityAction,error},bubbles:true}))}})};
 K.bind();
})();
