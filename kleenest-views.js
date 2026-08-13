/* ========== VIEWS ========== */
function home() {
  const user = currentUser();
  if (!user) return guestHome();
  if (user.isBusinessUser) return businessHomePage(user);
  return consumerHomePage(user, accountHomeType(user));
}

function guestHome() {
  const nearby = [...state.restrooms].filter(r => r.rating > 0).sort((a,b)=>(b.cleanlinessPct||0)-(a.cleanlinessPct||0)).slice(0,4);
  return `<div class="stack">
    <div class="card accent-card card-pad" style="padding:24px">
      <span class="badge verified">THE RESTROOM INTELLIGENCE NETWORK</span>
      <h2 class="page-title brand-color" style="margin-top:8px">Find a restroom you can trust.</h2>
      <p class="profile-sub" style="font-size:1rem;max-width:680px">Kleenest connects travelers, local businesses and communities through verified visits, cleanliness feedback, rewards and real-world restroom intelligence.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn btn-primary" data-open-auth>Join Kleenest</button><button class="btn btn-secondary" data-tab="Maps">Explore nearby</button></div>
    </div>
    <div class="stat-grid">${[['🗺️','Discover','Find trusted stops'],['📍','Verify','Check in with QR'],['⭐','Improve','Rate the experience'],['🏆','Engage','Earn & compete']].map(x=>`<div class="stat-card"><div class="ic">${x[0]}</div><div class="val" style="font-size:1rem">${x[1]}</div><div class="lb">${x[2]}</div></div>`).join('')}</div>
    <h3 class="section-title">✨ Cleanest nearby</h3>
    <div class="stack" style="gap:8px">${nearby.map(r=>`<div class="feed-item" style="align-items:center;justify-content:space-between"><p><span class="who">${r.name}</span><br><span class="profile-sub">${r.distance||'—'} · ${r.cleanlinessPct||0}% clean · ${r.reviews||0} reviews</span></p><button class="btn btn-sm btn-primary" data-restroom="${r.id}">View</button></div>`).join('')}</div>
    <div class="card card-pad"><strong>For businesses</strong><p class="profile-sub" style="margin-top:4px">Turn restroom experience into reputation, engagement and actionable analytics.</p><button class="btn btn-secondary btn-sm" style="margin-top:8px" data-business-toggle>Business owner? Get started</button></div>
  </div>`;
}

