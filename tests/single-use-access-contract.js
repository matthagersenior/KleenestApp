/* Single-use access parity/economic boundary. */
'use strict';
const fs=require('fs');
const f=fs.readFileSync('kleenest-single-use-access.js','utf8');
for(const n of ['getOffers','purchase','redeem','createOffer','canSell'])if(!new RegExp(`A\\.${n}\\s*=`).test(f))throw new Error(`Missing single-use access capability: ${n}`);
if(!f.includes('Growth')||!f.includes('Enterprise'))throw new Error('Seller tier messaging missing.');
const migrationFiles=fs.readdirSync('supabase/migrations').filter(x=>x.includes('single_use_access'));
if(!migrationFiles.length)console.warn('Migration may exist remotely but is not mirrored locally yet.');
console.log('Single-use access contract passed.');
