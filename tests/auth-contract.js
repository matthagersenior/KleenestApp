/* Static contract checks for the Supabase auth boundary. */
'use strict';
const fs=require('fs');
const runtime=fs.readFileSync('kleenest-supabase-runtime.js','utf8');
const client=fs.readFileSync('kleenest-supabase.js','utf8');
const requiredRuntime=['KleenestRuntime.signIn','KleenestRuntime.signUp','KleenestRuntime.signOut','syncSession','onAuthStateChange'];
const requiredClient=['signInWithPassword','auth.signUp','auth.signOut','getSession','ensure_current_user_profile'];
for(const marker of requiredRuntime)if(!runtime.includes(marker))throw new Error(`Missing auth runtime contract: ${marker}`);
for(const marker of requiredClient)if(!client.includes(marker))throw new Error(`Missing Supabase client contract: ${marker}`);
if(/localStorage\.(setItem|removeItem).*?(token|session)/is.test(runtime))throw new Error('Runtime must not persist auth tokens through localStorage.');
if(/sessionStorage\.(setItem|removeItem).*?(token|session)/is.test(runtime))throw new Error('Runtime must not persist auth tokens through sessionStorage.');
console.log('Auth contract checks passed.');
