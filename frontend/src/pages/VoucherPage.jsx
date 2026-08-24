import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Gift, Sparkles, Clock, ArrowRight, AlertCircle } from 'lucide-react';
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
  const [claiming, setClaiming] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [expiry24hDate, setExpiry24hDate] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/vouchers/${code}`, { timeout: 30000 });
        if (cancelled) return;
        if (res.data && res.data.is_valid) {
          setVoucher(res.data);
          setError(null);
        } else {
          setVoucher(null);
          setError(res.data?.validation_error || 'Tento poukaz už není platný.');
        }
      } catch (err) {
        if (cancelled) return;
        setVoucher(null);
        setError('Tento poukaz neexistuje nebo už není platný.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [code]);

  // Dekorativní konfety + 24h odpočet – jen pro platný poukaz
  useEffect(() => {
    if (!voucher || !voucher.is_valid) return;
    const t = setTimeout(() => {
      try { confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } }); } catch { /* noop */ }
    }, 400);

    let interval;
    try {
      const key = `voucher_opened_${voucher.code}`;
      let openedAt = localStorage.getItem(key);
      if (!openedAt) { openedAt = new Date().toISOString(); localStorage.setItem(key, openedAt); }
      const expiry = new Date(openedAt).getTime() + 24 * 60 * 60 * 1000;
      setExpiry24hDate(new Date(expiry));
      const tick = () => {
        const d = expiry - Date.now();
        setCountdown(d > 0 ? {
          hours: Math.floor(d / 3600000),
          minutes: Math.floor((d % 3600000) / 60000),
          seconds: Math.floor((d % 60000) / 1000),
        } : { hours: 0, minutes: 0, seconds: 0 });
      };
      tick();
      interval = setInterval(tick, 1000);
    } catch { /* localStorage může být blokované */ }

    return () => { clearTimeout(t); if (interval) clearInterval(interval); };
  }, [voucher]);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await axios.post(`${API}/vouchers/${code}/claim`);
      try {
        localStorage.setItem('active_voucher', JSON.stringify({
          code: voucher.code, discount_type: voucher.discount_type,
          discount_value: voucher.discount_value, display_discount: voucher.display_discount,
          description: voucher.description,
        }));
      } catch { /* noop */ }
      navigate('/rezervace?voucher=' + voucher.code + '&auto_apply=true');
    } catch (err) {
      setError(err.response?.data?.detail || 'Nepodařilo se uplatnit poukaz');
      setClaiming(false);
    }
  };

  // 1) Načítání
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-12 h-12 border-4 border-[#3FA34D] border-t-transparent rounded-full" />
      </div>
    );
  }

  // 2) Neplatný / neexistující poukaz – vždy viditelná hláška
  if (!voucher || !voucher.is_valid) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Poukaz nenalezen</h1>
          <p className="text-gray-600 mb-6">{error || 'Tento poukaz neexistuje nebo už není platný. Zkontrolujte prosím odkaz.'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/rezervace')} className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-6">
              Nezávazná poptávka
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="rounded-full px-6">
              Zpět na web
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3) Platný poukaz – karta se vždy vykreslí
  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-[#1B4332] to-[#2D6A4F] py-12 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-[#52B788] to-[#2D6A4F] rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
          <Gift className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-[#1B4332] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {voucher.display_name || 'Váš poukaz'}
        </h1>
        <p className="text-gray-500 mb-6">Speciální nabídka jen pro vás 🎉</p>

        {/* Sleva */}
        <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] rounded-2xl p-6 mb-5">
          <p className="text-[#8fe0a6] text-xs uppercase tracking-widest mb-2">Získáváte</p>
          <p className="text-5xl font-extrabold text-white mb-1">{voucher.display_discount}</p>
          <p className="text-white/80 text-sm">{voucher.description}</p>
          <p className="mt-3 font-mono text-lg tracking-[0.3em] text-[#8fe0a6]">{voucher.code}</p>
        </div>

        {/* Odpočet 24 h */}
        {countdown && (
          <div className="flex justify-center gap-5 mb-4">
            {[['hodin', countdown.hours], ['minut', countdown.minutes], ['sekund', countdown.seconds]].map(([l, v]) => (
              <div key={l} className="text-center">
                <span className="text-2xl font-bold text-[#1B4332] block tabular-nums">{String(v).padStart(2, '0')}</span>
                <span className="text-[11px] text-gray-500 uppercase">{l}</span>
              </div>
            ))}
          </div>
        )}
        {expiry24hDate && (
          <p className="text-sm text-[#FF6B35] mb-5">
            <Clock className="w-4 h-4 inline mr-1" />
            Platí 24 h od otevření – do {expiry24hDate.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}

        <Button
          onClick={handleClaim}
          disabled={claiming}
          className="w-full h-14 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] hover:from-[#FF6B35] hover:to-[#FF8C42] text-white rounded-xl text-lg font-bold shadow-lg transition-all"
        >
          {claiming ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Zpracovávám…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" /> Uplatnit poukaz a objednat <ArrowRight className="w-5 h-5" />
            </span>
          )}
        </Button>

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">
          Poukaz lze uplatnit jednou · platí pro nové i stávající zákazníky · nelze kombinovat s jinými slevami.
        </p>
      </div>
    </div>
  );
};

export default VoucherPage;
