import { Star } from 'lucide-react';
import { REVIEWS } from '../config/contact';

/**
 * Jeden tenký pás důvěry nad formulářem.
 *
 * Dřív tu byly dvě velké karty (hodnocení + „co se stane po odeslání"), jenže
 * odsunuly formulář pod ohyb a zákazník musel scrollovat, aby vůbec viděl, co
 * má vyplnit. Na konverzní stránce je formulář to hlavní – všechno ostatní se
 * musí vejít do jednoho řádku, nebo tam nemá co dělat.
 *
 * Co se stane po odeslání se proto ukazuje až v posledním kroku, těsně nad
 * tlačítkem Odeslat – tam, kde na tom zákazníkovi opravdu záleží.
 */
export const TrustStrip = () => (
  <div
    className="flex items-center justify-center gap-x-3 gap-y-1 flex-wrap text-[11px] sm:text-xs text-gray-600"
    data-testid="trust-strip"
  >
    <span className="inline-flex items-center gap-1">
      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" aria-hidden="true" />
      <strong className="text-gray-800">{String(REVIEWS.rating).replace('.', ',')}★</strong>
      <span className="hidden sm:inline">z {REVIEWS.count} hodnocení na</span>
      <a
        href={REVIEWS.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#3FA34D] underline underline-offset-2"
      >
        {REVIEWS.label}
      </a>
    </span>
    <span className="text-gray-300" aria-hidden="true">·</span>
    <span>Obhlídka zdarma</span>
    <span className="text-gray-300" aria-hidden="true">·</span>
    <span>Ozveme se do 24 hodin</span>
  </div>
);

/**
 * Tři kroky „co bude následovat" v kompaktní podobě – jen do posledního kroku
 * formuláře, ať nezabírají místo tam, kde zákazník teprve vybírá službu.
 */
export const HowItWorksCompact = () => (
  <div
    className="rounded-lg bg-[#F0FDF4] border border-[#3FA34D]/20 px-3 py-2"
    data-testid="how-it-works"
  >
    <p className="text-[11px] text-[#1B4332] leading-relaxed">
      <strong>Co bude dál:</strong> poptávku pošlete zdarma a nezávazně → ozveme se
      do 24 hodin (většinou ještě dnes) → přijedeme na bezplatnou obhlídku a řekneme
      přesnou cenu předem.
    </p>
  </div>
);

export default TrustStrip;
