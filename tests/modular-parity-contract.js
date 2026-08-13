/* Static contract: the modular runtime must expose every migrated production workflow. */
'use strict';
const fs=require('fs');
const runtime=fs.readFileSync('kleenest-supabase-runtime.js','utf8');
const client=fs.readFileSync('kleenest-supabase.js','utf8');
const requiredRuntime=['KleenestRuntime.signIn','KleenestRuntime.signUp','KleenestRuntime.signOut','KleenestRuntime.verifyCheckin','KleenestRuntime.replyToReview','KleenestRuntime.redeemPromotion','KleenestRuntime.markNotificationRead','KleenestRuntime.preferredEligibility','KleenestRuntime.preferredActivate','KleenestRuntime.preferredUse','KleenestRuntime.syncSession'];
const requiredClient=['signInWithPassword','auth.signUp','auth.signOut','getSession','verify_checkin','reply_to_review','redeem_promotion','mark_notification_read'];
for(const marker of requiredRuntime)if(!runtime.includes(marker))throw new Error(`Missing modular workflow: ${marker}`);
for(const marker of requiredClient)if(!client.includes(marker))throw new Error(`Missing backend contract: ${marker}`);
const modules=['kleenest-auth-modal-touch-fix.js','kleenest-auth-legacy-guard.js','kleenest-session-bridge.js','kleenest-business-data.js','kleenest-business-analytics.js','kleenest-business-state.js','kleenest-partnership-ui.js','kleenest-auth-provision.js','kleenest-account-lifecycle.js','kleenest-account-ui.js','kleenest-runtime-health.js','kleenest-acceptance-checks.js','kleenest-gamification.js','kleenest-social.js','kleenest-community.js','kleenest-app-surfaces.js'];
for(const file of modules)if(!fs.existsSync(file))throw new Error(`Missing modular layer: ${file}`);
for(const surface of ['home','maps','details','profile','business','admin','community'])if(!fs.readFileSync('kleenest-app-surfaces.js','utf8').includes(`${surface}:`))throw new Error(`Missing app surface: ${surface}`);
console.log(`Modular parity contract passed: ${requiredRuntime.length} runtime workflows, ${requiredClient.length} backend contracts, ${modules.length} modular layers, 7 app surfaces.`);