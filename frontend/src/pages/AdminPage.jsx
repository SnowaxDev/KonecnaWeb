import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import SEOHead from '../components/SEOHead';
import {
  LayoutDashboard, Ticket, Tag, ClipboardList, LogOut,
  Plus, Trash2, Check, X, RefreshCw, Eye, EyeOff, Copy,
  TrendingUp, Users, Leaf, CreditCard, ChevronDown, ChevronUp,
  Calendar, Phone, Mail, MapPin, Edit3, FileText, Bold, Italic, Image,
  MessageSquare, Upload, CheckCheck, Archive, ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// Parse FastAPI/Pydantic validation errors (detail can be array or string)
const parseError = (err) => {
  const detail = err?.response?.data?.detail;
  if (!detail) return 'Neznámá chyba';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map(e => `${e.loc?.slice(-1)[0] || ''}: ${e.msg}`).join(', ');
  }
  return JSON.stringify(detail);
};

// Returns true if error is 401 Unauthorized
const isUnauthorized = (err) => err?.response?.status === 401;
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SERVICE_NAMES = {
  lawn_mowing: 'Sekání trávy',
  lawn_with_fertilizer: 'Sekání + hnojení',
  overgrown: 'Hrubé sekání',
  spring_package: 'Jarní balíček',
  summer_package: 'Letní balíček',
  autumn_package: 'Podzimní balíček',
  winter_snow: 'Zimní balíček',
  vip_annual: 'VIP Celoroční',
  land_clearing: 'Likvidace a čištění pozemků',
  tree_shrub_care: 'Stříhání keřů a kácení stromů',
  garden_work: 'Zahradnické práce',
  debris_hourly: 'Odvoz odpadu',
  other: 'Jiná služba',
  custom_order: 'Práce na objednávku',
};

