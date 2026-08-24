import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Poukaz = tenká přesměrovací stránka: platný kód rovnou otevře rezervaci
// s předvyplněnou slevou; neplatný ukáže hlášku. Žádná složitá karta = nic se
// nemůže "rozbít" do prázdna.
const VoucherPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const go = async () => {
      try {
        const res = await axios.get(`${API}/vouchers/${code}`, { timeout: 30000 });
        if (cancelled) return;
        const v = res.data;
        if (v && v.is_valid) {
          try {
            localStorage.setItem('active_voucher', JSON.stringify({
              code: v.code,
              discount_type: v.discount_type,
              discount_value: v.discount_value,
              display_discount: v.display_discount,
              description: v.description,
            }));
          } catch { /* localStorage může být blokované */ }
          navigate(`/rezervace?voucher=${encodeURIComponent(v.code)}&auto_apply=true`, { replace: true });
        } else {
          setError(v?.validation_error || 'Tento poukaz už není platný.');
        }
      } catch {
        if (!cancelled) setError('Tento poukaz neexistuje nebo už není platný.');
      }
    };
    go();
    return () => { cancelled = true; };
  }, [code, navigate]);

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Poukaz nenalezen</h1>
          <p className="text-gray-600 mb-6">{error} Zkontrolujte prosím odkaz, nebo nám rovnou napište nezávaznou poptávku.</p>
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

  // Načítání / přesměrování
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="animate-spin w-12 h-12 border-4 border-[#3FA34D] border-t-transparent rounded-full" />
      <p className="text-gray-500 text-sm">Otevíráme vaši slevu…</p>
    </div>
  );
};

export default VoucherPage;
