/* Node smoke checks for critical runtime contracts. No browser/network dependency. */
'use strict';
const fs=require('fs');
const required=['index.html','kleenest-supabase.js','kleenest-supabase-runtime.js','kleenest-auth-legacy-guard.js','kleenest-session-bridge.js','kleenest-account-lifecycle.js','kleenest-runtime-health.js','manifest.webmanifest','sw.js','capacitor.config.ts','privacy.html','terms.html','support.html'];
for(const file of required){if(!fs.existsSync(file))throw new Error(`Missing required runtime asset: ${file}`);}
const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
for(const key of ['name','short_name','start_url','scope','display'])if(!manifest[key])throw new Error(`Manifest missing ${key}`);
const index=fs.readFileSync('index.html','utf8');
for(const marker of ['kleenest-supabase-runtime.js','kleenest-auth-legacy-guard.js'])if(!index.includes(marker))console.warn(`Runtime marker not directly present in index: ${marker}`);
console.log(`Kleenest smoke checks passed: ${required.length} required assets verified.`);
