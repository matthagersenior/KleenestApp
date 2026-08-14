/* Critical-path regression contract: signup + immediate public bathroom discovery. */
'use strict';
const fs=require('fs');
const signup=fs.readFileSync('kleenest-auth-signup-controller.js','utf8');
const delegated=fs.readFileSync('kleenest-signup-delegated-handler.js','utf8');
const supa=fs.readFileSync('kleenest-supabase.js','utf8');
const bathrooms=fs.readFileSync('kleenest-public-bathroom-discovery.js','utf8');
const ui=fs.readFileSync('kleenest-ui-integration.js','utf8');
for(const x of ['A.submit','A.handleSubmit','e.preventDefault()','kleenest:signup-success','kleenest:signup-error'])if(!signup.includes(x))throw new Error('Signup controller regression: '+x);
for(const x of ['window.addEventListener(\'submit\'','e.stopImmediatePropagation()','KleenestAuthSignup.submit'])if(!delegated.includes(x))throw new Error('Delegated signup regression: '+x);
if(!supa.includes('auth.signUp'))throw new Error('Supabase signup path missing');
for(const x of ['amenity=toilets','toilets=yes','overpass-api.de','restroom_confidence'])if(!bathrooms.includes(x))throw new Error('Bathroom discovery regression: '+x);
if(!ui.includes('kleenest-public-bathroom-discovery.js'))throw new Error('Bathroom discovery not bootstrapped');
console.log('Critical signup + bathroom discovery contract passed.');