function consumerHomePage(user, type) {
  const points=user.points||0, checkins=user.totalCheckIns||0, revs=user.totalReviews||0, streak=user.streak||0;
  const level=user.level||levelFromPoints(points), mutuals=mutualFriends(user), following=(user.following||[]).map(userById).filter(Boolean);
  const nearby=[...state.restrooms].filter(r=>typeof r._distance==='number'||r.rating>0).sort((a,b)=>(b.cleanlinessPct||0)-(a.cleanlinessPct||0)).slice(0,4);
  const posts=socialPostFeed(user).slice(0,3);
  const hero={
    free:{title:'Find trusted restrooms. Make the network better.',sub:'Discover cleaner stops, verify visits, leave useful feedback and build your Kleenest reputation.',cta:'Find a restroom'},
    premium:{title:'Your verified restroom network starts here.',sub:'Use Premium to go beyond discovery: richer reviews, photos, rewards, partner access and deeper community engagement.',cta:'Explore Premium stops'},
    family:{title:'Better restroom stops for the whole family.',sub:'Coordinate favorite stops, earn together and use the Kleenest network to make travel easier for everyone.',cta:'Find family-friendly stops'},
    fleet:{title:'Turn every restroom stop into route intelligence.',sub:'Kleenest helps your team find trusted stops, share preferred locations and build a verified network across the road.',cta:'Plan a route'},
    enterprise:{title:'A restroom network for your organization.',sub:'Give your people trusted facilities, preferred partners and measurable location intelligence across the places they travel.',cta:'Open partner network'}
  }[type];
  return `<div class="stack">
    <div class="card accent-card card-pad" style="padding:22px">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap"><div><span class="badge premium">${type==='free'?'COMMUNITY MEMBER':type.toUpperCase()+' MEMBER'}</span><h2 class="page-title brand-color" style="margin-top:7px">${hero.title}</h2><p class="profile-sub" style="font-size:.95rem;max-width:720px">${hero.sub}</p></div><div style="text-align:right"><div style="font-size:1.6rem;font-weight:800;color:var(--teal-deep)">${points}</div><div class="profile-sub">points · Lv ${level}</div></div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn btn-primary" data-tab="${type==='fleet'?'Route':'Maps'}">${hero.cta}</button><button class="btn btn-secondary" data-scan-qr>📷 Check in</button><button class="btn btn-ghost" data-tab="Social">🏆 Community</button></div>
    </div>
    <div class="stat-grid">${[['📍','Check-ins',checkins],['⭐','Reviews',revs],['🔥','Streak',streak+'d'],['🤝','Friends',mutuals.length]].map(x=>`<div class="stat-card"><div class="ic">${x[0]}</div><div class="val">${x[2]}</div><div class="lb">${x[1]}</div></div>`).join('')}</div>
    ${type==='fleet'||type==='enterprise'?`<div class="card card-pad"><h3 style="font-weight:800">${type==='fleet'?'🚐 Team route intelligence':'🏛️ Organization network'}</h3><p class="profile-sub" style="margin-top:5px">${type==='fleet'?'Preferred stops, route planning and shared member activity turn restroom discovery into an operational tool.':'Your organization can connect members to preferred restroom partners and track participation across the network.'}</p><button class="btn btn-secondary btn-sm" style="margin-top:9px" data-open-family>Open ${type==='fleet'?'Fleet':'Team'} dashboard</button></div>`:''}
    <h3 class="section-title">📍 Your next best stops</h3><div class="stack" style="gap:8px">${nearby.map(r=>`<div class="feed-item" style="align-items:center;justify-content:space-between"><p><span class="who">${r.name}</span><br><span class="profile-sub">${r.distance||'—'} · ${r.cleanlinessPct||0}% clean · ${r.reviews||0} reviews</span></p><button class="btn btn-sm btn-primary" data-restroom="${r.id}">View</button></div>`).join('')}</div>
    ${mutuals.length?`<h3 class="section-title">🤝 Your Kleenest friends</h3><div class="stack" style="gap:8px">${mutuals.slice(0,4).map(p=>`<div class="feed-item" style="align-items:center;justify-content:space-between"><p><button class="btn btn-ghost btn-sm" data-user-profile="${p.id}">${avatarInlineHtml(p)} ${esc(p.name)}</button><br><span class="profile-sub">${p.points||0} pts · ${p.totalCheckIns||0} check-ins</span></p><button class="btn btn-sm btn-secondary" data-message-user="${p.id}">Message</button></div>`).join('')}</div>`:''}
    ${posts.length?`<h3 class="section-title">🌐 From people you follow</h3><div class="stack" style="gap:8px">${posts.map(p=>socialPostCard(p,user)).join('')}</div>`:`<div class="card card-pad"><strong>Build your community</strong><p class="profile-sub" style="margin-top:4px">Follow people whose restroom tips you trust. When you follow each other, you become friends and can message one another.</p><button class="btn btn-secondary btn-sm" style="margin-top:8px" data-tab="Social">Find people</button></div>`}
    <div class="card card-pad"><strong>What makes Kleenest different?</strong><p class="profile-sub" style="margin-top:4px">Every check-in, review and business interaction helps build a living picture of restroom quality and customer experience.</p></div>
  </div>`;
}

function socialPostCard(post,user) {
  const author=userById(post.userId); if(!author) return '';
  const liked=!!(user && (post.likes||[]).includes(user.id));
  const comments=post.comments||[];
  return `<div class="card card-pad" style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;gap:8px"><div><button class="btn btn-ghost btn-sm" data-user-profile="${esc(author.id)}">${avatarInlineHtml(author)} ${esc(author.name)}</button><span class="profile-sub"> · ${mins(Math.max(0,Math.floor((Date.now()-(post.ts||Date.now()))/60000)))}</span></div><span class="badge">${areMutuals(user,author)?'🤝 Friends':relationshipLabel(user,author)}</span></div><p style="margin:8px 0;white-space:pre-wrap">${esc(post.text||'')}</p><div style="display:flex;gap:7px;flex-wrap:wrap"><button class="btn btn-sm btn-ghost" data-like-post="${esc(post.id)}">${liked?'❤️':'🤍'} ${(post.likes||[]).length}</button><button class="btn btn-sm btn-secondary" data-comment-post="${esc(post.id)}">💬 ${comments.length}</button>${areMutuals(user,author)&&author.id!==user.id?`<button class="btn btn-sm btn-ghost" data-message-user="${esc(author.id)}">Message</button>`:''}</div>${comments.slice(-3).map(c=>`<div style="margin-top:8px;padding:8px 10px;border-left:3px solid var(--teal);background:var(--porcelain);border-radius:7px;font-size:.84rem"><strong>${esc(c.user||userById(c.userId)?.name||'Member')}</strong> ${esc(c.text)}</div>`).join('')}${comments.length>3?`<button class="btn btn-ghost btn-sm" style="margin-top:5px" data-comment-post="${esc(post.id)}">View all comments</button>`:''}</div>`;
}

