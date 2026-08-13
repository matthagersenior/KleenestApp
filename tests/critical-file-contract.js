/* Fail fast when a critical modular layer disappears or becomes empty. */
'use strict';
const fs=require('fs');
const files=[
 'kleenest-supabase.js','kleenest-supabase-runtime.js','kleenest-session-bridge.js',
 'kleenest-auth-provision.js','kleenest-business-data.js','kleenest-business-state.js',
 'kleenest-business-analytics.js','kleenest-partnership-ui.js','kleenest-account-lifecycle.js',
 'kleenest-account-ui.js','kleenest-runtime-health.js','kleenest-acceptance-checks.js',
 'kleenest-auth-legacy-guard.js','kleenest-auth-modal-touch-fix.js'
];
for(const f of files){const s=fs.statSync(f);if(s.size<200)throw new Error(`Critical modular layer unexpectedly small: ${f} (${s.size} bytes)`);}
console.log(`Critical-file contract passed: ${files.length} modular layers present.`);
