/* Kleenest Auth Bridge v1 — resilient auth entry point for the modular app. */
(function(g){'use strict';
  const WAIT=7000;
  function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
  async function client(){const end=Date.now()+WAIT;while(Date.now()<end){try{if(g.KleenestSupabase?.client)return g.KleenestSupabase.client();}catch(e){}await sleep(150);}throw new Error('Authentication service is still loading. Please try again in a moment.');}
  async function signIn(email,password){if(!email||!password)throw new Error('Enter your email and password.');const c=await client();const r=await c.auth.signInWithPassword({email:String(email).trim(),password:String(password)});if(r.error)throw r.error;await g.KleenestRuntime?.syncSession?.();return r.data;}
  async function signUp(email,password){if(!email||!password)throw new Error('Enter an email and password.');if(String(password).length<8)throw new Error('Password must be at least 8 characters.');const c=await client();const r=await c.auth.signUp({email:String(email).trim(),password:String(password),options:{emailRedirectTo:location.origin+location.pathname}});if(r.error)throw r.error;return r.data;}
  async function oauth(provider){const c=await client();const r=await c.auth.signInWithOAuth({provider,options:{redirectTo:location.origin+location.pathname}});if(r.error)throw r.error;return r.data;}
  async function signOut(){const c=await client();const r=await c.auth.signOut();if(r.error)throw r.error;location.reload();}
  g.KleenestAuth={client,signIn,signUp,oauth,signOut};
})(window);