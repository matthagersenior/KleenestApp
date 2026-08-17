/* Kleenest Auth compatibility facade.
 * Authentication authority lives in KleenestSupabase/KleenestRuntime.
 * This file preserves the legacy KleenestAuth namespace without owning auth state.
 */
(function(g){'use strict';
  function runtime(){
    if(g.KleenestRuntime)return g.KleenestRuntime;
    throw new Error('Kleenest authentication runtime is not ready.');
  }
  async function client(){
    if(!g.KleenestSupabase?.client)throw new Error('Authentication service is still loading. Please try again in a moment.');
    return g.KleenestSupabase.client();
  }
  g.KleenestAuth={
    client,
    signIn:(email,password)=>runtime().signIn(email,password),
    signUp:(email,password)=>runtime().signUp(email,password),
    oauth:async provider=>{
      const c=await client();
      const r=await c.auth.signInWithOAuth({provider,options:{redirectTo:location.origin+location.pathname}});
      if(r.error)throw r.error;
      return r.data;
    },
    signOut:()=>runtime().signOut()
  };
})(window);
