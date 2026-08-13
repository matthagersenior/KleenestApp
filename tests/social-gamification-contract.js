/* Feature-completion contract for modular social/gamification and app surfaces. */
'use strict';
const fs=require('fs');
const social=fs.readFileSync('kleenest-social.js','utf8');
const game=fs.readFileSync('kleenest-gamification.js','utf8');
const community=fs.readFileSync('kleenest-community.js','utf8');
const surfaces=fs.readFileSync('kleenest-app-surfaces.js','utf8');
for(const marker of ['listFavorites','addFavorite','removeFavorite','listFollowing','listFollowers','follow','unfollow','listLikedReviews','likeReview','unlikeReview','listFamily','addFamily','updateFamily','removeFamily'])if(!social.includes(`K.${marker}`))throw new Error(`Social capability missing: ${marker}`);
for(const marker of ['getProfile','getLeaderboard','getBadges','getUserBadges','getStreak','recordActivity','awardPoints','getPointHistory','getContests','joinContest','leaveContest','submitContestEntry','getContestLeaderboard','LEVELS','POINT_RULES'])if(!game.includes(`K.${marker}`))throw new Error(`Gamification capability missing: ${marker}`);
for(const marker of ['getFeed','getTrending','getLeaderboard','getContests','getProfileSummary','getHomeSummary'])if(!community.includes(`K.${marker}`))throw new Error(`Community capability missing: ${marker}`);
for(const name of ['home','maps','details','profile','business','admin','community'])if(!surfaces.includes(`${name}:`))throw new Error(`App surface missing: ${name}`);
console.log('Social/gamification/surface contract passed.');
