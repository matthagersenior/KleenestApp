/* Prevent the modular runtime from accidentally depending on legacy globals. */
'use strict';
const fs=require('fs');
const runtime=fs.readFileSync('kleenest-supabase-runtime.js','utf8');
const guard=fs.readFileSync('kleenest-auth-legacy-guard.js','utf8');
if(/\b(localStorage|sessionStorage)\.(setItem|getItem|removeItem)\(/.test(runtime))throw new Error('Modular runtime must not own browser auth persistence.');
if(!guard.includes('kleenestLegacyAuthGuard'))throw new Error('Legacy boundary guard missing.');
if(!guard.includes('supabaseReady'))throw new Error('Legacy guard must activate only when modular Supabase runtime is ready.');
console.log('Legacy production boundary checks passed.');
