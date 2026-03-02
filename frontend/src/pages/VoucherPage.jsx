import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, Gift, Sparkles, Clock, ArrowRight, X, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import confetti from 'canvas-confetti';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VoucherPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [voucher, setVoucher] = useState(null);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 59, seconds: 59 });
  const [expiry24hDate, setExpiry24hDate] = useState(null);

  useEffect(() => {
    loadVoucher();
  }, [code]);

  useEffect(() => {
    if (voucher && voucher.is_valid) {
      // Trigger confetti
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 500);
      
      setShowPopup(true);
      
      // 24h countdown from NOW (not from valid_until)
      const storageKey = `voucher_opened_${voucher.code}`;
      let openedAt = localStorage.getItem(storageKey);
      if (!openedAt) {
        openedAt = new Date().toISOString();
        localStorage.setItem(storageKey, openedAt);
      }
      const expiry24h = new Date(openedAt).getTime() + 24 * 60 * 60 * 1000;
      setExpiry24hDate(new Date(expiry24h));
      
      const updateCountdown = () => {
        const now = Date.now();
        const distance = expiry24h - now;
        
        if (distance > 0) {
          setCountdown({
            hours: Math.floor(distance / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
          });
        } else {
          setCountdown({ hours: 0, minutes: 0, seconds: 0 });
        }
      };
      
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [voucher]);

  const loadVoucher = async () => {
    try {
      const response = await axios.get(`${API}/vouchers/${code}`);
      setVoucher(response.data);
      
      if (!response.data.is_valid) {
        setError(response.data.validation_error || 'Poukaz není platný');
      }
    } catch (err) {
      setError('Poukaz nebyl nalezen');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const response = await axios.post(`${API}/vouchers/${code}/claim`);
      
      // Store voucher in localStorage
      localStorage.setItem('active_voucher', JSON.stringify({
        code: voucher.code,
        discount_type: voucher.discount_type,
        discount_value: voucher.discount_value,
        display_discount: voucher.display_discount,
        description: voucher.description
      }));
      
      // Redirect to booking
      navigate('/rezervace?voucher=' + voucher.code + '&auto_apply=true');
    } catch (err) {
      setError(err.response?.data?.detail || 'Nepodařilo se uplatnit poukaz');
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1B4332]">
        <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && !voucher?.is_valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Poukaz není platný</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => navigate('/')}
            className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-6"
          >
            Zpět na hlavní stránku
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-[#1B4332] to-[#2D6A4F]">
      {/* Popup Overlay */}
      {showPopup && voucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B4332]/95 backdrop-blur-sm animate-fade-in">
          {/* Popup */}
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative animate-scale-in">
            {/* Close button */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-[#52B788] to-[#2D6A4F] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse-slow">
              <Check className="w-12 h-12 text-white" />
            </div>

            {/* Headline */}
            <h1 className="text-3xl font-bold text-center text-[#1B4332] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              🎉 <span className="bg-gradient-to-r from-[#FFB800] to-[#FF8C42] bg-clip-text text-transparent">Gratulujeme!</span> 🎉
            </h1>

            <p className="text-center text-gray-600 mb-6">
              Váš poukaz byl úspěšně aktivován a čeká na vás speciální nabídka!
            </p>

            {/* Discount Box */}
            <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] rounded-2xl p-6 mb-6 text-center">
              <p className="text-[#52B788] text-sm uppercase tracking-wide mb-2">Získáváte</p>
              <p className="text-4xl font-bold text-white mb-2">{voucher.display_discount}</p>
              <p className="text-white/80">{voucher.description}</p>
            </div>

            {/* Countdown */}
            {voucher.has_expiration && (
              <div className="flex justify-center gap-4 mb-6">
                <div className="text-center">
                  <span className="text-2xl font-bold text-[#1B4332] block">{String(countdown.hours).padStart(2, '0')}</span>
                  <span className="text-xs text-gray-500 uppercase">hodin</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-[#1B4332] block">{String(countdown.minutes).padStart(2, '0')}</span>
                  <span className="text-xs text-gray-500 uppercase">minut</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-[#1B4332] block">{String(countdown.seconds).padStart(2, '0')}</span>
                  <span className="text-xs text-gray-500 uppercase">sekund</span>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-[#FF6B35] mb-4">
              <Clock className="w-4 h-4 inline mr-1" />
              Nabídka platí 24h od prvního otevření – do:{' '}
              {expiry24hDate ? expiry24hDate.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : '...'}
            </p>

            {/* CTA Button */}
            <Button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full h-14 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] hover:from-[#FF6B35] hover:to-[#FF8C42] text-white rounded-xl text-lg font-bold uppercase tracking-wide shadow-lg hover:shadow-xl transition-all animate-pulse-subtle"
            >
              {claiming ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Zpracovávám...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🚀 Uplatnit poukaz a objednat
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>

            {/* Terms */}
            <p className="text-center text-xs text-gray-500 mt-4 leading-relaxed">
              * Poukaz lze uplatnit pouze jednou.<br />
              * Platí pro nové i stávající zákazníky.<br />
              * Nelze kombinovat s jinými slevami.
            </p>
          </div>
        </div>
      )}

      {/* Background Content (visible when popup is closed) */}
      {!showPopup && voucher && (
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-[#3FA34D] rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {voucher.display_name}
            </h1>
            
            <p className="text-gray-600 mb-6">Klikněte níže pro zobrazení vaší slevy</p>
            
            <Button
              onClick={() => setShowPopup(true)}
              className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-8 h-12 text-lg font-semibold"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Zobrazit poukaz
            </Button>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes pulse-subtle {
          0%, 100% { box-shadow: 0 4px 14px rgba(255, 140, 66, 0.4); }
          50% { box-shadow: 0 8px 24px rgba(255, 140, 66, 0.6); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-scale-in { animation: scale-in 0.6s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        .animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default VoucherPage;
