import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, Ticket, Tag, ClipboardList, LogOut,
  Plus, Trash2, Check, X, RefreshCw, Eye, EyeOff, Copy,
  TrendingUp, Users, Leaf, CreditCard, ChevronDown, ChevronUp,
  Calendar, Phone, Mail, MapPin, Edit3, FileText, Bold, Italic
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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
  garden_work: 'Zahradnické práce',
  debris_hourly: 'Odvoz odpadu',
  other: 'Jiná služba',
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
const OverviewTab = ({ token }) => {
  const [stats, setStats] = useState(null);
  const headers = { 'X-Admin-Token': token };

  useEffect(() => {
    axios.get(`${API}/admin/stats`, { headers }).then(r => setStats(r.data));
  }, []); // eslint-disable-line

  if (!stats) return <div className="flex justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-[#3FA34D]" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={ClipboardList} label="Objednávek celkem" value={stats.total_bookings} color="bg-[#3FA34D]" />
        <StatCard icon={Calendar} label="Čeká na potvrzení" value={stats.pending_bookings} color="bg-amber-500" />
        <StatCard icon={Ticket} label="Aktivních poukazů" value={stats.active_vouchers} color="bg-purple-500" />
        <StatCard icon={Tag} label="Kupónů" value={stats.total_coupons} color="bg-blue-500" />
        <StatCard icon={Users} label="Odběratelů" value={stats.total_subscribers} color="bg-[#1B4332]" />
        <StatCard icon={TrendingUp} label="Odhadovaný obrat" value={`${stats.total_revenue_estimate.toLocaleString('cs-CZ')} Kč`} color="bg-emerald-600" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Rychlé akce</h3>
        <p className="text-sm text-gray-500 mb-4">Nejčastěji používané funkce</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
        </div>
      </div>
    </div>
  );
};

// ─── VOUCHERS TAB ─────────────────────────────────────────────────────────────
const VouchersTab = ({ token }) => {
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
    } catch { toast.error('Nepodařilo se načíst poukazů'); }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        ...form,
        code: form.code || undefined,
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
      toast.error(err.response?.data?.detail || 'Chyba při vytváření');
    } finally { setCreating(false); }
  };

  const handleDeactivate = async (code) => {
    try {
      await axios.delete(`${API}/vouchers/${code}`, { headers });
      toast.success('Poukaz deaktivován');
      load();
    } catch { toast.error('Chyba'); }
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
const CouponsTab = ({ token }) => {
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
    } catch { toast.error('Nepodařilo se načíst kupóny'); }
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
      toast.error(err.response?.data?.detail || 'Chyba při vytváření');
    } finally { setCreating(false); }
  };

  const handleDelete = async (code) => {
    try {
      await axios.delete(`${API}/admin/coupons/${code}`, { headers });
      toast.success('Kupón deaktivován');
      load();
    } catch { toast.error('Chyba'); }
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
const BookingsTab = ({ token }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const headers = { 'X-Admin-Token': token };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/bookings`, { headers });
      setBookings(res.data);
    } catch { toast.error('Nepodařilo se načíst objednávky'); }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await axios.patch(`${API}/admin/bookings/${id}/status`, { status }, { headers });
      toast.success('Status aktualizován');
      load();
    } catch { toast.error('Chyba'); }
    finally { setUpdatingId(null); }
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
                      ~{(b.estimated_price || 0).toLocaleString('cs-CZ')} Kč
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
                          <span className="font-medium">Plocha:</span> {b.property_size} {['garden_work','debris_hourly'].includes(b.service) ? 'hod' : 'm²'}
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
const BlogTab = ({ token }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editPost, setEditPost] = useState(null);
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
    } catch { toast.error('Nepodařilo se načíst příspěvky'); }
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
      toast.error(err.response?.data?.detail || 'Chyba');
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
    } catch { toast.error('Chyba'); }
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
            <Input value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))}
              className="mt-1 h-10" placeholder="https://..." />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Obsah (HTML) *</Label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={10}
              required
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-[#3FA34D]/50"
              placeholder="<h2>Nadpis</h2><p>Text článku...</p>"
              data-testid="blog-content-input"
            />
            <p className="text-xs text-gray-400 mt-1">Podporuje HTML tagy: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;</p>
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
  { id: 'vouchers', label: 'Poukazů', icon: Ticket },
  { id: 'coupons', label: 'Kupóny', icon: Tag },
  { id: 'bookings', label: 'Objednávky', icon: ClipboardList },
  { id: 'blog', label: 'Blog', icon: FileText },
];

export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
  };

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
            {activeTab === 'overview' && <OverviewTab token={token} />}
            {activeTab === 'vouchers' && <VouchersTab token={token} />}
            {activeTab === 'coupons' && <CouponsTab token={token} />}
            {activeTab === 'bookings' && <BookingsTab token={token} />}
            {activeTab === 'blog' && <BlogTab token={token} />}
          </div>
        </main>
      </div>
    </div>
  );
}
