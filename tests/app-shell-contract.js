/* Static regression checks for the install/offline boundary. */
'use strict';
const fs=require('fs');
const sw=fs.readFileSync('sw.js','utf8');
const manifest=fs.readFileSync('manifest.webmanifest','utf8');
const shell=fs.readFileSync('kleenest-app-shell.js','utf8');
for(const marker of ["CACHE='kleenest-shell-v1'","self.addEventListener('install'","self.addEventListener('activate'","self.addEventListener('fetch'"])if(!sw.includes(marker))throw new Error(`Missing service-worker contract: ${marker}`);
if(!sw.includes("r.method!=='GET'"))throw new Error('Service worker must not intercept non-GET requests.');
if(!sw.includes("u.pathname.startsWith('/auth/')")||!sw.includes("u.pathname.includes('supabase')"))throw new Error('Service worker must exclude auth/Supabase traffic.');
for(const marker of ['"display": "standalone"','"start_url": "/"','"scope": "/"','icon-placeholder.svg'])if(!manifest.includes(marker))throw new Error(`Missing manifest contract: ${marker}`);
for(const marker of ["link[rel=\"manifest\"]","/manifest.webmanifest","navigator.serviceWorker.register('/sw.js'"])if(!shell.includes(marker))throw new Error(`Missing app-shell contract: ${marker}`);
console.log('App-shell/PWA contract checks passed.');
