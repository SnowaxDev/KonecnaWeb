import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardList, MessageCircle } from 'lucide-react';
import { WHATSAPP_HREF } from '../config/contact';

/**
 * Mobilní lišta přilepená dole.
 *
 * Záměrně tu NENÍ tlačítko „Zavolat". Telefon není kanál, který bychom
 * zvládali spolehlivě obsluhovat – zmeškaný hovor vypadá navenek hůř než
 * žádné tlačítko a v reklamě by se za něj platilo zbytečně. Zákazníka proto
 * posíláme tam, kde poptávka neuteče: nezávazná poptávka nebo WhatsApp.
 * Telefonní číslo zůstává v hlavičce, patičce i na kontaktech pro ty, kdo
 * opravdu chtějí volat.
 *
 * Na /rezervace se lišta neukazuje vůbec – tam je poptávkový formulář
 * samotným obsahem stránky a lišta by překrývala jeho tlačítka.
 */
const StickyContactBar = () => {
  const { pathname } = useLocation();

  const hidden = pathname.startsWith('/admin') || pathname.startsWith('/rezervace');

  // Uvolnit místo pod obsahem, ať lišta nepřekrývá patičku.
  useEffect(() => {
    const cls = 'has-sticky-bar';
    document.body.classList.toggle(cls, !hidden);
    return () => document.body.classList.remove(cls);
  }, [hidden]);

  if (hidden) return null;

  return (
    <div
      className="sticky-contact-bar md:hidden"
      data-track-location="sticky"
      data-testid="sticky-contact-bar"
    >
      <Link
        to="/rezervace"
        className="flex-1 flex items-center justify-center gap-2 bg-[#3FA34D] text-white font-semibold rounded-xl min-h-[48px] px-4 active:bg-[#2d7a38]"
        aria-label="Poslat nezávaznou poptávku"
        data-testid="sticky-booking"
      >
        <ClipboardList className="w-5 h-5" aria-hidden="true" />
        Nezávazná poptávka
      </Link>
      <a
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-[#25D366] text-[#0b3d1f] font-semibold rounded-xl min-h-[48px] px-4 shrink-0"
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
