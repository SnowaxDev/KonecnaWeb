/**
 * Jediný zdroj pravdy pro kontaktní údaje SeknuTo.cz.
 *
 * Telefon i WhatsApp jedou na stejné číslo (730 588 372) – potvrzeno majitelem.
 * Kdyby se kdykoli rozcházely, stačí změnit WHATSAPP_PHONE a zbytek webu se
 * přizpůsobí sám. Dřív bylo číslo rozepsané v 16 souborech.
 */

// Mezinárodní tvar bez mezer – pro tel: odkazy
export const PHONE_E164 = '+420730588372';
// Lidsky čitelný tvar – pro zobrazení
export const PHONE_DISPLAY = '730 588 372';
// wa.me chce číslo bez plus a bez mezer
export const WHATSAPP_PHONE = '420730588372';

export const EMAIL = 'info@seknuto.cz';

export const TEL_HREF = `tel:${PHONE_E164}`;
export const MAILTO_HREF = `mailto:${EMAIL}`;

// Předvyplněná zpráva do WhatsAppu – zákazník nemusí přemýšlet, čím začít
export const WHATSAPP_DEFAULT_TEXT = 'Dobrý den, mám zájem o zahradní práce. Lokalita: ';

export const whatsappHref = (text = WHATSAPP_DEFAULT_TEXT) =>
  `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;

export const WHATSAPP_HREF = whatsappHref();

// Sociální důkaz – drženo v configu, ať se dá po nových recenzích snadno přepsat
export const REVIEWS = {
  rating: 4.7,
  count: 11,
  url: 'https://www.firmy.cz/detail/13988364-seknuto-cz-dvur-kralove-nad-labem.html',
  label: 'Firmy.cz',
};

export default {
  PHONE_E164, PHONE_DISPLAY, WHATSAPP_PHONE, EMAIL,
  TEL_HREF, MAILTO_HREF, WHATSAPP_HREF, whatsappHref, REVIEWS,
};
