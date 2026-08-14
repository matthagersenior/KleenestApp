/* Static contract checks for the complete Supabase auth/signup boundary. */
'use strict';
const fs=require('fs');
const runtime=fs.readFileSync('kleenest-supabase-runtime.js','utf8');
const client=fs.readFileSync('kleenest-supabase.js','utf8');
const signup=fs.readFileSync('kleenest-auth-signup-controller.js','utf8');
const demo=fs.readFileSync('kleenest-demo-auth-bootstrap.js','utf8');
const requiredRuntime=['KleenestRuntime.signIn','KleenestRuntime.signUp','KleenestRuntime.signOut','syncSession','onAuthStateChange','completePendingBusinessSignup','completeSignup','data-do-signup','data-do-biz-signup'];
const requiredClient=['signInWithPassword','auth.signUp','auth.signOut','getSession','ensure_current_user_profile','createBusiness'];
for(const marker of requiredRuntime)if(!runtime.includes(marker))throw new Error(`Missing auth runtime contract: ${marker}`);
for(const marker of requiredClient)if(!client.includes(marker))throw new Error(`Missing Supabase client contract: ${marker}`);
for(const marker of ['A.validate','A.submit','A.inFlight','signup-success','signup-error'])if(!signup.includes(marker))throw new Error(`Missing canonical signup contract: ${marker}`);
for(const marker of ['auth.signUp','signInWithPassword','demo_register_identity','demo_link_identity'])if(!demo.includes(marker))throw new Error(`Missing demo-auth contract: ${marker}`);
if(!runtime.includes('business_signup_pending'))throw new Error('Business signup must survive email confirmation.');
if(!runtime.includes('business_address')||!runtime.includes('business_place_type'))throw new Error('Business signup metadata is incomplete.');
if(!client.includes('create_business_for_current_user'))throw new Error('Business provisioning RPC missing from client boundary.');
if(/localStorage\.(setItem|removeItem).*?(token|session)/is.test(runtime))throw new Error('Runtime must not persist auth tokens through localStorage.');
if(/sessionStorage\.(setItem|removeItem).*?(token|session)/is.test(runtime))throw new Error('Runtime must not persist auth tokens through sessionStorage.');
console.log('Auth/signup contract checks passed: consumer, business, confirmation recovery, and demo flows.');
