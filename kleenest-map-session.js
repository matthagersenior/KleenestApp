/* Maps session controller: keeps GPS/data/map state alive across tab mounts and restores local cache immediately. */
(function(global){'use strict';
if(global.__KLEENEST_MAP_SESSION__)return;global.__KLEENEST_MAP_SESSION__=true;
const KEY='kleenest.maps.session.v1';
const session=global.KleenestMapSession=global.KleenestMapSession||{active:false,lastView:null,lastCenter:null,lastZoom:14,filters:{cat:'all',amenity:'all'},mounted:false};
function save(){try{localStorage.setItem(KEY,JSON.stringify({lastView:session.lastView,lastCenter:session.lastCenter,lastZoom:session.lastZoom,filters:session.filters,savedAt:Date.now()}))}catch(e){}}
function restore(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(!x)return;session.lastView=x.lastView||null;session.lastCenter=x.lastCenter||null;session.lastZoom=Number(x.lastZoom)||14;if(x.filters)session.filters=Object.assign(session.filters,x.filters)}catch(e){}}
function setView(center,zoom){session.lastCenter=center||session.lastCenter;session.lastZoom=Number(zoom)||session.lastZoom;save()}
function setFilters(filters){session.filters=Object.assign(session.filters,filters||{});save()}
restore();
session.setView=setView;session.setFilters=setFilters;session.save=save;session.restore=restore;
global.dispatchEvent(new CustomEvent('kleenest:map-session-ready',{detail:session}));
})(window);