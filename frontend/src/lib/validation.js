/**
 * Validace vstupů z formuláře.
 *
 * Telefon bereme záměrně tolerantně – lidé ho píšou s mezerami, s +420,
 * s 00420 i bez předvolby. Odmítat kvůli formátu znamená ztratit zakázku,
 * takže kontrolujeme jen to, jestli to vůbec může být české mobilní číslo.
 */
export const isValidCzPhone = (raw) => {
  const v = String(raw || '').replace(/[\s()-]/g, '');
  return /^(?:\+420|00420)?[6-7]\d{8}$/.test(v);
};

// Nepovinné pole – prázdná hodnota je v pořádku, vyplněná musí dávat smysl.
export const isValidEmail = (raw) => {
  const v = String(raw || '').trim();
  if (!v) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};

// Předvýběr služby z reklamy nebo sezónní stránky: /rezervace?sluzba=listi
export const SLUZBA_PARAM_MAP = {
  sekani: 'lawn_mowing',
  'sekani-s-hnojenim': 'lawn_with_fertilizer',
  prerostla: 'overgrown',
  listi: 'overgrown',
  pozemek: 'land_clearing',
  likvidace: 'land_clearing',
  ploty: 'tree_shrub_care',
  kaceni: 'tree_shrub_care',
  stromy: 'tree_shrub_care',
  'pravidelna-udrzba': 'lawn_mowing',
};

export const serviceFromParam = (param) => SLUZBA_PARAM_MAP[String(param || '').toLowerCase()] || null;