function notificationsModal() {
  const user=currentUser(); if(!user) return '';
  const notes=state.notifications.filter(n=>n.recipientId===user.id).sort((a,b)=>b.ts-a.ts).slice(0,40);
  return `<div class="modal-overlay" data-close-modal><div class="modal-box"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h2 class="page-title" style="font-size:1.3rem">🔔 Notifications</h2><button class="btn btn-ghost btn-sm" data-mark-notifications>Mark all read</button></div><div class="stack" style="gap:8px;margin-top:12px">${notes.length?notes.map(n=>{const from=n.fromId?userById(n.fromId):null; return `<div class="feed-item" style="align-items:flex-start;opacity:${n.read?'.72':'1'}"><div style="font-size:1.2rem">${notificationIcon(n.type)}</div><div style="flex:1"><p><strong>${from?esc(from.name):'Kleenest'}</strong> ${esc(n.text)}</p><p class="profile-sub">${new Date(n.ts).toLocaleString()} ${n.read?'':' · New'}</p>${n.postId?`<button class="btn btn-ghost btn-sm" data-comment-post="${esc(n.postId)}">Open post</button>`:''}</div></div>`}).join(''):`<p class="profile-sub">You're all caught up. Follow people, post updates and check in to build your Kleenest community.</p>`}</div><button class="btn btn-primary btn-block" style="margin-top:12px" data-close-modal>Close</button></div></div>`;
}

function commentsModal(postId) {
  const user=currentUser(), post=(state.socialPosts||[]).find(p=>p.id===postId); if(!user||!post) return '';
  const author=userById(post.userId);
  const comments=post.comments||[];
  const allowed=post.userId===user.id || followsUser(user,author) || followsUser(author,user);
  return `<div class="modal-overlay" data-close-modal><div class="modal-box"><h2 class="page-title" style="font-size:1.3rem">💬 Conversation</h2><p class="profile-sub">${author?esc(author.name):'Kleenest member'} · ${comments.length} comment${comments.length===1?'':'s'}</p><div class="card card-pad" style="margin:12px 0;max-height:300px;overflow:auto;background:var(--porcelain)">${comments.length?comments.map(c=>`<div style="padding:8px 0;border-bottom:1px solid var(--tile-line)"><strong>${esc(c.user||userById(c.userId)?.name||'Member')}</strong><span class="profile-sub"> · ${c.ts?new Date(c.ts).toLocaleString():''}</span><div style="margin-top:3px;white-space:pre-wrap">${esc(c.text)}</div></div>`).join(''):'<p class="profile-sub">No comments yet.</p>'}</div>${allowed?`<textarea id="comment-text" rows=3 class="form-input" placeholder="Add a helpful route tip, restroom detail, or encouragement..."></textarea><button class="btn btn-primary btn-block" style="margin-top:10px" data-submit-comment="${esc(post.id)}">Comment</button>`:`<div class="message-banner info">Follow this person to join the conversation.</div>`}<button class="btn btn-ghost btn-block" style="margin-top:8px" data-close-modal>Close</button></div></div>`;
}

