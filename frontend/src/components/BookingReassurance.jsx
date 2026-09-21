import { Star, Send, PhoneCall, ClipboardCheck } from 'lucide-react';
import { REVIEWS } from '../config/contact';

/**
 * Dva bloky, které snižují nejistotu těsně před odesláním poptávky:
 *  - HowItWorks: co se stane potom (nejčastější důvod, proč lidé formulář nedokončí
 *    – nevědí, do čeho jdou, a bojí se, že je někdo začne otravovat),
 *  - SocialProof: hodnocení z Firmy.cz jako důkaz, že nejsme náhodný inzerát.
 *
 * Záměrně bez jakýchkoli cen – cenu říkáme až po bezplatné obhlídce.
 */

const STEPS = [
  {
    icon: Send,
    title: 'Pošlete poptávku',
    text: 'Zabere to asi minutu. Nic tím neplatíte a k ničemu se nezavazujete.',
  },
  {
    icon: PhoneCall,
    title: 'Ozveme se do 24 hodin',
    text: 'Většinou ještě týž den. Domluvíme se na termínu obhlídky.',
  },
  {
    icon: ClipboardCheck,
    title: 'Bezplatná obhlídka',
    text: 'Přijedeme se podívat a řekneme přesnou cenu předem, bez závazku.',
  },
];

export const HowItWorks = () => (
  <section aria-labelledby="jak-to-probiha" data-testid="how-it-works">
    <h2 id="jak-to-probiha" className="text-sm font-bold text-[#1B4332] mb-3">
      Co se stane po odeslání
    </h2>
    <ol className="space-y-3">
      {STEPS.map((s, i) => (
        <li key={s.title} className="flex gap-3">
          <div className="shrink-0 w-9 h-9 rounded-full bg-[#F0FDF4] border border-[#3FA34D]/30 flex items-center justify-center">
            <s.icon className="w-4 h-4 text-[#3FA34D]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {i + 1}. {s.title}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  </section>
);

export const SocialProof = () => (
  <section
    aria-labelledby="hodnoceni"
    className="rounded-xl border border-gray-200 bg-white p-4"
    data-testid="social-proof"
  >
    <h2 id="hodnoceni" className="sr-only">Hodnocení zákazníků</h2>
    <div className="flex items-center gap-3">
      <div className="flex" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < Math.round(REVIEWS.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
      <p className="text-sm text-gray-800">
        <strong>{String(REVIEWS.rating).replace('.', ',')}★</strong>{' '}
        z {REVIEWS.count} hodnocení na{' '}
        <a
          href={REVIEWS.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#3FA34D] underline underline-offset-2"
        >
          {REVIEWS.label}
        </a>
      </p>
    </div>
    {/* TODO: doplnit reálné recenze z Firmy.cz – texty ani jména si nevymýšlíme */}
  </section>
);

export default HowItWorks;
