/* Static regression checks for auth UI event ownership and mobile modal behavior. */
'use strict';
const fs=require('fs');
const guard=fs.readFileSync('kleenest-auth-legacy-guard.js','utf8');
const runtime=fs.readFileSync('kleenest-supabase-runtime.js','utf8');
const touch=fs.readFileSync('kleenest-auth-modal-touch-fix.js','utf8');
if(!guard.includes("c.matches('[data-do-logout]')"))throw new Error('Legacy guard must special-case logout.');
if(!guard.includes("kleenest:auth-logout"))throw new Error('Legacy guard must hand logout to Supabase runtime.');
if(!runtime.includes("window.addEventListener('kleenest:auth-logout'"))throw new Error('Runtime logout event bridge missing.');
if(!runtime.includes("window.KleenestRuntime.__loggingOut"))throw new Error('Logout recursion guard missing.');
for(const event of ['pointerdown','mousedown','touchstart','click'])if(!guard.includes(`document.addEventListener(type,block,true)`))throw new Error('Legacy auth guard listener contract missing.');
for(const event of ['pointerdown','pointerup','touchstart','touchend','click'])if(!touch.includes(`'${event}'`))throw new Error(`Touch regression coverage missing ${event}.`);
if(!touch.includes('input,textarea,select,button,label,a'))throw new Error('Interactive auth control selector missing.');
if(!touch.includes('e.stopPropagation()'))throw new Error('Auth modal interaction protection missing.');
console.log('Auth UI contract checks passed.');
