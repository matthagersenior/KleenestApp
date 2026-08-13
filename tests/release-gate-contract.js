/* Static release gate: prevents accidental promotion while known legacy markers remain. */
'use strict';
const fs=require('fs');
const index=fs.readFileSync('index.html','utf8');
const runtime=fs.readFileSync('kleenest-supabase-runtime.js','utf8');
const status=fs.readFileSync('MIGRATION-STATUS.md','utf8');
const legacy=[/\bkleenest-db-v\d+\b/i,/localStorage\.setItem\(/i,/function\s+login\s*\(/i,/function\s+signup\s*\(/i,/data-do-login/i,/data-do-signup/i];
const markers=legacy.filter(r=>r.test(index));
if(markers.length)throw new Error(`Production entry still contains legacy markers: ${markers.map(String).join(', ')}`);
if(!index.includes('kleenest-supabase-runtime.js'))throw new Error('Production entry must load the modular Supabase runtime.');
if(!runtime.includes('window.KleenestRuntime'))throw new Error('Modular runtime contract missing.');
if(!status.includes('Promotion rule:'))throw new Error('Migration promotion rule missing.');
console.log('Release gate contract passed.');
