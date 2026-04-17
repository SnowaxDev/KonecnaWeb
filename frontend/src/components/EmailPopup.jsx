import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Sparkles, Mail, Loader2, Check, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EmailPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedCoupon = localStorage.getItem('seknuto_coupon');
    const popupClosed = sessionStorage.getItem('seknuto_popup_closed');
    
    if (window.location.pathname === '/rezervace') return;
    if (window.location.pathname.startsWith('/poukaz')) return;
    if (savedCoupon) return;
    if (popupClosed) return;
    
    // Show after 60 seconds
    const timer = setTimeout(() => setIsOpen(true), 400000);

    // Or show on exit-intent (mouse leaves viewport top)
    const handleExitIntent = (e) => {
      if (e.clientY <= 0 && !sessionStorage.getItem('seknuto_popup_closed')) {
        setIsOpen(true);
        document.removeEventListener('mouseout', handleExitIntent);
      }
    };
    document.addEventListener('mouseout', handleExitIntent);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseout', handleExitIntent);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('seknuto_popup_closed', 'true');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Zadejte prosím platný email');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API}/subscribe`, { email });
      setCouponCode(response.data.coupon_code);
      setIsSuccess(true);
      localStorage.setItem('seknuto_coupon', response.data.coupon_code);
      localStorage.setItem('seknuto_email', email);
      toast.success('Slevový kupón byl odeslán na váš email!');
    } catch (error) {
      console.error('Subscription failed:', error);
      toast.error('Něco se pokazilo. Zkuste to prosím znovu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    toast.success('Kód zkopírován!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" data-testid="email-popup">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in-up">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full text-gray-500 hover:text-gray-700 transition-all z-10 shadow-sm"
          aria-label="Zavřít"
          data-testid="popup-close-btn"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="bg-[#3FA34D] px-6 py-8 text-center relative">
              {/* Decorative elements */}
              <div className="absolute top-2 left-2 w-8 h-8 border-2 border-white/20 rounded-full" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-white/20 rounded-full" />
              <div className="absolute top-6 right-8 w-4 h-4 bg-white/20 rounded-full" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-[#3FA34D]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Sleva 5% pro vás!
                </h3>
                <p className="text-white/80 text-sm">
                  Na první objednávku
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-center text-gray-600 mb-5 text-sm">
                Zadejte email a získejte <span className="font-semibold text-[#3FA34D]">slevový kupón</span> přímo do schránky.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vas@email.cz"
                    className="h-12 pl-11 text-base rounded-xl border-2 border-gray-200 focus:border-[#3FA34D] focus:ring-0"
                    data-testid="popup-email-input"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                  data-testid="popup-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Odesílám...
                    </>
                  ) : (
                    'Získat slevu'
                  )}
                </Button>
              </form>

              <p className="text-[11px] text-center text-gray-400 mt-4">
                Bez spamu • Odhlášení kdykoliv
              </p>
              
              <button 
                onClick={handleClose}
                className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-3 underline underline-offset-2"
              >
                Ne, děkuji
              </button>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-[#3FA34D] rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Hotovo! 🎉
            </h3>
            <p className="text-gray-500 text-sm mb-5">
              Kupón odeslán na váš email
            </p>

            {/* Coupon Code Display */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-2">Váš slevový kód:</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold text-[#3FA34D] tracking-wider font-mono">
                  {couponCode}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Kopírovat"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-[#3FA34D]" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Platí pro první objednávku</p>
            </div>

            <Button
              onClick={handleClose}
              className="w-full h-11 bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-xl font-semibold text-sm"
              data-testid="popup-continue-btn"
            >
              Pokračovat
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailPopup;
