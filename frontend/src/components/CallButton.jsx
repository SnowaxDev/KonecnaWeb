import { Phone } from 'lucide-react';

const CallButton = () => {
  return (
    <a
      href="tel:+420730588372"
      className="call-float"
      aria-label="Zavolat 730 588 372"
      data-testid="call-button"
    >
      <Phone className="w-7 h-7" />
    </a>
  );
};

export default CallButton;
