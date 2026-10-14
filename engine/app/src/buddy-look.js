// OVERLAY (Sound Garden): replaces the stock buddy-look.js. Sprig's "look" is the colour of its leaf and flower, picked in onboarding
// (six round colour swatches, nothing typed). Saved as profile.buddyLook = { scarf: id }.
import { buddy } from './buddy.js';
export const LOOKS = [
  { id: 'teal', hex: '#4CB82B', name: 'Green' }, { id: 'sun', hex: '#F2B33D', name: 'Yellow' }, { id: 'pink', hex: '#E86C9A', name: 'Pink' },
  { id: 'sky', hex: '#3E9BD8', name: 'Blue' }, { id: 'leaf', hex: '#E4572E', name: 'Orange' }, { id: 'plum', hex: '#8A5CC0', name: 'Purple' },
];
export const FAVS = [{ id: 's', word: 'sun' }, { id: 'm', word: 'mat' }, { id: 't', word: 'top' }];
export const lookArt = () => null;
let cur = null;
export function applyLook(id) {
  cur = id && id !== 'teal' ? id : null;
  const l = LOOKS.find(x => x.id === cur);
  buddy.setColor(l ? l.hex : null);
}
export const currentLook = () => cur || 'teal';
