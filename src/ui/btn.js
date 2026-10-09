// Hero-button content for non-readers: a big icon first, an arrow last, the word small in the middle.
const S = (d, c = '#12330F') => `<svg viewBox="0 0 32 32" aria-hidden="true"><g fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">${d}</g></svg>`;
export const ICON = {
  heard: S('<path d="M7 17l6 6 12-14"/>'),
  next: S('<path d="M6 16h18M17 8l8 8-8 8"/>'),
  garden: S('<path d="M16 28V15M16 17C9 17 7 12 7 8c6 0 9 3 9 9ZM16 15c0-5 3-8 9-8 0 5-3 8-9 8Z"/>'),
  again: S('<path d="M25 11A10 10 0 1 0 26 18M25 4v7h-7"/>'),
  bell: S('<path d="M8 23h16l-2-3v-5a6 6 0 0 0-12 0v5ZM13 27h6"/>'),
  house: S('<path d="M5 16L16 6l11 10M9 14v13h14V14M16 27v-7"/>'),
  water: S('<path d="M16 4C11 12 8 16 8 20a8 8 0 0 0 16 0c0-4-3-8-8-16Z"/>'),
};
export const label = (icon, text, arrow = true) => `<span class="bi">${ICON[icon]}</span><span class="bl">${text}</span>${arrow ? `<span class="ba">${ICON.next}</span>` : ''}`;
