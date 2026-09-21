import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Phone, MessageCircle } from 'lucide-react';
import { TEL_HREF, PHONE_DISPLAY, WHATSAPP_HREF } from '../config/contact';

/**
 * Mobilní lišta „Zavolat + WhatsApp" přilepená dole.
 *
 * Proč: na mobilu je telefon nejrychlejší cesta k zakázce a zákazník nemá
 * chuť scrollovat zpátky nahoru pro číslo.
 *
 * Dvě věci, na kterých to jinak padá:
 *  - Na /rezervace by lišta konkurovala hlavnímu CTA („Odeslat poptávku").
 *    Proto ji schováváme, jakmile je odesílací tlačítko ve viewportu –
 *    hlídá to IntersectionObserver nad prvkem [data-sticky-hide].
 *  - Fixní lišta překrývá patičku. Kompenzujeme paddingem na <body>, který
 *    zase uklidíme, když lištu schováme, ať nevzniká prázdné místo.
 */
const StickyContactBar = () => {
  const { pathname } = useLocation();
  const [hiddenByCta, setHiddenByCta] = useState(false);

  // Na admin stránce lišta nemá co dělat
  const enabled = !pathname.startsWith('/admin');

  useEffect(() => {
    if (!enabled) return undefined;
    // Cíl se může objevit až po prokliknutí na poslední krok formuláře,
    // proto ho hledáme opakovaně, dokud nevznikne.
    let observer;
    let cancelled = false;

    const attach = () => {
      if (cancelled) return;
      const target = document.querySelector('[data-sticky-hide]');
      if (!target) {
        setHiddenByCta(false);
        window.setTimeout(attach, 500);
        return;
      }
      observer = new IntersectionObserver(
        ([entry]) => setHiddenByCta(entry.isIntersecting),
        { threshold: 0.1 }
      );
      observer.observe(target);
    };

    attach();
    return () => { cancelled = true; if (observer) observer.disconnect(); };
  }, [enabled, pathname]);

  const visible = enabled && !hiddenByCta;

  // Uvolnit místo pod obsahem, ať lišta nepřekrývá patičku.
  useEffect(() => {
    const cls = 'has-sticky-bar';
    document.body.classList.toggle(cls, visible);
    return () => document.body.classList.remove(cls);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="sticky-contact-bar md:hidden"
      data-track-location="sticky"
      data-testid="sticky-contact-bar"
    >
      <a
        href={TEL_HREF}
        className="flex-1 flex items-center justify-center gap-2 bg-[#3FA34D] text-white font-semibold rounded-xl min-h-[48px] px-4 active:bg-[#2d7a38]"
        aria-label={`Zavolat na ${PHONE_DISPLAY}`}
        data-testid="sticky-call"
      >
        <Phone className="w-5 h-5" aria-hidden="true" />
        Zavolat
      </a>
      <a
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-[#0b3d1f] font-semibold rounded-xl min-h-[48px] px-4 active:brightness-95"
        aria-label="Napsat na WhatsApp"
        data-testid="sticky-whatsapp"
      >
        <MessageCircle className="w-5 h-5" aria-hidden="true" />
        WhatsApp
      </a>
    </div>
  );
};

export default StickyContactBar;