const STATUS_LABELS = {
  pending: { label: 'Čeká', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  confirmed: { label: 'Potvrzeno', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  completed: { label: 'Dokončeno', color: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Zrušeno', color: 'bg-red-100 text-red-800 border-red-200' },
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/admin/login`, { password });
      localStorage.setItem('admin_token', res.data.token);
      onLogin(res.data.token);
    } catch {
      toast.error('Nesprávné heslo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1B4332] flex items-center justify-center p-4">
      <SEOHead title="Admin | SeknuTo.cz" description="Admin panel" noindex={true} />
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#3FA34D] rounded-full flex items-center justify-center">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              SeknuTo<span className="text-[#3FA34D]">.cz</span>
            </h1>
            <p className="text-xs text-gray-500">Admin dashboard</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700">Heslo</Label>
            <div className="relative mt-1">
              <Input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-2 pr-10"
                placeholder="Zadejte admin heslo"
                data-testid="admin-password-input"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading || !password}
            className="w-full h-12 bg-[#3FA34D] hover:bg-[#2d7a38] rounded-xl font-semibold"
            data-testid="admin-login-btn"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
            Přihlásit se
          </Button>
        </form>
      </div>
    </div>
  );
};

// ─── STATS CARD ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{value}</p>
  </div>
);

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
const OverviewTab = ({ token, handle401 }) => {
  const [stats, setStats] = useState(null);
  const [newMessages, setNewMessages] = useState(0);
  const headers = { 'X-Admin-Token': token };

  useEffect(() => {
    axios.get(`${API}/admin/stats`, { headers })
      .then(r => setStats(r.data))
      .catch(err => { if (!handle401(err)) console.error(err); });
    axios.get(`${API}/admin/contact`, { headers })
      .then(r => setNewMessages(r.data.filter(m => m.status === 'new').length))
      .catch(() => {}); // non-critical
  }, []); // eslint-disable-line

  if (!stats) return <div className="flex justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-[#3FA34D]" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={ClipboardList} label="Objednávek celkem" value={stats.total_bookings} color="bg-[#3FA34D]" />
        <StatCard icon={Calendar} label="Čeká na potvrzení" value={stats.pending_bookings} color="bg-amber-500" />
        <StatCard icon={MessageSquare} label="Nových zpráv" value={newMessages} color="bg-blue-500" />
        <StatCard icon={Ticket} label="Aktivních poukazů" value={stats.active_vouchers} color="bg-purple-500" />
        <StatCard icon={Users} label="Odběratelů" value={stats.total_subscribers} color="bg-[#1B4332]" />
        <StatCard icon={TrendingUp} label="Odhadovaný obrat" value={`${stats.total_revenue_estimate.toLocaleString('cs-CZ')} Kč`} color="bg-emerald-600" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Rychlé akce</h3>
        <p className="text-sm text-gray-500 mb-4">Nejčastěji používané funkce</p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <a href="/admin#vouchers" className="flex items-center gap-3 p-3 rounded-lg border-2 border-[#3FA34D]/30 bg-[#F0FDF4] hover:border-[#3FA34D] transition-colors">
            <Ticket className="w-5 h-5 text-[#3FA34D]" />
            <span className="text-sm font-medium text-[#1B4332]">Nový poukaz</span>
          </a>
          <a href="/admin#coupons" className="flex items-center gap-3 p-3 rounded-lg border-2 border-blue-200 bg-blue-50 hover:border-blue-400 transition-colors">
            <Tag className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Nový kupón</span>
          </a>
          <a href="/admin#bookings" className="flex items-center gap-3 p-3 rounded-lg border-2 border-amber-200 bg-amber-50 hover:border-amber-400 transition-colors">
            <ClipboardList className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Objednávky</span>
          </a>
          <a href="/admin#contact" className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${newMessages > 0 ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-gray-400'}`}>
            <MessageSquare className={`w-5 h-5 ${newMessages > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${newMessages > 0 ? 'text-blue-800' : 'text-gray-600'}`}>
              Zprávy {newMessages > 0 && <span className="ml-1 bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{newMessages}</span>}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

// ─── VOUCHERS TAB ─────────────────────────────────────────────────────────────
const VouchersTab = ({ token, handle401 }) => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    code: '', display_name: '', discount_type: 'percentage', discount_value: 20,
    max_uses: 1, valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    campaign_name: '', flyer_batch: ''
  });
  const headers = { 'X-Admin-Token': token };
  const appUrl = window.location.origin;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/vouchers`, { headers });
      setVouchers(res.data);
    } catch (err) {
      if (!handle401(err)) toast.error('Nepodařilo se načíst poukazů');
    }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        ...form,
        code: form.code.trim() || undefined,
        display_name: form.display_name.trim(),
        discount_value: Number(form.discount_value),
        max_uses: Number(form.max_uses),
        valid_from: new Date(form.valid_from).toISOString(),
        valid_until: new Date(form.valid_until + 'T23:59:59').toISOString(),
      };
      await axios.post(`${API}/vouchers`, payload, { headers });
      toast.success('Poukaz vytvořen!');
      setForm(f => ({ ...f, code: '', display_name: '', campaign_name: '', flyer_batch: '' }));
      load();
    } catch (err) {
      if (!handle401(err)) toast.error(parseError(err));
    } finally { setCreating(false); }
  };

  const handleDeactivate = async (code) => {
    try {
      await axios.delete(`${API}/vouchers/${code}`, { headers });
      toast.success('Poukaz deaktivován');
      load();
    } catch (err) { if (!handle401(err)) toast.error('Chyba'); }
  };

  const copyUrl = (code) => {
    navigator.clipboard.writeText(`${appUrl}/poukaz/${code}`);
    toast.success('URL zkopírována!');
  };

  const statusColor = {
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-600 border-gray-200',
    expired: 'bg-red-100 text-red-700 border-red-200',
    exhausted: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  const statusLabel = { active: 'Aktivní', inactive: 'Neaktivní', expired: 'Expirovaný', exhausted: 'Vyčerpaný' };

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] px-5 py-4">
          <h3 className="text-white font-semibold flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <Plus className="w-5 h-5" /> Vytvořit nový poukaz
          </h3>
        </div>
        <form onSubmit={handleCreate} className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Kód (nebo nechte prázdné)</Label>
            <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              className="mt-1 h-10 uppercase" placeholder="Auto-generovaný" data-testid="voucher-code-input" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Název poukazu *</Label>
            <Input value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
              className="mt-1 h-10" placeholder="např. Letní sleva 20 %" required data-testid="voucher-name-input" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Typ slevy</Label>
            <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))}
              className="mt-1 h-10 w-full rounded-md border border-gray-200 px-3 text-sm bg-white" data-testid="voucher-type-select">
              <option value="percentage">Procento (%)</option>
              <option value="fixed_amount">Pevná částka (Kč)</option>
            </select>
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Hodnota slevy {form.discount_type === 'percentage' ? '(%)' : '(Kč)'}
            </Label>
            <Input type="number" value={form.discount_value} min="1"
              onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))}
              className="mt-1 h-10" required data-testid="voucher-value-input" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Max. použití</Label>
            <Input type="number" value={form.max_uses} min="1"
              onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
              className="mt-1 h-10" required data-testid="voucher-max-uses-input" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Platnost od</Label>
            <Input type="date" value={form.valid_from}
              onChange={e => setForm(f => ({ ...f, valid_from: e.target.value }))}
              className="mt-1 h-10" required />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Platnost do</Label>
            <Input type="date" value={form.valid_until}
              onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
              className="mt-1 h-10" required />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Kampaň (interní)</Label>
            <Input value={form.campaign_name} onChange={e => setForm(f => ({ ...f, campaign_name: e.target.value }))}
              className="mt-1 h-10" placeholder="např. Letáky 2025" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Dávka letáků</Label>
            <Input value={form.flyer_batch} onChange={e => setForm(f => ({ ...f, flyer_batch: e.target.value }))}
              className="mt-1 h-10" placeholder="např. Batch A" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
            <Button type="submit" disabled={creating}
              className="bg-[#3FA34D] hover:bg-[#2d7a38] rounded-full px-8 h-10"
              data-testid="create-voucher-btn">
              {creating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Vytvořit poukaz
            </Button>
          </div>
        </form>
      </div>

      {/* Vouchers list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Poukazů ({vouchers.length})
          </h3>
          <Button variant="outline" size="sm" onClick={load} className="h-8">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Obnovit
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><RefreshCw className="w-6 h-6 animate-spin text-[#3FA34D]" /></div>
        ) : vouchers.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-sm">Žádné poukazů</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {vouchers.map(v => (
              <div key={v.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-[#1B4332] font-mono tracking-wider text-sm">{v.code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor[v.status] || 'bg-gray-100'}`}>
                        {statusLabel[v.status] || v.status}
                      </span>
                      <span className="text-xs bg-[#3FA34D]/10 text-[#1B4332] px-2 py-0.5 rounded-full font-semibold">
                        {v.discount_type === 'percentage' ? `${v.discount_value}%` : `${v.discount_value} Kč`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{v.display_name}</p>
                    <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
                      <span>Použití: {v.uses_count}/{v.max_uses}</span>
                      <span>Do: {new Date(v.valid_until).toLocaleDateString('cs-CZ')}</span>
                      {v.campaign_name && <span>Kampaň: {v.campaign_name}</span>}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-400 truncate max-w-xs">{appUrl}/poukaz/{v.code}</span>
                      <button onClick={() => copyUrl(v.code)} className="text-[#3FA34D] hover:text-[#2d7a38]">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {v.status === 'active' && (
                    <button onClick={() => handleDeactivate(v.code)}
                      className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                      title="Deaktivovat">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── COUPONS TAB ──────────────────────────────────────────────────────────────
const CouponsTab = ({ token, handle401 }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ code: '', discount_percent: 10, description: '' });
  const headers = { 'X-Admin-Token': token };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/coupons`, { headers });
      setCoupons(res.data);
    } catch (err) { if (!handle401(err)) toast.error('Nepodařilo se načíst kupóny'); }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await axios.post(`${API}/admin/coupons`, {
        code: form.code || undefined,
        discount_percent: Number(form.discount_percent),
        description: form.description,
      }, { headers });
      toast.success('Kupón vytvořen!');
      setForm({ code: '', discount_percent: 10, description: '' });
      load();
    } catch (err) {
      if (!handle401(err)) toast.error(parseError(err));
    } finally { setCreating(false); }
  };

  const handleDelete = async (code) => {
    try {
      await axios.delete(`${API}/admin/coupons/${code}`, { headers });
      toast.success('Kupón deaktivován');
      load();
    } catch (err) { if (!handle401(err)) toast.error('Chyba'); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Kód zkopírován!');
  };

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-5 py-4">
          <h3 className="text-white font-semibold flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <Plus className="w-5 h-5" /> Vytvořit slevový kupón
          </h3>
        </div>
        <form onSubmit={handleCreate} className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Kód (nebo nechte prázdné)</Label>
            <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              className="mt-1 h-10 uppercase" placeholder="Auto-generovaný" data-testid="coupon-code-input" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sleva (%)</Label>
            <Input type="number" value={form.discount_percent} min="1" max="100"
              onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))}
              className="mt-1 h-10" required data-testid="coupon-percent-input" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Popis (volitelné)</Label>
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="mt-1 h-10" placeholder="Sleva pro nové zákazníky" />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <Button type="submit" disabled={creating}
              className="bg-blue-600 hover:bg-blue-700 rounded-full px-8 h-10"
              data-testid="create-coupon-btn">
              {creating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Vytvořit kupón
            </Button>
          </div>
        </form>
      </div>

      {/* Coupons list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Kupóny ({coupons.length})
          </h3>
          <Button variant="outline" size="sm" onClick={load} className="h-8">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Obnovit
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><RefreshCw className="w-6 h-6 animate-spin text-[#3FA34D]" /></div>
        ) : coupons.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-sm">Žádné kupóny</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {coupons.map(c => (
              <div key={c.id} className="px-5 py-4 hover:bg-gray-50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg px-4 py-2 shrink-0">
                    <span className="font-bold font-mono text-blue-800 tracking-wider text-sm">{c.code}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{c.description || `Sleva ${c.discount_percent}%`}</p>
                    <p className="text-xs text-gray-400">
                      Sleva: {c.discount_percent}% &nbsp;•&nbsp; Použití: {c.uses_count || 0}× &nbsp;•&nbsp;
                      {c.active ? <span className="text-green-600">Aktivní</span> : <span className="text-red-500">Neaktivní</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => copyCode(c.code)} className="text-blue-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50" title="Kopírovat kód">
                    <Copy className="w-4 h-4" />
                  </button>
                  {c.active && (
                    <button onClick={() => handleDelete(c.code)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50" title="Deaktivovat">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── BOOKINGS TAB ─────────────────────────────────────────────────────────────
const BookingsTab = ({ token, handle401 }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [emailModal, setEmailModal] = useState(null); // booking object or null
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const headers = { 'X-Admin-Token': token };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/bookings`, { headers });
      // Handle both old array format and new paginated format
      setBookings(Array.isArray(res.data) ? res.data : res.data.bookings || []);
    } catch (err) { if (!handle401(err)) toast.error('Nepodařilo se načíst objednávky'); }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await axios.patch(`${API}/admin/bookings/${id}/status`, { status }, { headers });
      toast.success('Status aktualizován');
      load();
    } catch (err) { if (!handle401(err)) toast.error('Chyba'); }
    finally { setUpdatingId(null); }
  };

  const openEmailModal = (booking) => {
    setEmailModal(booking);
    setEmailSubject(`Informace k vaší poptávce – SeknuTo.cz`);
    setEmailMessage('');
  };

  const sendCustomEmail = async () => {
    if (!emailModal || !emailMessage.trim()) {
      toast.error('Vyplňte zprávu');
      return;
    }
    setSendingEmail(true);
    try {
      await axios.post(`${API}/admin/bookings/${emailModal.id}/email`, {
        booking_id: emailModal.id,
        subject: emailSubject,
        message: emailMessage,
      }, { headers });
      toast.success(`Email odeslán na ${emailModal.customer_email}`);
      setEmailModal(null);
    } catch (err) {
      if (!handle401(err)) toast.error(err.response?.data?.detail || 'Nepodařilo se odeslat email');
    } finally { setSendingEmail(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Celkem {bookings.length} objednávek</p>
        <Button variant="outline" size="sm" onClick={load} className="h-8">
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Obnovit
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><RefreshCw className="w-6 h-6 animate-spin text-[#3FA34D]" /></div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-500 text-sm">Žádné objednávky</div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => {
            const isOpen = expanded === b.id;
            const s = STATUS_LABELS[b.status] || STATUS_LABELS.pending;
            return (
              <div key={b.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : b.id)}
                  data-testid={`booking-row-${b.id}`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="text-left min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{b.customer_name}</p>
                      <p className="text-xs text-gray-500 truncate">{SERVICE_NAMES[b.service] || b.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-[#3FA34D] text-sm whitespace-nowrap">
                      {b.estimated_price > 0 ? `~${b.estimated_price.toLocaleString('cs-CZ')} Kč` : 'Po obhlídce'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${s.color}`}>{s.label}</span>
                    <span className="text-xs text-gray-400 hidden sm:block whitespace-nowrap">
                      {new Date(b.created_at).toLocaleDateString('cs-CZ')}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-gray-100 bg-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <a href={`tel:${b.customer_phone}`} className="hover:text-[#3FA34D]">{b.customer_phone}</a>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <a href={`mailto:${b.customer_email}`} className="hover:text-[#3FA34D] truncate">{b.customer_email}</a>
                        </div>
                        <div className="flex items-start gap-2 text-gray-600">
                          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{b.property_address}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>{b.preferred_date} · {b.preferred_time}</span>
                        </div>
                        <div className="text-gray-600">
                          <span className="font-medium">Plocha:</span> {b.property_size > 0 ? `~${b.property_size} m²` : 'Neuvedeno'}
                        </div>
                        {b.notes && (
                          <div className="text-gray-600">
                            <span className="font-medium">Poznámka:</span> {b.notes}
                          </div>
                        )}
                        {b.coupon_code && (
                          <div className="text-green-700">
                            <span className="font-medium">Kupón:</span> {b.coupon_code}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 flex-wrap">
                      <span className="text-xs text-gray-500 font-medium mr-2">Změnit status:</span>
                      {['pending', 'confirmed', 'completed', 'cancelled'].map(st => (
                        <button
                          key={st}
                          onClick={() => updateStatus(b.id, st)}
                          disabled={b.status === st || updatingId === b.id}
                          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                            b.status === st
                              ? (STATUS_LABELS[st]?.color || '') + ' opacity-100'
                              : 'border-gray-200 text-gray-500 hover:border-gray-400'
                          }`}
                        >
                          {updatingId === b.id && b.status !== st ? <RefreshCw className="w-3 h-3 animate-spin inline mr-1" /> : null}
                          {STATUS_LABELS[st]?.label || st}
                        </button>
                      ))}
                      <button
                        onClick={() => openEmailModal(b)}
                        className="text-xs px-3 py-1.5 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium transition-all ml-auto"
                        data-testid={`email-btn-${b.id}`}
                      >
                        <Mail className="w-3 h-3 inline mr-1" />
                        Poslat email
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Email Modal */}
      {emailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" data-testid="email-modal">
            <div className="bg-[#3FA34D] px-6 py-4">
              <h3 className="text-white font-bold">Poslat email zákazníkovi</h3>
              <p className="text-white/70 text-xs">{emailModal.customer_name} – {emailModal.customer_email}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Předmět</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#3FA34D] focus:outline-none"
                  data-testid="email-subject-input"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Zpráva</label>
                <textarea
                  value={emailMessage}
                  onChange={e => setEmailMessage(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#3FA34D] focus:outline-none resize-none"
                  placeholder="Napište zprávu zákazníkovi..."
                  data-testid="email-message-input"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setEmailModal(null)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Zrušit
                </button>
                <button
                  onClick={sendCustomEmail}
                  disabled={sendingEmail || !emailMessage.trim()}
                  className="px-4 py-2 text-sm bg-[#3FA34D] text-white rounded-lg hover:bg-[#2d7a38] disabled:opacity-50 font-medium"
                  data-testid="email-send-btn"
                >
                  {sendingEmail ? 'Odesílám...' : 'Odeslat email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 

// ─── GALLERY TAB ──────────────────────────────────────────────────────────────
const GALLERY_CATEGORIES = ['Sekání', 'Hrubé sekání', 'Jarní balíček', 'Letní balíček', 'Podzimní balíček', 'Zahradní práce', 'Jiné'];

const GalleryTab = ({ token, handle401 }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [previewBefore, setPreviewBefore] = useState(false);
  const [previewAfter, setPreviewAfter] = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const beforeFileRef = useRef(null);
  const afterFileRef = useRef(null);
  const [form, setForm] = useState({
    title: '', category: 'Sekání', location: '', date: '',
    description: '', before_image: '', after_image: '', published: true,
  });
  const headers = { 'X-Admin-Token': token };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/gallery/projects`, { headers });
      setProjects(res.data);
    } catch (err) { if (!handle401(err)) toast.error('Nepodařilo se načíst projekty'); }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  // Upload image file → backend /admin/gallery/upload
  const uploadFile = async (file, field) => {
    const isB = field === 'before_image';
    if (isB) setUploadingBefore(true); else setUploadingAfter(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API}/admin/gallery/upload`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });
      // Backend returns base64 data URL directly – no prefix needed
      const imageUrl = res.data.url;
      setForm(f => ({ ...f, [field]: imageUrl }));
      toast.success('Fotka nahrána!');
    } catch (err) {
      if (!handle401(err)) toast.error(parseError(err) || 'Nepodařilo se nahrát fotku');
    } finally {
      if (isB) setUploadingBefore(false); else setUploadingAfter(false);
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) uploadFile(file, field);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.before_image || !form.after_image) {
      toast.error('Nahrajte nebo zadejte URL pro fotku PŘED i PO');
      return;
    }
    setCreating(true);
    try {
      if (editProject) {
        await axios.patch(`${API}/admin/gallery/projects/${editProject.id}`, form, { headers });
        toast.success('Projekt aktualizován!');
        setEditProject(null);
      } else {
        await axios.post(`${API}/admin/gallery/projects`, form, { headers });
        toast.success('Projekt přidán!');
      }
      setForm({ title: '', category: 'Sekání', location: '', date: '', description: '', before_image: '', after_image: '', published: true });
      setPreviewBefore(false);
      setPreviewAfter(false);
      load();
    } catch (err) {
      if (!handle401(err)) toast.error(parseError(err));
    } finally { setCreating(false); }
  };

  const handleEdit = (p) => {
    setEditProject(p);
    setForm({
      title: p.title, category: p.category || 'Sekání', location: p.location || '',
      date: p.date || '', description: p.description || '',
      before_image: p.before_image || '', after_image: p.after_image || '', published: p.published,
    });
    setPreviewBefore(false);
    setPreviewAfter(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Smazat projekt z galerie?')) return;
    try {
      await axios.delete(`${API}/admin/gallery/projects/${id}`, { headers });
      toast.success('Projekt smazán');
      load();
    } catch (err) { if (!handle401(err)) toast.error('Chyba'); }
  };

  // Reusable image input with upload button
  const ImageInputField = ({ label, field, uploading, fileRef, required }) => (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label} {required && '*'}
      </Label>
      <div className="flex gap-2">
        <Input
          value={form[field]}
          onChange={e => { setForm(f => ({ ...f, [field]: e.target.value })); }}
          className="h-10 flex-1 text-sm"
          placeholder="https://... nebo nahrajte soubor →"
          data-testid={`gallery-${field === 'before_image' ? 'before' : 'after'}-input`}
        />
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileRef}
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={e => handleFileChange(e, field)}
        />
        {/* Upload button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 shrink-0 border-[#3FA34D] text-[#3FA34D] hover:bg-[#F0FDF4]"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          data-testid={`upload-${field === 'before_image' ? 'before' : 'after'}-btn`}
        >
          {uploading
            ? <RefreshCw className="w-4 h-4 animate-spin" />
            : <><Upload className="w-4 h-4 mr-1" /> Nahrát</>
          }
        </Button>
        {/* Preview toggle */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 shrink-0"
          onClick={() => field === 'before_image' ? setPreviewBefore(v => !v) : setPreviewAfter(v => !v)}
          disabled={!form[field]}
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>
      {/* Image preview */}
      {((field === 'before_image' && previewBefore) || (field === 'after_image' && previewAfter)) && form[field] && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
          <img src={form[field]} alt={label} className="w-full h-full object-cover" onError={() => toast.error('Fotka nenačtena – zkontrolujte URL')} />
          <span className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded ${field === 'before_image' ? 'bg-red-500' : 'bg-[#3FA34D]'}`}>
            {field === 'before_image' ? 'PŘED' : 'PO'}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Create/Edit form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className={`px-5 py-4 ${editProject ? 'bg-gradient-to-r from-blue-700 to-blue-500' : 'bg-gradient-to-r from-[#1B4332] to-[#2D6A4F]'}`}>
          <h3 className="text-white font-semibold flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <Image className="w-5 h-5" />
            {editProject ? `Upravit: ${editProject.title}` : 'Přidat projekt Před/Po'}
          </h3>
        </div>
        <form onSubmit={handleCreate} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Název projektu *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="mt-1 h-10" required placeholder="Přerostlá zahrada → nový trávník" data-testid="gallery-title-input" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Kategorie</Label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, tag: e.target.value }))}
                className="mt-1 h-10 w-full rounded-md border border-gray-200 px-3 text-sm bg-white">
                {GALLERY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Lokalita</Label>
              <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="mt-1 h-10" placeholder="Dvůr Králové n. L." />
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Datum</Label>
              <Input value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="mt-1 h-10" placeholder="Říjen 2024" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Popis projektu</Label>
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="mt-1 h-10" placeholder="Krátký popis co bylo uděláno" />
          </div>

          {/* Before image with upload */}
          <ImageInputField
            label="Fotka PŘED"
            field="before_image"
            uploading={uploadingBefore}
            fileRef={beforeFileRef}
            required
          />

          {/* After image with upload */}
          <ImageInputField
            label="Fotka PO"
            field="after_image"
            uploading={uploadingAfter}
            fileRef={afterFileRef}
            required
          />

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.published}
                onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                className="w-4 h-4 accent-[#3FA34D]" />
              <span className="text-sm font-medium text-gray-700">Zobrazit na webu</span>
            </label>
            {editProject && (
              <Button type="button" variant="outline" size="sm"
                onClick={() => { setEditProject(null); setForm({ title: '', category: 'Sekání', location: '', date: '', description: '', before_image: '', after_image: '', published: true }); setPreviewBefore(false); setPreviewAfter(false); }}>
                <X className="w-4 h-4 mr-1" /> Zrušit
              </Button>
            )}
            <Button type="submit" disabled={creating}
              className={`ml-auto rounded-full px-8 h-10 ${editProject ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#3FA34D] hover:bg-[#2d7a38]'}`}
              data-testid="create-gallery-btn">
              {creating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {editProject ? 'Uložit změny' : 'Přidat do galerie'}
            </Button>
          </div>
        </form>
      </div>

      {/* Projects list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Projekty v galerii ({projects.length})
          </h3>
          <Button variant="outline" size="sm" onClick={load} className="h-8">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Obnovit
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><RefreshCw className="w-6 h-6 animate-spin text-[#3FA34D]" /></div>
        ) : projects.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-sm">Žádné projekty. Přidejte první zakázku výše.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {projects.map(p => (
              <div key={p.id} className="px-5 py-4 hover:bg-gray-50 flex items-center gap-4">
                {/* Before/After thumbnails */}
                <div className="flex gap-1 shrink-0">
                  <div className="relative w-16 h-12 rounded overflow-hidden border border-gray-200">
                    <img src={p.before_image} alt="PŘED" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] font-bold bg-red-500/80 text-white">PŘED</span>
                  </div>
                  <div className="relative w-16 h-12 rounded overflow-hidden border border-gray-200">
                    <img src={p.after_image} alt="PO" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] font-bold bg-[#3FA34D]/80 text-white">PO</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm truncate">{p.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.published ? 'Zobrazeno' : 'Skryto'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{p.category} · {p.location} · {p.date}</p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEdit(p)}
                    className="text-blue-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50" title="Upravit">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)}
                    className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50" title="Smazat">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── CONTACT TAB ──────────────────────────────────────────────────────────────
const CONTACT_STATUS_LABELS = {
  new:      { label: 'Nová',      color: 'bg-blue-100 text-blue-800 border-blue-200' },
  read:     { label: 'Přečtená',  color: 'bg-gray-100 text-gray-600 border-gray-200' },
  archived: { label: 'Archivová', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
};

const ContactTab = ({ token, handle401 }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all');
  const headers = { 'X-Admin-Token': token };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/contact`, { headers });
      setMessages(res.data);
    } catch (err) { if (!handle401(err)) toast.error('Nepodařilo se načíst zprávy'); }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/admin/contact/${id}/status`, { status }, { headers });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
      toast.success(status === 'read' ? 'Označeno jako přečtené' : 'Archivováno');
    } catch (err) { if (!handle401(err)) toast.error('Chyba'); }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Smazat tuto zprávu?')) return;
    try {
      await axios.delete(`${API}/admin/contact/${id}`, { headers });
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success('Zpráva smazána');
    } catch (err) { if (!handle401(err)) toast.error('Chyba'); }
  };

  const filtered = filter === 'all' ? messages : messages.filter(m => m.status === filter);
  const newCount = messages.filter(m => m.status === 'new').length;

  return (
    <div className="space-y-4">
      {/* Header + filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">Celkem {messages.length} zpráv</p>
          {newCount > 0 && (
            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{newCount} nových</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Filter buttons */}
          {[
            { key: 'all', label: 'Vše' },
            { key: 'new', label: 'Nové' },
            { key: 'read', label: 'Přečtené' },
            { key: 'archived', label: 'Archiv' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                filter === f.key ? 'bg-[#3FA34D] text-white border-[#3FA34D]' : 'border-gray-200 text-gray-500 hover:border-gray-400'
              }`}>
              {f.label}
            </button>
          ))}
          <Button variant="outline" size="sm" onClick={load} className="h-8 ml-1">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Obnovit
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><RefreshCw className="w-6 h-6 animate-spin text-[#3FA34D]" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{filter === 'all' ? 'Žádné zprávy' : 'Žádné zprávy v tomto filtru'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(msg => {
            const isOpen = expanded === msg.id;
            const s = CONTACT_STATUS_LABELS[msg.status] || CONTACT_STATUS_LABELS.new;
            return (
              <div key={msg.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${msg.status === 'new' ? 'border-blue-200' : 'border-gray-100'}`}
                data-testid={`contact-msg-${msg.id}`}>
                <button
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setExpanded(isOpen ? null : msg.id);
                    if (!isOpen && msg.status === 'new') updateStatus(msg.id, 'read');
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${msg.status === 'new' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${msg.status === 'new' ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{msg.name}</p>
                      <p className="text-xs text-gray-500 truncate">{msg.message?.slice(0, 60)}{msg.message?.length > 60 ? '...' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${s.color}`}>{s.label}</span>
                    <span className="text-xs text-gray-400 hidden sm:block whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleDateString('cs-CZ')}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-gray-100 bg-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {/* Left: contact info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                          <a href={`mailto:${msg.email}`} className="hover:text-[#3FA34D] truncate">{msg.email}</a>
                        </div>
                        {msg.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                            <a href={`tel:${msg.phone}`} className="hover:text-[#3FA34D]">{msg.phone}</a>
                          </div>
                        )}
                        <p className="text-xs text-gray-400">
                          {new Date(msg.created_at).toLocaleString('cs-CZ')}
                        </p>
                      </div>
                      {/* Right: message */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Zpráva</p>
                        <p className="text-sm text-gray-800 bg-white rounded-lg p-3 border border-gray-200 whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 flex-wrap">
                      <a href={`mailto:${msg.email}?subject=Re: Váš dotaz – SeknuTo.cz`}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-[#3FA34D] text-[#3FA34D] hover:bg-[#F0FDF4] font-medium transition-all">
                        <ExternalLink className="w-3.5 h-3.5" /> Odpovědět emailem
                      </a>
                      {msg.status !== 'read' && (
                        <button onClick={() => updateStatus(msg.id, 'read')}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 font-medium">
                          <CheckCheck className="w-3.5 h-3.5" /> Přečteno
                        </button>
                      )}
                      {msg.status !== 'archived' && (
                        <button onClick={() => updateStatus(msg.id, 'archived')}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 font-medium">
                          <Archive className="w-3.5 h-3.5" /> Archivovat
                        </button>
                      )}
                      <button onClick={() => deleteMessage(msg.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 font-medium ml-auto">
                        <Trash2 className="w-3.5 h-3.5" /> Smazat
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── BLOG TAB ─────────────────────────────────────────────────────────────────
const BlogTab = ({ token, handle401 }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const htmlFileRef = useRef(null);
  const coverFileRef = useRef(null);
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '',
    category: 'Tipy', cover_image: '', author: 'SeknuTo.cz', read_time: 3, published: true
  });
  const headers = { 'X-Admin-Token': token };

  const CATEGORIES_BLOG = ['Tipy', 'Sekání', 'Zahrada', 'Sezóna', 'Novinky'];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/blog/posts`, { headers });
      setPosts(res.data);
    } catch (err) { if (!handle401(err)) toast.error('Nepodařilo se načíst příspěvky'); }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const autoSlug = (title) => title.toLowerCase()
    .replace(/[áà]/g, 'a').replace(/[éě]/g, 'e').replace(/[íì]/g, 'i')
    .replace(/[óò]/g, 'o').replace(/[úůù]/g, 'u').replace(/[čç]/g, 'c')
    .replace(/[šß]/g, 's').replace(/[žz]/g, 'z').replace(/[ý]/g, 'y')
    .replace(/[ďd]/g, 'd').replace(/[řr]/g, 'r').replace(/[ňn]/g, 'n')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      if (editPost) {
        await axios.patch(`${API}/admin/blog/posts/${editPost.id}`, form, { headers });
        toast.success('Příspěvek aktualizován!');
        setEditPost(null);
      } else {
        await axios.post(`${API}/admin/blog/posts`, form, { headers });
        toast.success('Příspěvek vytvořen!');
      }
      setForm({ title: '', slug: '', excerpt: '', content: '', category: 'Tipy', cover_image: '', author: 'SeknuTo.cz', read_time: 3, published: true });
      load();
    } catch (err) {
      if (!handle401(err)) toast.error(parseError(err));
    } finally { setCreating(false); }
  };

  const handleEdit = (post) => {
    setEditPost(post);
    setForm({
      title: post.title, slug: post.slug, excerpt: post.excerpt,
      content: post.content, category: post.category || 'Tipy',
      cover_image: post.cover_image || '', author: post.author || 'SeknuTo.cz',
      read_time: post.read_time || 3, published: post.published
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Smazat příspěvek?')) return;
    try {
      await axios.delete(`${API}/admin/blog/posts/${id}`, { headers });
      toast.success('Příspěvek smazán');
      load();
    } catch (err) { if (!handle401(err)) toast.error('Chyba'); }
  };

  // Handle HTML file upload
  const handleHtmlUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      toast.error('Nahrajte prosím .html soubor');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      let html = ev.target.result;
      // Extract only <body> content if full HTML document
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) html = bodyMatch[1].trim();
      // Remove <script> tags for safety
      html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
      setForm(f => ({ ...f, content: html }));
      toast.success(`Obsah nahrán z ${file.name}`);
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  // Handle cover image upload via gallery endpoint
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post(`${API}/admin/gallery/upload`, fd, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });
      setForm(f => ({ ...f, cover_image: res.data.url }));
      toast.success('Titulní fotka nahrána!');
    } catch (err) {
      if (!handle401(err)) toast.error('Nepodařilo se nahrát fotku');
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Create/Edit form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className={`px-5 py-4 ${editPost ? 'bg-gradient-to-r from-blue-700 to-blue-500' : 'bg-gradient-to-r from-[#1B4332] to-[#2D6A4F]'}`}>
          <h3 className="text-white font-semibold flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <FileText className="w-5 h-5" />
            {editPost ? `Upravit: ${editPost.title}` : 'Nový příspěvek'}
          </h3>
        </div>
        <form onSubmit={handleCreate} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Název článku *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({
                ...f, title: e.target.value,
                slug: editPost ? f.slug : autoSlug(e.target.value)
              }))} className="mt-1 h-10" required placeholder="Jak pečovat o trávník na jaře" data-testid="blog-title-input" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">URL slug *</Label>
              <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                className="mt-1 h-10" required placeholder="jak-pecovat-o-travnik" data-testid="blog-slug-input" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Kategorie</Label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="mt-1 h-10 w-full rounded-md border border-gray-200 px-3 text-sm bg-white">
                {CATEGORIES_BLOG.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Doba čtení (min)</Label>
              <Input type="number" value={form.read_time} min="1" max="30"
                onChange={e => setForm(f => ({ ...f, read_time: parseInt(e.target.value) }))}
                className="mt-1 h-10" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Perex (krátký popis) *</Label>
            <Input value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              className="mt-1 h-10" required placeholder="Krátký popis článku pro náhled" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">URL titulní fotky</Label>
            <div className="flex gap-2 mt-1">
              <Input value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))}
                className="h-10 flex-1" placeholder="https://... nebo nahrajte soubor" />
              <input type="file" ref={coverFileRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />
              <Button type="button" variant="outline" className="h-10 px-3 shrink-0" onClick={() => coverFileRef.current?.click()} disabled={uploadingCover}>
                {uploadingCover ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              </Button>
            </div>
            {form.cover_image && (
              <div className="mt-2 h-20 rounded-lg overflow-hidden border border-gray-200">
                <img src={form.cover_image} alt="Cover preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Obsah (HTML) *</Label>
              <div className="flex gap-2">
                <input type="file" ref={htmlFileRef} className="hidden" accept=".html,.htm" onChange={handleHtmlUpload} />
                <button type="button" onClick={() => htmlFileRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#3FA34D] hover:text-[#2d7a38] px-2 py-1 rounded-md hover:bg-[#F0FDF4] transition-colors"
                  data-testid="blog-html-upload-btn"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Nahrát .html
                </button>
                <button type="button" onClick={() => setShowPreview(!showPreview)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors ${showPreview ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showPreview ? 'Editor' : 'Náhled'}
                </button>
              </div>
            </div>
            {showPreview ? (
              <div 
                className="mt-1 w-full min-h-[240px] max-h-[500px] overflow-auto rounded-md border border-gray-200 px-4 py-3 text-sm prose prose-sm prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-[#3FA34D] bg-white"
                dangerouslySetInnerHTML={{ __html: form.content || '<p style="color:#999">Prázdný obsah – napište nebo nahrajte HTML...</p>' }}
              />
            ) : (
              <textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={10}
                required
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-[#3FA34D]/50"
                placeholder="<h2>Nadpis</h2><p>Text článku...</p>"
                data-testid="blog-content-input"
              />
            )}
            <p className="text-xs text-gray-400 mt-1">
              Tip: Vytvořte článek v AI nástroji, exportujte jako .html a nahrajte sem.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.published}
                onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                className="w-4 h-4 accent-[#3FA34D]" />
              <span className="text-sm font-medium text-gray-700">Publikovat ihned</span>
            </label>
            {editPost && (
              <Button type="button" variant="outline" size="sm" onClick={() => { setEditPost(null); setForm({ title: '', slug: '', excerpt: '', content: '', category: 'Tipy', cover_image: '', author: 'SeknuTo.cz', read_time: 3, published: true }); }}>
                <X className="w-4 h-4 mr-1" /> Zrušit úpravy
              </Button>
            )}
            <Button type="submit" disabled={creating} className={`ml-auto rounded-full px-8 h-10 ${editPost ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#3FA34D] hover:bg-[#2d7a38]'}`}>
              {creating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {editPost ? 'Uložit změny' : 'Publikovat'}
            </Button>
          </div>
        </form>
      </div>

      {/* Posts list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Příspěvky ({posts.length})
          </h3>
          <Button variant="outline" size="sm" onClick={load} className="h-8">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Obnovit
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><RefreshCw className="w-6 h-6 animate-spin text-[#3FA34D]" /></div>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-sm">Žádné příspěvky. Vytvořte první článek výše.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {posts.map(p => (
              <div key={p.id} className="px-5 py-4 hover:bg-gray-50 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm truncate">{p.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.published ? 'Publikováno' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">/blog/{p.slug} · {p.category} · {new Date(p.published_at).toLocaleDateString('cs-CZ')}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#3FA34D] p-1.5 rounded-lg hover:bg-gray-100" title="Zobrazit">
                    <Eye className="w-4 h-4" />
                  </a>
                  <button onClick={() => handleEdit(p)} className="text-blue-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50" title="Upravit">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50" title="Smazat">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Přehled', icon: LayoutDashboard },
  { id: 'contact', label: 'Zprávy', icon: MessageSquare },
  { id: 'vouchers', label: 'Poukazů', icon: Ticket },
  { id: 'coupons', label: 'Kupóny', icon: Tag },
  { id: 'bookings', label: 'Objednávky', icon: ClipboardList },
  { id: 'gallery', label: 'Galerie', icon: Image },
  { id: 'blog', label: 'Blog', icon: FileText },
];

export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = (silent = false) => {
    localStorage.removeItem('admin_token');
    setToken(null);
    if (!silent) window.location.reload();
  };

  // Global 401 guard – called by every tab's load/action
  const handle401 = useCallback((err) => {
    if (isUnauthorized(err)) {
      handleLogout(true);
      return true;
    }
    return false;
  }, []); // eslint-disable-line

  if (!token) return <LoginScreen onLogin={setToken} />;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-dashboard">
      {/* Sidebar + main layout */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-56 bg-[#1B4332] flex flex-col shrink-0 hidden md:flex">
          <div className="p-5 border-b border-[#2D6A4F]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#3FA34D] rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  SeknuTo<span className="text-[#52B788]">.cz</span>
                </p>
                <p className="text-[#52B788] text-xs">Admin</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#3FA34D] text-white'
                    : 'text-[#A7C4B2] hover:bg-[#2D6A4F] hover:text-white'
                }`}
                data-testid={`admin-tab-${tab.id}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-[#2D6A4F]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#A7C4B2] hover:bg-[#2D6A4F] hover:text-white transition-all"
              data-testid="admin-logout-btn"
            >
              <LogOut className="w-4 h-4" />
              Odhlásit se
            </button>
          </div>
        </aside>

        {/* Mobile bottom nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1B4332] flex border-t border-[#2D6A4F]">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-all ${
                activeTab === tab.id ? 'text-[#52B788]' : 'text-[#A7C4B2]'
              }`}
            >
              <tab.icon className="w-5 h-5 mb-0.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {/* Top bar */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {TABS.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-xs text-gray-500">SeknuTo.cz administrace</p>
            </div>
            <button
              onClick={handleLogout}
              className="md:hidden flex items-center gap-2 text-sm text-gray-500 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 pb-24 md:pb-6">
            {activeTab === 'overview' && <OverviewTab token={token} handle401={handle401} />}
            {activeTab === 'contact' && <ContactTab token={token} handle401={handle401} />}
            {activeTab === 'vouchers' && <VouchersTab token={token} handle401={handle401} />}
            {activeTab === 'coupons' && <CouponsTab token={token} handle401={handle401} />}
            {activeTab === 'bookings' && <BookingsTab token={token} handle401={handle401} />}
            {activeTab === 'gallery' && <GalleryTab token={token} handle401={handle401} />}
            {activeTab === 'blog' && <BlogTab token={token} handle401={handle401} />}
          </div>
        </main>
      </div>
    </div>
  );
}
