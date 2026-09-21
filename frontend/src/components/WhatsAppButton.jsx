import { MessageCircle } from 'lucide-react';
import { WHATSAPP_HREF } from '../config/contact';

/**
 * Plovoucí WhatsApp tlačítko. Na mobilu je schované (md:flex) – tam stejnou
 * roli plní sticky lišta dole a dvě WhatsApp tlačítka přes sebe jen překážejí.
 */
const WhatsAppButton = () => {
  return (
    <a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Kontaktovat přes WhatsApp"
      data-track-location="float"
      data-testid="whatsapp-button"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
};

export default WhatsAppButton;
