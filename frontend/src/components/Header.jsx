import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Leaf } from 'lucide-react';
import { Button } from './ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: '/', label: 'Domů' },
    { href: '/sluzby', label: 'Služby' },
    { href: '/cenik', label: 'Jak to funguje' },
    { href: '/nase-prace', label: 'Naše práce' },
    { href: '/blog', label: 'Blog' },
    { href: '/o-nas', label: 'O nás' },
    { href: '/kontakt', label: 'Kontakt' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-100" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" data-testid="header-logo">
            <div className="w-10 h-10 bg-[#3FA34D] rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-[#222222]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              SeknuTo<span className="text-[#3FA34D]">.cz</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" data-testid="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-[#3FA34D] ${
                  isActive(link.href) ? 'text-[#3FA34D]' : 'text-[#4B5563]'
                }`}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="tel:+420730588372"
              className="flex items-center gap-2 text-sm font-medium text-[#4B5563] hover:text-[#3FA34D] transition-colors"
              data-testid="header-phone"
            >
              <Phone className="w-4 h-4" />
              730 588 372
            </a>
            <Link to="/rezervace">
              <Button 
                className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-6"
                data-testid="header-cta-button"
              >
                Objednat
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-[#222222]"
            data-testid="mobile-menu-button"
            aria-label={isMenuOpen ? 'Zavřít menu' : 'Otevřít menu'}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100" data-testid="mobile-nav">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-base font-medium py-2 ${
                    isActive(link.href) ? 'text-[#3FA34D]' : 'text-[#4B5563]'
                  }`}
                  data-testid={`mobile-nav-link-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                <a
                  href="tel:+420730588372"
                  className="flex items-center gap-2 text-base font-medium text-[#3FA34D]"
                  data-testid="mobile-phone"
                >
                  <Phone className="w-5 h-5" />
                  730 588 372
                </a>
                <Link to="/rezervace" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    className="w-full bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full"
                    data-testid="mobile-cta-button"
                  >
                    Objednat online
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
