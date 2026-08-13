/* Verify every major monolith surface has a modular domain/controller and real backend boundary. */
'use strict';
const fs=require('fs');
const runtime=fs.readFileSync('kleenest-supabase-runtime.js','utf8');
const controllers=fs.readFileSync('kleenest-surface-controllers.js','utf8');
const maps=fs.readFileSync('kleenest-maps.js','utf8');
const business=fs.readFileSync('kleenest-business-surface.js','utf8');
const admin=fs.readFileSync('kleenest-admin-surface.js','utf8');
for(const n of ['home','maps','route','details','profile','community','business','admin']) if(!new RegExp(`C\\.${n}\\s*=`).test(controllers)) throw new Error(`Missing controller: ${n}`);
for(const marker of ['nearby_locations','search_locations','resolve_location_identity']) if(!maps.includes(marker)) throw new Error(`Maps controller missing real RPC: ${marker}`);
for(const marker of ['get_business_dashboard','business_create_location','business_update_location','business_request_partner_agreement']) if(!business.includes(marker)) throw new Error(`Business controller missing real RPC: ${marker}`);
for(const marker of ['admin_get_overview','admin_list_pending_businesses','admin_list_reports','admin_set_business_verification','admin_set_business_tier']) if(!admin.includes(marker)) throw new Error(`Admin controller missing privileged RPC: ${marker}`);
for(const marker of ['kleenest-maps.js','kleenest-business-surface.js','kleenest-admin-surface.js','kleenest-surface-controllers.js']) if(!runtime.includes(marker)) throw new Error(`Runtime missing modular layer: ${marker}`);
console.log('Surface-domain parity contract passed.');
