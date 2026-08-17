import { navigationProviderLabel } from './maps-navigation-preferences-v1.js';
export function renderNavigationPreference({root,preferences,onChange=()=>{}}={}){
 if(!root||!preferences)throw new Error('Navigation preference UI requires root and preferences.');
 const wrap=document.createElement('label');wrap.className='maps-navigation-preference';wrap.innerHTML='<span>Preferred navigation</span><select aria-label="Preferred navigation app"></select><small>Choose Kleenest or hand navigation to your preferred app.</small>';
 const select=wrap.querySelector('select');preferences.options().forEach(value=>{const option=document.createElement('option');option.value=value;option.textContent=navigationProviderLabel(value);select.appendChild(option)});select.value=preferences.get();select.addEventListener('change',()=>{const value=preferences.set(select.value);onChange(value)});root.appendChild(wrap);return()=>wrap.remove();
}
