/* Kleenest Maps Filters — shared amenity vocabulary for consumers, businesses and verification. */
export const RESTROOM_AMENITIES=Object.freeze([
 {key:'wheelchair_accessible',label:'Wheelchair accessible',group:'accessibility'},
 {key:'grab_bars',label:'Grab bars',group:'accessibility'},
 {key:'emergency_pull_cord',label:'Emergency pull cord',group:'accessibility'},
 {key:'accessible_sink',label:'Accessible sink',group:'accessibility'},
 {key:'family_restroom',label:'Family restroom',group:'privacy'},
 {key:'gender_neutral',label:'Gender-neutral restroom',group:'privacy'},
 {key:'private_stall',label:'Private stall',group:'privacy'},
 {key:'baby_changing_table',label:'Baby changing table',group:'family'},
 {key:'adult_changing_table',label:'Adult changing table',group:'family'},
 {key:'family_changing_area',label:'Family changing area',group:'family'},
 {key:'breastfeeding_area',label:'Breastfeeding area',group:'family'},
 {key:'urinal',label:'Urinal',group:'fixtures'},
 {key:'sink',label:'Sink',group:'fixtures'},
 {key:'toilet_stall',label:'Toilet stall',group:'fixtures'},
 {key:'shower',label:'Shower',group:'fixtures'},
 {key:'bidet',label:'Bidet',group:'fixtures'},
 {key:'soap',label:'Soap',group:'supplies'},
 {key:'paper_towels',label:'Paper towels',group:'supplies'},
 {key:'hand_dryer',label:'Hand dryer',group:'supplies'},
 {key:'sanitary_disposal',label:'Sanitary disposal',group:'supplies'},
 {key:'touchless_fixtures',label:'Touchless fixtures',group:'comfort'},
 {key:'drinking_water',label:'Drinking water',group:'comfort'},
 {key:'pet_friendly',label:'Pet friendly',group:'access'},
 {key:'accessible_parking',label:'Accessible parking',group:'access'},
 {key:'parking',label:'Parking',group:'access'}
]);
function amenityValue(row,key){const a=row?.amenities||row?.restroom_amenities||row?.amenity_details||{};if(a&&Object.prototype.hasOwnProperty.call(a,key))return a[key];if(Object.prototype.hasOwnProperty.call(row||{},key))return row[key];const osm=row?.source==='osm'?a:{};return osm?.[key]??false}
function matchesAmenity(row,key){const v=amenityValue(row,key);return v===true||v==='true'||v===1||v==='1'||(typeof v==='number'&&v>0)}
export function createMapsFilters(){let current={};function apply(filters={}){current={...filters};return current}function get(){return {...current,amenities:Array.isArray(current.amenities)?current.amenities.slice():[]}}function filterRows(rows,filters=current){return (Array.isArray(rows)?rows:[]).filter(row=>{if(filters.placeType&&String(row.place_type||'').toLowerCase()!==String(filters.placeType).toLowerCase())return false;if(filters.verifiedOnly&&row.bathroom_verification_status!=='has_bathroom')return false;if(filters.source&&row.source!==filters.source)return false;const wanted=Array.isArray(filters.amenities)?filters.amenities:[];return !wanted.length||wanted.every(key=>matchesAmenity(row,key))})}function renderAmenityFilters(root){if(!root)return;root.innerHTML=RESTROOM_AMENITIES.map(a=>`<label class="maps-amenity-option"><input type="checkbox" data-amenity-key="${a.key}"><span>${a.label}</span></label>`).join('');return root}return Object.freeze({apply,get,filterRows,renderAmenityFilters,amenities:RESTROOM_AMENITIES})}
