/**
 * Tenká vrstva nad gtag.js pro měření konverzí.
 *
 * Tři pravidla, která to celé drží:
 *  1) Když gtag neexistuje (blokovaný adblock, chybějící REACT_APP_GA_ID,
 *     prerender v Node), funkce se tiše nic nedělá – nikdy nespadne stránka.
 *  2) Nikdy neposíláme osobní údaje. Jméno, telefon, e-mail, adresa ani text
 *     poznámky se do GA nedostanou – posíláme jen typ služby, krok a kanál.
 *     Je to jednak GDPR, jednak to Google zakazuje v podmínkách.
 *  3) Názvy eventů jsou stabilní – navazují na ně klíčové události v GA4
 *     a importované konverze v Google Ads. Nepřejmenovávat bez úpravy GA4.
 */

const isDev = process.env.NODE_ENV === 'development';

// Klíče, které se nikdy nesmí odeslat – pojistka proti překlepu při volání track()
const PII_KEYS = [
  'name', 'jmeno', 'customer_name', 'phone', 'telefon', 'customer_phone',
  'email', 'customer_email', 'address', 'adresa', 'property_address',
  'note', 'notes', 'poznamka', 'message', 'zprava',
];

function stripPII(params) {
  const clean = {};
  Object.entries(params || {}).forEach(([k, v]) => {
    if (PII_KEYS.includes(k.toLowerCase())) {
      if (isDev) console.warn(`[analytics] zahozen osobní údaj "${k}" – do GA nepatří`);
      return;
    }
    if (v === undefined || v === null || v === '') return;
    clean[k] = v;
  });
  return clean;
}

export function track(eventName, params = {}) {
  const payload = stripPII(params);
  if (isDev) console.log('[analytics]', eventName, payload);
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', eventName, payload);
  } catch (e) {
    if (isDev) console.warn('[analytics] gtag selhal:', e);
  }
}

// ─── Formulář ────────────────────────────────────────────────────────────────

export const FORM_ID = 'rezervace';

// form_start smí přijít jen jednou za načtení stránky, jinak by se rozbil poměr
// start → dokončení. Reset zajišťuje resetFormTracking() při novém formuláři.
let formStarted = false;

export function trackFormStart(formId = FORM_ID) {
  if (formStarted) return;
  formStarted = true;
  track('form_start', { form_id: formId });
}

export function resetFormTracking() {
  formStarted = false;
}

export function trackFormStep(stepNumber, stepName, formId = FORM_ID) {
  track('form_step', { form_id: formId, step_number: stepNumber, step_name: stepName });
}

export function trackLead({ serviceType, preferredChannel, formId = FORM_ID }) {
  track('generate_lead', {
    form_id: formId,
    service_type: serviceType || 'neuvedeno',
    preferred_channel: preferredChannel || 'neuvedeno',
  });
}

export function trackFormError(errorType, formId = FORM_ID) {
  track('form_error', { form_id: formId, error_type: errorType });
}

// ─── Kliky na kontakty ───────────────────────────────────────────────────────
// Jeden delegovaný listener na dokumentu: chytí i odkazy, které na stránce
// vzniknou až později (React překresluje, sticky lišta se objevuje a mizí).

function locationOf(el) {
  const holder = el.closest('[data-track-location]');
  return (holder && holder.getAttribute('data-track-location')) || 'neznamo';
}

function onDocumentClick(e) {
  const link = e.target.closest && e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href') || '';
  if (href.startsWith('tel:')) track('click_phone', { link_location: locationOf(link) });
  else if (href.includes('wa.me') || href.includes('api.whatsapp.com')) track('click_whatsapp', { link_location: locationOf(link) });
  else if (href.startsWith('mailto:')) track('click_email', { link_location: locationOf(link) });
}

let listenerAttached = false;

export function initContactTracking() {
  if (typeof document === 'undefined' || listenerAttached) return;
  listenerAttached = true;
  // capture:true → zachytíme klik i když handler výš zavolá stopPropagation
  document.addEventListener('click', onDocumentClick, { capture: true });
}

export function destroyContactTracking() {
  if (typeof document === 'undefined' || !listenerAttached) return;
  document.removeEventListener('click', onDocumentClick, { capture: true });
  listenerAttached = false;
}

const analytics = {
  track, trackFormStart, trackFormStep, trackLead, trackFormError,
  resetFormTracking, initContactTracking, destroyContactTracking, FORM_ID,
};
export default analytics;