function businessHomePage(user) {
  const r=resolveBusinessRestroom(user); businessRestroom=r;
  const locs=businessLocations(user), growth=isGrowthOrEnterpriseBiz(user), lm=r?locationMetrics(r):null;
  const tier=user.businessTier==='enterprise'?'Enterprise':user.businessTier==='growth'||locs.length>1?'Growth':'Standard';
  const cleanPct=r?(r.cleanlinessPct||0):0, ev=r?businessEventCounts(r):null, views=ev?ev.profileViews:0, scans=ev?ev.qrScans:0, favorites=r?favoriteCount(r.id):0;
  const verification=r?.verificationStatus==='verified';
  return `<div class="stack">
    <div class="card accent-card blue card-pad" style="padding:22px"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><span class="badge premium">${tier.toUpperCase()} BUSINESS</span><h2 class="page-title" style="color:var(--blue);margin-top:7px">Turn restroom experience into business intelligence.</h2><p class="profile-sub" style="font-size:.95rem;max-width:720px">Kleenest connects verified visits, cleanliness feedback, customer engagement and location performance into one reputation network.</p></div><div style="text-align:right"><div style="font-size:1.2rem;font-weight:800">${verification?'✓ VERIFIED':'PENDING'}</div><div class="profile-sub">${verification?'business profile':'verification status'}</div></div></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn btn-primary" data-tab="Business">Open Business Dashboard</button><button class="btn btn-secondary" data-tab="Details">View customer experience</button></div></div>
    <div class="business-stat">${[[r?r.rating:'—','Rating'],[cleanPct+'%','Cleanliness'],[lm?lm.checkinsMonth:0,'Verified visits'],[scans,'QR scans'],[favorites,'Favorites'],[views,'Profile views']].map(x=>`<div class="business-stat-item"><div class="big">${x[0]}</div><div class="label">${x[1]}</div></div>`).join('')}</div>
    ${r?`<div class="card card-pad"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center"><div><h3 style="font-weight:800">📍 ${esc(r.name)}</h3><p class="profile-sub" style="margin-top:4px">${esc(r.address||'Address pending')}</p></div><span class="badge ${verification?'verified':'premium'}">${verification?'✓ Kleenest Verified':'Verification pending'}</span></div><div class="qr-card" style="margin-top:14px"><div class="qr-box"><img id="business-qr-home" alt="Kleenest business QR"><div><strong>Put Kleenest at the restroom.</strong><p class="profile-sub" style="margin-top:4px">Every business listing gets a check-in QR. Customers scan, visit, review and generate measurable activity for this location. QR analytics remain available on every business tier.</p><div class="qr-actions" style="margin-top:10px"><button class="btn btn-primary btn-sm" data-download-business-qr>Open QR</button><button class="btn btn-secondary btn-sm" data-print-business-qr>Print QR</button><button class="btn btn-ghost btn-sm" data-btab="listing">Customize</button></div></div></div></div></div>`:''}
    <div class="card card-pad"><h3 style="font-weight:800">📈 Reputation → engagement → revenue</h3><p class="profile-sub" style="margin-top:5px">Get discovered, build trust with verified feedback, turn check-ins into engagement, and use analytics to improve the customer experience.</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><span class="badge verified">✓ Verified visits</span><span class="badge">📍 ${locs.length} location${locs.length===1?'':'s'}</span>${growth?'<span class="badge premium">Growth analytics</span>':'<span class="badge">Standard analytics</span>'}</div></div>
    <div class="card card-pad"><h3 style="font-weight:800">🚀 Your next steps</h3><div class="stack" style="gap:8px;margin-top:10px">${[[!!r,'Create or claim your listing','Connect the location you operate.','data-open-biz-onboard'],[verification,'Get verified','Verification builds trust with customers.','data-btab=verification'],[!!r,'Place your QR','Put the check-in QR where customers can see it.','data-print-business-qr'],[growth,'Activate engagement','Promotions, contests and richer analytics are available on Growth / Enterprise.','data-btab=promos']].map((x,i)=>`<div class="feed-item" style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div><strong>${x[0]?'✓':'○'} ${i+1}. ${x[1]}</strong><p class="profile-sub">${x[2]}</p></div><button class="btn btn-sm ${x[0]?'btn-secondary':'btn-ghost'}" ${x[0]?'':'disabled'} ${x[3].includes('=')?x[3]:x[3]}>${i===0?'Manage':i===1?'Verify':i===2?'Print': 'Explore'}</button></div>`).join('')}</div></div>
    ${growth?`<div class="card card-pad"><h3 style="font-weight:800">🤝 Network growth</h3><p class="profile-sub" style="margin-top:5px">Growth and Enterprise locations can activate promotions, partner programs, events and portfolio-level intelligence.</p><button class="btn btn-secondary btn-sm" style="margin-top:8px" data-btab="promos">Manage engagement</button></div>`:`<div class="message-banner info">Your listing and QR are live on Standard. Upgrade to Growth when you want richer engagement, media and multi-location intelligence.</div>`}
    <div class="card card-pad"><h3 style="font-weight:800">🏆 Earn community trust</h3><p class="profile-sub" style="margin-top:5px">Keep information current, respond to reviews and maintain a strong cleanliness score to become a trusted Kleenest location.</p><button class="btn btn-secondary btn-sm" style="margin-top:8px" data-tab="Social">View business leaderboard</button></div>
  </div>`;
}

