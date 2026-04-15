import { Link } from 'react-router-dom';
import { Leaf, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#222222] text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4" data-testid="footer-logo">
              <div className="w-10 h-10 bg-[#3FA34D] rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                SeknuTo<span className="text-[#3FA34D]">.cz</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Profesionální zahradnické služby pro váš dokonalý trávník a zahradu. Rychle, spolehlivě a transparentně.
            </p>
            <p className="text-[#3FA34D] font-medium text-sm">
              🌱 Trávník bez starostí!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Rychlé odkazy
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/sluzby', label: 'Služby' },
                { href: '/cenik', label: 'Jak to funguje' },
                { href: '/rezervace', label: 'Rezervace' },
                { href: '/o-nas', label: 'O nás' },
                { href: '/kontakt', label: 'Kontakt' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-[#3FA34D] transition-colors text-sm"
                    data-testid={`footer-link-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Kontakt
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+420730588372"
                  className="flex items-center gap-3 text-gray-400 hover:text-[#3FA34D] transition-colors text-sm"
                  data-testid="footer-phone"
                >
                  <Phone className="w-4 h-4 text-[#3FA34D]" />
                  +420 730 588 372
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/420730588372"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-400 hover:text-[#25D366] transition-colors text-sm"
                  data-testid="footer-whatsapp"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@seknuto.cz"
                  className="flex items-center gap-3 text-gray-400 hover:text-[#3FA34D] transition-colors text-sm"
                  data-testid="footer-email"
                >
                  <Mail className="w-4 h-4 text-[#3FA34D]" />
                  info@seknuto.cz
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-[#3FA34D] mt-0.5" />
                <span>Dvůr Králové nad Labem<br />a okolí do 30 km</span>
              </li>
            </ul>
          </div>

          {/* Working Hours */}
          <div>
            <h4 className="font-semibold text-lg mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Pracovní doba
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex justify-between">
                <span>Pondělí - Pátek</span>
                <span className="text-white">8:00 - 18:00</span>
              </li>
              <li className="flex justify-between">
                <span>Sobota</span>
                <span className="text-white">9:00 - 15:00</span>
              </li>
              <li className="flex justify-between">
                <span>Neděle</span>
                <span className="text-gray-500">Zavřeno</span>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-[#3FA34D]/10 rounded-lg">
              <p className="text-[#3FA34D] text-sm font-medium">
                💬 Rychlá odpověď přes WhatsApp!
              </p>
            </div>
          </div>

          {/* Oblast působení */}
          <div>
            <h4 className="font-semibold text-lg mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Oblast působení
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/sekani-travy-trutnov',  label: 'Sekání trávy Trutnov' },
                { href: '/sekani-travy-vrchlabi', label: 'Sekání trávy Vrchlabí' },
                { href: '/sekani-travy-jaromer',  label: 'Sekání trávy Jaroměř' },
                { href: '/sekani-travy-nachod',   label: 'Sekání trávy Náchod' },
                { href: '/sekani-travy-hostinne', label: 'Sekání trávy Hostinné' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-gray-400 hover:text-[#3FA34D] transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} SeknuTo.cz. Všechna práva vyhrazena.
          </p>
          <p className="text-gray-600 text-xs text-center">
            Sekání trávy Dvůr Králové nad Labem · Trutnov · Vrchlabí · Jaroměř · Náchod · Hostinné
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/gdpr" className="text-gray-500 hover:text-gray-300 transition-colors">
              Ochrana osobních údajů
            </Link>
            <Link to="/obchodni-podminky" className="text-gray-500 hover:text-gray-300 transition-colors">
              Obchodní podmínky
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
