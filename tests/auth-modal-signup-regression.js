/* Regression guard for the specific signup failure: clicking form controls must not dismiss the modal. */
'use strict';
const fs=require('fs');
const g=fs.readFileSync('kleenest-auth-modal-hardening.js','utf8');
const s=fs.readFileSync('kleenest-auth-signup-controller.js','utf8');
const u=fs.readFileSync('kleenest-ui-integration.js','utf8');
for(const e of ['pointerdown','mousedown','touchstart','click'])if(!g.includes(`addEventListener('${e}'`))throw new Error(`Missing modal protection for ${e}`);
if(!g.includes('window.addEventListener'))throw new Error('Guard must run at window capture layer');
if(!g.includes('stopImmediatePropagation'))throw new Error('Legacy close handlers must be blocked');
if(!s.includes('A.submit')||!s.includes('auth-signup'))throw new Error('Canonical signup controller missing');
if(!u.includes('kleenest-auth-signup-controller.js')||!u.includes('kleenest-auth-modal-hardening.js'))throw new Error('Auth protections are not critical runtime assets');
console.log('Signup modal regression contract passed.');
