/* Maps Core Safe v2 — preserves Maps Core behavior while preventing its modules container from being frozen before navigation attachment. */
import * as Base from './maps-core.js';
export function createMapsCore(options={}){
  const freeze=Object.freeze;
  Object.freeze=function(value){
    if(value&&typeof value==='object'&&Object.prototype.hasOwnProperty.call(value,'location')&&Object.prototype.hasOwnProperty.call(value,'discovery')&&Object.prototype.hasOwnProperty.call(value,'renderer'))return value;
    return freeze(value);
  };
  try{return Base.createMapsCore(options)}finally{Object.freeze=freeze}
}