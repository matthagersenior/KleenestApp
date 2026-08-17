/* Kleenest Maps Filters — the same canonical amenity vocabulary used by locations, businesses and verification. */
export const RESTROOM_AMENITIES=Object.freeze([
 {key:'accessible',label:'Accessible',category:'Accessibility'},
 {key:'accessible_stall',label:'Accessible stall',category:'Accessibility'},
 {key:'drinking_water',label:'Drinking water',category:'Comfort'},
 {key:'atm',label:'ATM',category:'Convenience'},
 {key:'parking',label:'Parking',category:'Convenience'},
 {key:'pet_friendly',label:'Pet friendly',category:'Convenience'},
 {key:'outdoor_seating',label:'Outdoor seating',category:'Dining'},
 {key:'showers',label:'Showers',category:'Facilities'},
 {key:'vending',label:'Vending',category:'Facilities'},
 {key:'baby_changing',label:'Baby changing',category:'Family'},
 {key:'changing_table',label:'Changing table',category:'Family'},
 {key:'family_restroom',label:'Family restroom',category:'Family'},
 {key:'mirrors',label:'Mirrors',category:'Fixtures'},
 {key:'twenty_four_hours',label:'24 hours',category:'Hours'},
 {key:'hand_dryer',label:'Hand dryer',category:'Hygiene'},
 {key:'hot_water',label:'Hot water',category:'Hygiene'},
 {key:'paper_towels',label:'Paper towels',category:'Hygiene'},
 {key:'soap',label:'Soap',category:'Hygiene'},
 {key:'drinking_fountain',label:'Drinking fountain',category:'Other'},
 {key:'free_wifi',label:'Free Wi-Fi',category:'Other'},
 {key:'touchless_fixtures',label:'Touchless fixtures',category:'Restroom'},
 {key:'water_fountain',label:'Water fountain',category:'Restroom'},
 {key:'attended',label:'Attended',category:'Safety'},
 {key:'well_lit',label:'Well lit',category:'Safety'},
 {key:'ev_charging',label:'EV charging',category:'Transportation'}
]);
export const FIXTURE_COUNTS=Object.freeze([{key:'stalls',label:'Toilet stalls'},{key:'urinals',label:'Urinals'},{key:'sinks',label:'Sinks'},{key:'hand_dryers',label:'Hand dryers'},{key:'changing_tables',label:'Changing tables'},{key:'showers',label:'Showers'}]);
export function createMapsFilters(){let current={};function apply(filters={}){current={...filters};return current}function get(){return {...current,amenities:Array.isArray(current.amenities)?current.amenities.slice():[]}}function filterRows(rows,filters=current){return(Array.isArray(rows)?rows:[]).filter(row=>{if(filters.placeType&&String(row.place_type||'').toLowerCase()!==String(filters.placeType).toLowerCase())return false;if(filters.verifiedOnly&&row.bathroom_verification_status!=='has_bathroom')return false;if(filters.source&&row.source!==filters.source)return false;const wanted=Array.isArray(filters.amenities)?filters.amenities:[];const a=row.amenities||{};return !wanted.length||wanted.every(k=>a[k]===true||a[k]===1||a[k]==='true'||Number(a[k])>0)})}function renderAmenityFilters(root){if(!root)return;root.innerHTML='<div class="maps-amenity-groups">'+[...new Set(RESTROOM_AMENITIES.map(x=>x.category))].map(category=>'<fieldset><legend>'+category+'</legend>'+RESTROOM_AMENITIES.filter(x=>x.category===category).map(a=>'<label class="maps-amenity-option"><input type="checkbox" data-amenity-key="'+a.key+'"><span>'+a.label+'</span></label>').join('')+'</fieldset>').join('')+'</div><div class="maps-fixture-note"><strong>Fixture counts</strong><span>Stalls, urinals, sinks, hand dryers, changing tables and showers are displayed from verified location fixture data when available.</span></div>';return root}return Object.freeze({apply,get,filterRows,renderAmenityFilters,amenities:RESTROOM_AMENITIES,fixtureCounts:FIXTURE_COUNTS})}