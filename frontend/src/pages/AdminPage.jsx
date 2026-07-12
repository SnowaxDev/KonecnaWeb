import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import SEOHead from '../components/SEOHead';
import {
  LayoutDashboard, Ticket, Tag, ClipboardList, LogOut,
  Plus, Trash2, Check, X, RefreshCw, Eye, EyeOff, Copy,
  TrendingUp, Users, Leaf, CreditCard, ChevronDown, ChevronUp,
  Calendar, Phone, Mail, MapPin, Edit3, FileText, Bold, Italic, Image,
  MessageSquare, Upload, CheckCheck, Archive, ExternalLink,
  Search, Download, ChevronLeft, ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip, CartesianGrid } from 'recharts';
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
import { Textarea } from '../components/ui/textarea';
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
  garden_realization: 'Realizace zahrad',
  turf_laying: 'Pokládání trávníku',
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
const OverviewTab = ({ token, handle401, onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [newMessages, setNewMessages] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [statsError, setStatsError] = useState(false);
  const headers = { 'X-Admin-Token': token };

  useEffect(() => {
    axios.get(`${API}/admin/stats`, { headers })
      .then(r => setStats(r.data))
      .catch(err => { if (!handle401(err)) setStatsError(true); });
    axios.get(`${API}/admin/contact`, { headers })
      .then(r => setNewMessages(r.data.filter(m => m.status === 'new').length))
      .catch(() => {}); // non-critical
    axios.get(`${API}/admin/analytics`, { headers, params: { days: 30 } })
      .then(r => setAnalytics(r.data))
      .catch(() => {}); // chart is optional — older backend may not have it
  }, []); // eslint-disable-line

  if (statsError) return (
    <div className="bg-white rounded-xl border p-10 text-center text-gray-500 text-sm">
      Nepodařilo se načíst statistiky. <button onClick={() => window.location.reload()} className="text-[#3FA34D] font-medium hover:underline">Zkusit znovu</button>
    </div>
  );
  if (!stats) return <div className="flex justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-[#3FA34D]" /></div>;

  const chartTotal = analytics ? analytics.series.reduce((a, d) => a + d.count, 0) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={ClipboardList} label="Objednávek celkem" value={stats.total_bookings} color="bg-[#3FA34D]" />
        <StatCard icon={Calendar} label="Čeká na potvrzení" value={stats.pending_bookings} color="bg-amber-500" />
        <StatCard icon={MessageSquare} label="Nových zpráv" value={newMessages} color="bg-blue-500" />
        <StatCard icon={CheckCheck} label="Dokončených zakázek" value={stats.completed_bookings ?? '–'} color="bg-teal-600" />
        <StatCard icon={Users} label="Odběratelů" value={stats.total_subscribers} color="bg-[#1B4332]" />
        <StatCard icon={TrendingUp} label="Obrat (dokončené)" value={`${(stats.total_revenue_estimate ?? 0).toLocaleString('cs-CZ')} Kč`} color="bg-emerald-600" />
      </div>

      {/* Trend objednávek za posledních 30 dní */}
      {analytics && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Objednávky za posledních 30 dní</h3>
              <p className="text-sm text-gray-500">{chartTotal} nových poptávek</p>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              {['pending', 'confirmed', 'completed'].map(st => (
                <span key={st} className="whitespace-nowrap">
                  <span className={`inline-block w-2 h-2 rounded-full mr-1 ${st === 'pending' ? 'bg-amber-400' : st === 'confirmed' ? 'bg-blue-400' : 'bg-[#3FA34D]'}`} />
                  {STATUS_LABELS[st]?.label}: {analytics.status_counts?.[st] ?? 0}
                </span>
              ))}
            </div>
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <AreaChart data={analytics.series} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="bookingsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3FA34D" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3FA34D" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false}
                  minTickGap={28} tickFormatter={d => `${d.slice(8, 10)}.${d.slice(5, 7)}.`} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                <ChartTooltip
                  labelFormatter={d => new Date(d).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' })}
                  formatter={(v) => [`${v}`, 'Objednávek']}
                  contentStyle={{ borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 13 }}
                />
                <Area type="monotone" dataKey="count" stroke="#3FA34D" strokeWidth={2} fill="url(#bookingsFill)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Rychlé akce</h3>
        <p className="text-sm text-gray-500 mb-4">Nejčastěji používané funkce</p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <button onClick={() => onNavigate('vouchers')} className="flex items-center gap-3 p-3 rounded-lg border-2 border-[#3FA34D]/30 bg-[#F0FDF4] hover:border-[#3FA34D] transition-colors text-left" data-testid="quick-vouchers">
            <Ticket className="w-5 h-5 text-[#3FA34D]" />
            <span className="text-sm font-medium text-[#1B4332]">Nový poukaz</span>
          </button>
          <button onClick={() => onNavigate('coupons')} className="flex items-center gap-3 p-3 rounded-lg border-2 border-blue-200 bg-blue-50 hover:border-blue-400 transition-colors text-left" data-testid="quick-coupons">
            <Tag className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Nový kupón</span>
          </button>
          <button onClick={() => onNavigate('bookings')} className="flex items-center gap-3 p-3 rounded-lg border-2 border-amber-200 bg-amber-50 hover:border-amber-400 transition-colors text-left" data-testid="quick-bookings">
            <ClipboardList className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Objednávky</span>
          </button>
          <button onClick={() => onNavigate('contact')} className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors text-left ${newMessages > 0 ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-gray-400'}`} data-testid="quick-contact">
            <MessageSquare className={`w-5 h-5 ${newMessages > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${newMessages > 0 ? 'text-blue-800' : 'text-gray-600'}`}>
              Zprávy {newMessages > 0 && <span className="ml-1 bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{newMessages}</span>}
            </span>
          </button>
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
    if (!window.confirm(`Opravdu deaktivovat poukaz ${code}?`)) return;
    try {
      await axios.delete(`${API}/vouchers/${code}`, { headers });
      toast.success('Poukaz deaktivován');
      load();
    } catch (err) { if (!handle401(err)) toast.error('Chyba'); }
  };

  const handleReactivate = async (code) => {
    try {
      await axios.patch(`${API}/admin/vouchers/${code}`, { status: 'active' }, { headers });
      toast.success('Poukaz znovu aktivován');
      load();
    } catch (err) { if (!handle401(err)) toast.error(parseError(err)); }
  };

  const [editVoucher, setEditVoucher] = useState(null); // voucher object or null
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const openEdit = (v) => {
    setEditVoucher(v);
    setEditForm({
      display_name: v.display_name || '',
      discount_value: v.discount_value ?? '',
      max_uses: v.max_uses ?? 1,
      valid_until: (v.valid_until || '').slice(0, 10),
      campaign_name: v.campaign_name || '',
    });
  };

  const saveEdit = async () => {
    setSavingEdit(true);
    try {
      const payload = {
        display_name: editForm.display_name.trim(),
        discount_value: Number(editForm.discount_value),
        max_uses: Number(editForm.max_uses),
        campaign_name: editForm.campaign_name,
      };
      if (editForm.valid_until) payload.valid_until = new Date(editForm.valid_until + 'T23:59:59').toISOString();
      await axios.patch(`${API}/admin/vouchers/${editVoucher.code}`, payload, { headers });
      toast.success('Poukaz upraven');
      setEditVoucher(null);
      load();
    } catch (err) { if (!handle401(err)) toast.error(parseError(err)); }
    finally { setSavingEdit(false); }
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
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(v)}
                      className="text-gray-400 hover:text-[#1B4332] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Upravit" data-testid={`voucher-edit-${v.code}`}>
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {v.status === 'active' ? (
                      <button onClick={() => handleDeactivate(v.code)}
                        className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Deaktivovat">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={() => handleReactivate(v.code)}
                        className="text-gray-400 hover:text-green-600 p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                        title="Znovu aktivovat" data-testid={`voucher-reactivate-${v.code}`}>
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: úprava poukazu */}
      {editVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" data-testid="voucher-edit-modal">
            <div className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] px-6 py-4">
              <h3 className="text-white font-bold">Upravit poukaz</h3>
              <p className="text-white/70 text-xs font-mono tracking-wider">{editVoucher.code}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Název poukazu</label>
                <input type="text" value={editForm.display_name}
                  onChange={e => setEditForm(f => ({ ...f, display_name: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#3FA34D] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Hodnota slevy {editVoucher.discount_type === 'percentage' ? '(%)' : '(Kč)'}
                  </label>
                  <input type="number" min="1" value={editForm.discount_value}
                    onChange={e => setEditForm(f => ({ ...f, discount_value: e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#3FA34D] focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Max. použití</label>
                  <input type="number" min="1" value={editForm.max_uses}
                    onChange={e => setEditForm(f => ({ ...f, max_uses: e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#3FA34D] focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Platnost do</label>
                  <input type="date" value={editForm.valid_until}
                    onChange={e => setEditForm(f => ({ ...f, valid_until: e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#3FA34D] focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Kampaň</label>
                  <input type="text" value={editForm.campaign_name}
                    onChange={e => setEditForm(f => ({ ...f, campaign_name: e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-[#3FA34D] focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button onClick={() => setEditVoucher(null)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Zrušit
                </button>
                <button onClick={saveEdit} disabled={savingEdit || !editForm.display_name?.trim()}
                  className="px-4 py-2 text-sm bg-[#3FA34D] text-white rounded-lg hover:bg-[#2d7a38] disabled:opacity-50 font-medium"
                  data-testid="voucher-edit-save">
                  {savingEdit ? 'Ukládám...' : 'Uložit změny'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
    if (!window.confirm(`Opravdu deaktivovat kupón ${code}?`)) return;
    try {
      await axios.delete(`${API}/admin/coupons/${code}`, { headers });
      toast.success('Kupón deaktivován');
      load();
    } catch (err) { if (!handle401(err)) toast.error('Chyba'); }
  };

  const handleReactivate = async (code) => {
    try {
      await axios.patch(`${API}/admin/coupons/${code}`, { active: true }, { headers });
      toast.success('Kupón znovu aktivován');
      load();
    } catch (err) { if (!handle401(err)) toast.error(parseError(err)); }
  };

  const [editCoupon, setEditCoupon] = useState(null); // coupon object or null
  const [editForm, setEditForm] = useState({ discount_percent: 10, description: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  const openEdit = (c) => {
    setEditCoupon(c);
    setEditForm({ discount_percent: c.discount_percent ?? 10, description: c.description || '' });
  };

  const saveEdit = async () => {
    setSavingEdit(true);
    try {
      await axios.patch(`${API}/admin/coupons/${editCoupon.code}`, {
        discount_percent: Number(editForm.discount_percent),
        description: editForm.description,
      }, { headers });
      toast.success('Kupón upraven');
      setEditCoupon(null);
      load();
    } catch (err) { if (!handle401(err)) toast.error(parseError(err)); }
    finally { setSavingEdit(false); }
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
                  <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-blue-700 p-1.5 rounded-lg hover:bg-gray-100" title="Upravit" data-testid={`coupon-edit-${c.code}`}>
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {c.active ? (
                    <button onClick={() => handleDelete(c.code)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50" title="Deaktivovat">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => handleReactivate(c.code)} className="text-gray-400 hover:text-green-600 p-1.5 rounded-lg hover:bg-green-50" title="Znovu aktivovat" data-testid={`coupon-reactivate-${c.code}`}>
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: úprava kupónu */}
      {editCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden" data-testid="coupon-edit-modal">
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-4">
              <h3 className="text-white font-bold">Upravit kupón</h3>
              <p className="text-white/70 text-xs font-mono tracking-wider">{editCoupon.code}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Sleva (%)</label>
                <input type="number" min="1" max="100" value={editForm.discount_percent}
                  onChange={e => setEditForm(f => ({ ...f, discount_percent: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Popis</label>
                <input type="text" value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none" />
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button onClick={() => setEditCoupon(null)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Zrušit
                </button>
                <button onClick={saveEdit} disabled={savingEdit}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                  data-testid="coupon-edit-save">
                  {savingEdit ? 'Ukládám...' : 'Uložit změny'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── BOOKINGS TAB ─────────────────────────────────────────────────────────────
const BOOKING_PAGE_SIZE = 20;

const BOOKING_FILTERS = [
  { key: 'all', label: 'Vše' },
  { key: 'pending', label: 'Čeká' },
  { key: 'confirmed', label: 'Potvrzené' },
  { key: 'completed', label: 'Dokončené' },
  { key: 'cancelled', label: 'Zrušené' },
];

// Nadpis skupiny dne – „Dnes / Včera / pátek 10. července 2026"
const dayHeading = (iso) => {
  const d = new Date(iso);
  const base = d.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86400000);
  if (d.toDateString() === today.toDateString()) return `Dnes · ${base}`;
  if (d.toDateString() === yesterday.toDateString()) return `Včera · ${base}`;
  return base;
};

const BookingsTab = ({ token, handle401 }) => {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [emailModal, setEmailModal] = useState(null); // booking object or null
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [priceModal, setPriceModal] = useState(null); // booking object or null
  const [priceValue, setPriceValue] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);
  const [exporting, setExporting] = useState(false);
  const headers = { 'X-Admin-Token': token };

  const buildParams = (skip, limit) => {
    const params = { skip, limit };
    if (statusFilter !== 'all') params.status = statusFilter;
    if (search.trim()) params.q = search.trim();
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    return params;
  };

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/bookings`, { headers, params: buildParams(p * BOOKING_PAGE_SIZE, BOOKING_PAGE_SIZE) });
      const data = res.data;
      setBookings(Array.isArray(data) ? data : data.bookings || []);
      setTotal(Array.isArray(data) ? data.length : data.total || 0);
    } catch (err) { if (!handle401(err)) toast.error('Nepodařilo se načíst objednávky'); }
    finally { setLoading(false); }
  };

  // Načtení při změně stránky/filtrů; hledání s krátkou prodlevou při psaní
  useEffect(() => {
    const t = setTimeout(() => load(page), search ? 350 : 0);
    return () => clearTimeout(t);
  }, [page, statusFilter, dateFrom, dateTo, search]); // eslint-disable-line

  const updateStatus = async (id, status) => {
    if (status === 'cancelled' && !window.confirm('Opravdu označit objednávku jako zrušenou?')) return;
    setUpdatingId(id);
    try {
      await axios.patch(`${API}/admin/bookings/${id}/status`, { status }, { headers });
      toast.success('Status aktualizován');
      load();
    } catch (err) { if (!handle401(err)) toast.error('Chyba'); }
    finally { setUpdatingId(null); }
  };

  const deleteBooking = async (b) => {
    if (!window.confirm(`Opravdu trvale smazat objednávku od „${b.customer_name}"? Tato akce je nevratná.`)) return;
    try {
      await axios.delete(`${API}/admin/bookings/${b.id}`, { headers });
      toast.success('Objednávka smazána');
      load();
    } catch (err) { if (!handle401(err)) toast.error('Nepodařilo se smazat objednávku'); }
  };

  const openPriceModal = (b) => {
    setPriceModal(b);
    setPriceValue(b.final_price > 0 ? String(b.final_price) : '');
  };

  const saveFinalPrice = async () => {
    const num = parseInt(priceValue, 10);
    if (!priceValue || Number.isNaN(num) || num < 0) { toast.error('Zadejte platnou cenu v Kč'); return; }
    setSavingPrice(true);
    try {
      await axios.patch(`${API}/admin/bookings/${priceModal.id}`, { final_price: num }, { headers });
      toast.success('Konečná cena uložena');
      setPriceModal(null);
      load();
    } catch (err) { if (!handle401(err)) toast.error(err.response?.data?.detail || 'Chyba při ukládání ceny'); }
    finally { setSavingPrice(false); }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await axios.get(`${API}/admin/bookings`, { headers, params: buildParams(0, 1000) });
      const rows = Array.isArray(res.data) ? res.data : res.data.bookings || [];
      const cols = [
        ['Vytvořeno', b => new Date(b.created_at).toLocaleString('cs-CZ')],
        ['Zákazník', b => b.customer_name],
        ['Telefon', b => b.customer_phone],
        ['E-mail', b => b.customer_email],
        ['Adresa', b => b.property_address],
        ['Služba', b => SERVICE_NAMES[b.service] || b.service],
        ['Stav', b => (STATUS_LABELS[b.status] || {}).label || b.status],
        ['Termín', b => `${b.preferred_date || ''} ${b.preferred_time || ''}`.trim()],
        ['Odhad (Kč)', b => b.estimated_price || 0],
        ['Konečná cena (Kč)', b => b.final_price || ''],
        ['Kupón', b => b.coupon_code || ''],
        ['Poznámka', b => b.notes || ''],
      ];
      const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const csv = '\uFEFF' + [
        cols.map(c => esc(c[0])).join(';'),
        ...rows.map(b => cols.map(c => esc(c[1](b))).join(';')),
      ].join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `objednavky-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exportováno ${rows.length} objednávek`);
    } catch (err) { if (!handle401(err)) toast.error('Export se nezdařil'); }
    finally { setExporting(false); }
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

  const totalPages = Math.max(1, Math.ceil(total / BOOKING_PAGE_SIZE));

  // Seskupení podle dne vytvoření – přehled „kdy byly jaké objednávky"
  const grouped = [];
  let lastDay = null;
  bookings.forEach(b => {
    const day = (b.created_at || '').slice(0, 10);
    if (day !== lastDay) {
      lastDay = day;
      grouped.push({ type: 'day', key: `day-${day}`, iso: b.created_at });
    }
    grouped.push({ type: 'booking', key: b.id, booking: b });
  });

  return (
    <div className="space-y-4">
      {/* Toolbar: hledání, datum, filtr stavu, export */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Hledat jméno, e-mail, telefon nebo adresu…"
              className="w-full h-10 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:border-[#3FA34D] focus:outline-none"
              data-testid="bookings-search-input"
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0); }}
              className="h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:border-[#3FA34D] focus:outline-none" title="Od data" />
            <span className="text-gray-400 text-sm">–</span>
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }}
              className="h-10 px-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:border-[#3FA34D] focus:outline-none" title="Do data" />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {BOOKING_FILTERS.map(f => (
            <button key={f.key} onClick={() => { setStatusFilter(f.key); setPage(0); }}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                statusFilter === f.key
                  ? 'bg-[#1B4332] text-white border-[#1B4332]'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
              data-testid={`bookings-filter-${f.key}`}
            >
              {f.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={exporting} className="h-8" data-testid="bookings-export-btn">
              {exporting ? <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-1" />} Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => load()} className="h-8">
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Obnovit
            </Button>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Celkem {total} objednávek{totalPages > 1 ? ` · strana ${page + 1} z ${totalPages}` : ''}
      </p>

      {loading ? (
        <div className="flex justify-center py-10"><RefreshCw className="w-6 h-6 animate-spin text-[#3FA34D]" /></div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-500 text-sm">
          {search || statusFilter !== 'all' || dateFrom || dateTo ? 'Filtru neodpovídají žádné objednávky' : 'Žádné objednávky'}
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map(item => {
            if (item.type === 'day') {
              return (
                <div key={item.key} className="flex items-center gap-3 pt-3 first:pt-0">
                  <span className="text-xs font-bold uppercase tracking-wide text-[#1B4332] whitespace-nowrap">
                    {dayHeading(item.iso)}
                  </span>
                  <div className="h-px bg-gray-200 flex-1" />
                </div>
              );
            }
            const b = item.booking;
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
                    <span className={`font-bold text-sm whitespace-nowrap ${b.final_price > 0 ? 'text-[#1B4332]' : 'text-[#3FA34D]'}`}>
                      {b.final_price > 0
                        ? `${b.final_price.toLocaleString('cs-CZ')} Kč`
                        : b.estimated_price > 0 ? `~${b.estimated_price.toLocaleString('cs-CZ')} Kč` : 'Po obhlídce'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${s.color}`}>{s.label}</span>
                    <span className="text-xs text-gray-400 hidden sm:block whitespace-nowrap">
                      {new Date(b.created_at).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
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
                        <div className="text-gray-600">
                          <span className="font-medium">Cena:</span>{' '}
                          {b.final_price > 0
                            ? <span className="font-bold text-[#1B4332]">{b.final_price.toLocaleString('cs-CZ')} Kč (konečná)</span>
                            : b.estimated_price > 0
                              ? <span>~{b.estimated_price.toLocaleString('cs-CZ')} Kč (odhad)</span>
                              : <span className="text-gray-400">zatím nestanovena</span>}
                        </div>
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
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          onClick={() => openPriceModal(b)}
                          className="text-xs px-3 py-1.5 rounded-full border border-[#3FA34D]/40 text-[#1B4332] hover:bg-[#F0FDF4] font-medium transition-all"
                          data-testid={`price-btn-${b.id}`}
                        >
                          <CreditCard className="w-3 h-3 inline mr-1" />
                          {b.final_price > 0 ? 'Upravit cenu' : 'Zadat cenu'}
                        </button>
                        <button
                          onClick={() => openEmailModal(b)}
                          className="text-xs px-3 py-1.5 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium transition-all"
                          data-testid={`email-btn-${b.id}`}
                        >
                          <Mail className="w-3 h-3 inline mr-1" />
                          Poslat email
                        </button>
                        <button
                          onClick={() => deleteBooking(b)}
                          className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 font-medium transition-all"
                          data-testid={`delete-btn-${b.id}`}
                        >
                          <Trash2 className="w-3 h-3 inline mr-1" />
                          Smazat
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Stránkování */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" className="h-8" disabled={page === 0 || loading}
            onClick={() => setPage(p => Math.max(0, p - 1))} data-testid="bookings-prev-page">
            <ChevronLeft className="w-4 h-4 mr-1" /> Předchozí
          </Button>
          <span className="text-sm text-gray-500 whitespace-nowrap">Strana {page + 1} z {totalPages}</span>
          <Button variant="outline" size="sm" className="h-8" disabled={page + 1 >= totalPages || loading}
            onClick={() => setPage(p => p + 1)} data-testid="bookings-next-page">
            Další <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
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

      {/* Modal: konečná cena zakázky */}
      {priceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden" data-testid="price-modal">
            <div className="bg-[#1B4332] px-6 py-4">
              <h3 className="text-white font-bold">Konečná cena zakázky</h3>
              <p className="text-white/70 text-xs">{priceModal.customer_name} – {SERVICE_NAMES[priceModal.service] || priceModal.service}</p>
            </div>
            <div className="p-6 space-y-4">
              {priceModal.estimated_price > 0 && (
                <p className="text-sm text-gray-500">Původní odhad: ~{priceModal.estimated_price.toLocaleString('cs-CZ')} Kč</p>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Skutečně domluvená / fakturovaná cena (Kč)</label>
                <input
                  type="number"
                  min="0"
                  value={priceValue}
                  onChange={e => setPriceValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveFinalPrice(); }}
                  className="w-full h-11 px-3 border border-gray-200 rounded-lg text-lg font-bold focus:border-[#3FA34D] focus:outline-none"
                  placeholder="např. 2500"
                  autoFocus
                  data-testid="price-input"
                />
                <p className="text-xs text-gray-400 mt-1">Započítá se do obratu na Přehledu (u dokončených zakázek).</p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setPriceModal(null)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Zrušit
                </button>
                <button
                  onClick={saveFinalPrice}
                  disabled={savingPrice || !priceValue}
                  className="px-4 py-2 text-sm bg-[#1B4332] text-white rounded-lg hover:bg-[#2D6A4F] disabled:opacity-50 font-medium"
                  data-testid="price-save-btn"
                >
                  {savingPrice ? 'Ukládám...' : 'Uložit cenu'}
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
const GALLERY_CATEGORIES = ['Sekání', 'Hrubé sekání', 'Stříhání keřů a stromů', 'Kácení stromů', 'Realizace zahrad', 'Pokládání trávníku', 'Jarní balíček', 'Letní balíček', 'Podzimní balíček', 'Zahradní práce', 'Jiné'];

const EMPTY_GALLERY_FORM = {
  title: '', category: 'Sekání', location: '', date: '',
  description: '', area: '', duration: '', services: '', videos: '',
  before_images: [], after_images: [], extra_images: [], published: true,
};

// Pole pro více fotek – nahrání souborů (i více najednou), přidání přes URL, mazání a náhledy
const MultiImageField = ({ label, badge, badgeColor, images, uploading, onUploadFiles, onAddUrl, onRemove, testId, required = false, hint }) => {
  const [url, setUrl] = useState('');
  const fileRef = useRef(null);

  const addUrl = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    onAddUrl(trimmed);
    setUrl('');
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}{required && ' *'} <span className="normal-case font-normal text-gray-400">({images.length} {images.length === 1 ? 'fotka' : 'fotek'})</span>
      </Label>

      {/* Náhledy nahraných fotek */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative w-24 h-18 aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 group">
              <img src={img} alt={`${badge} ${i + 1}`} className="w-full h-full object-cover" />
              <span className={`absolute bottom-0 left-0 right-0 text-center text-[8px] font-bold text-white ${badgeColor}`}>
                {badge}{i === 0 ? ' · úvodní' : ` ${i + 1}`}
              </span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Odebrat fotku"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
          className="h-10 flex-1 text-sm"
          placeholder="https://... nebo nahrajte soubory →"
          data-testid={`gallery-${testId}-input`}
        />
        <Button type="button" variant="outline" size="sm" className="h-10 shrink-0" onClick={addUrl} disabled={!url.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
        <input
          type="file"
          ref={fileRef}
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={e => { onUploadFiles(Array.from(e.target.files || [])); e.target.value = ''; }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 shrink-0 border-[#3FA34D] text-[#3FA34D] hover:bg-[#F0FDF4]"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          data-testid={`upload-${testId}-btn`}
        >
          {uploading
            ? <RefreshCw className="w-4 h-4 animate-spin" />
            : <><Upload className="w-4 h-4 mr-1" /> Nahrát</>
          }
        </Button>
      </div>
      <p className="text-[11px] text-gray-400">{hint || 'Můžete vybrat více souborů najednou.'}</p>
    </div>
  );
};

const GalleryTab = ({ token, handle401 }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);
  const [form, setForm] = useState(EMPTY_GALLERY_FORM);
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

  // Upload více souborů najednou → backend /admin/gallery/upload
  const setUploadingFor = { before_images: setUploadingBefore, after_images: setUploadingAfter, extra_images: setUploadingExtra };
  const uploadFiles = async (files, field) => {
    if (files.length === 0) return;
    setUploadingFor[field](true);
    let uploaded = 0;
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post(`${API}/admin/gallery/upload`, formData, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        });
        // Backend returns base64 data URL directly – no prefix needed
        const imageUrl = res.data.url;
        setForm(f => ({ ...f, [field]: [...f[field], imageUrl] }));
        uploaded += 1;
      }
      toast.success(uploaded === 1 ? 'Fotka nahrána!' : `Nahráno ${uploaded} fotek!`);
    } catch (err) {
      if (!handle401(err)) toast.error(parseError(err) || 'Nepodařilo se nahrát fotku');
      if (uploaded > 0) toast.info(`Nahráno ${uploaded} z ${files.length} fotek`);
    } finally {
      setUploadingFor[field](false);
    }
  };

  const addImageUrl = (field, url) => {
    setForm(f => ({ ...f, [field]: [...f[field], url] }));
  };

  const removeImage = (field, index) => {
    setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (form.before_images.length === 0 || form.after_images.length === 0) {
      toast.error('Nahrajte alespoň jednu fotku PŘED a jednu PO');
      return;
    }
    setCreating(true);
    // První fotka z každého seznamu slouží jako úvodní (zpětná kompatibilita)
    const payload = {
      ...form,
      services: form.services.split('\n').map(s => s.trim()).filter(Boolean),
      videos: form.videos.split('\n').map(s => s.trim()).filter(Boolean),
      before_image: form.before_images[0],
      after_image: form.after_images[0],
    };
    try {
      if (editProject) {
        await axios.patch(`${API}/admin/gallery/projects/${editProject.id}`, payload, { headers });
        toast.success('Projekt aktualizován!');
        setEditProject(null);
      } else {
        const res = await axios.post(`${API}/admin/gallery/projects`, payload, { headers });
        // Starší nasazený backend při POST ukládá jen základní pole – PATCH
        // uloží všechna (více fotek, další fotky, videa), na novém je to no-op
        const createdId = res.data?.id;
        if (createdId) {
          try {
            await axios.patch(`${API}/admin/gallery/projects/${createdId}`, payload, { headers });
          } catch { /* starší backend vrací 404 při nezměněném dokumentu – nevadí */ }
        }
        toast.success('Projekt přidán!');
      }
      setForm(EMPTY_GALLERY_FORM);
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
      area: p.area || '', duration: p.duration || '',
      services: (p.services || []).join('\n'),
      videos: (p.videos || []).join('\n'),
      before_images: (p.before_images?.length > 0) ? p.before_images : [p.before_image].filter(Boolean),
      after_images: (p.after_images?.length > 0) ? p.after_images : [p.after_image].filter(Boolean),
      extra_images: p.extra_images || [],
      published: p.published,
    });
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Výměra</Label>
              <Input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                className="mt-1 h-10" placeholder="450 m²" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Doba realizace</Label>
              <Input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                className="mt-1 h-10" placeholder="1 den" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Popis projektu</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="mt-1 min-h-[80px]" placeholder="Popis co bylo uděláno – zobrazí se na detailu projektu" />
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Provedené práce</Label>
            <Textarea value={form.services} onChange={e => setForm(f => ({ ...f, services: e.target.value }))}
              className="mt-1 min-h-[80px]" placeholder={'Jedna položka na řádek, např.:\nStříhání tújí\nOdvoz bioodpadu\nFinální úklid'} />
            <p className="text-[11px] text-gray-400 mt-1">Každý řádek se na detailu projektu zobrazí jako odrážka s fajfkou.</p>
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Videa / prohlídky</Label>
            <Textarea value={form.videos} onChange={e => setForm(f => ({ ...f, videos: e.target.value }))}
              className="mt-1 min-h-[60px]" placeholder={'Odkazy na videa, jeden na řádek:\nhttps://www.youtube.com/watch?v=...\nhttps://vimeo.com/...'} />
            <p className="text-[11px] text-gray-400 mt-1">Podporuje YouTube, Vimeo i přímé odkazy na .mp4 – přehrávač se zobrazí na detailu projektu.</p>
          </div>

          {/* Before images with multi-upload */}
          <MultiImageField
            label="Fotky PŘED"
            badge="PŘED"
            badgeColor="bg-red-500/90"
            images={form.before_images}
            uploading={uploadingBefore}
            onUploadFiles={files => uploadFiles(files, 'before_images')}
            onAddUrl={url => addImageUrl('before_images', url)}
            onRemove={i => removeImage('before_images', i)}
            testId="before"
            required
            hint="První fotka je úvodní – zobrazí se v náhledu na webu. Můžete vybrat více souborů najednou."
          />

          {/* After images with multi-upload */}
          <MultiImageField
            label="Fotky PO"
            badge="PO"
            badgeColor="bg-[#3FA34D]/90"
            images={form.after_images}
            uploading={uploadingAfter}
            onUploadFiles={files => uploadFiles(files, 'after_images')}
            onAddUrl={url => addImageUrl('after_images', url)}
            onRemove={i => removeImage('after_images', i)}
            testId="after"
            required
            hint="První fotka je úvodní – zobrazí se v náhledu na webu. Můžete vybrat více souborů najednou."
          />

          {/* Extra images (optional) */}
          <MultiImageField
            label="Další fotky (nepovinné)"
            badge="FOTO"
            badgeColor="bg-[#1B4332]/90"
            images={form.extra_images}
            uploading={uploadingExtra}
            onUploadFiles={files => uploadFiles(files, 'extra_images')}
            onAddUrl={url => addImageUrl('extra_images', url)}
            onRemove={i => removeImage('extra_images', i)}
            testId="extra"
            hint="Fotky navíc mimo porovnání před/po – na detailu projektu se zobrazí v sekci Další fotky."
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
                onClick={() => { setEditProject(null); setForm(EMPTY_GALLERY_FORM); }}>
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
                    <img src={p.before_images?.[0] || p.before_image} alt="PŘED" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] font-bold bg-red-500/80 text-white">
                      PŘED{(p.before_images?.length || 1) > 1 ? ` +${p.before_images.length - 1}` : ''}
                    </span>
                  </div>
                  <div className="relative w-16 h-12 rounded overflow-hidden border border-gray-200">
                    <img src={p.after_images?.[0] || p.after_image} alt="PO" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] font-bold bg-[#3FA34D]/80 text-white">
                      PO{(p.after_images?.length || 1) > 1 ? ` +${p.after_images.length - 1}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm truncate">{p.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.published ? 'Zobrazeno' : 'Skryto'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {p.category} · {p.location} · {p.date}
                    {p.videos?.length > 0 && ` · ${p.videos.length}× video`}
                  </p>
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

  // Upozornění na nové objednávky – každou minutu porovná počet se stavem z minula
  const prevCountsRef = useRef(null);
  useEffect(() => {
    if (!token) return;
    const check = async () => {
      try {
        const r = await axios.get(`${API}/admin/stats`, { headers: { 'X-Admin-Token': token } });
        const cur = { bookings: r.data.total_bookings, pending: r.data.pending_bookings };
        const prev = prevCountsRef.current;
        if (prev && cur.bookings > prev.bookings) {
          const diff = cur.bookings - prev.bookings;
          toast.success(diff === 1 ? '🔔 Nová objednávka!' : `🔔 ${diff} nové objednávky!`, { duration: 10000 });
        }
        prevCountsRef.current = cur;
      } catch { /* tichý poll – chyby neřešíme */ }
    };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, [token]);

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
            {activeTab === 'overview' && <OverviewTab token={token} handle401={handle401} onNavigate={setActiveTab} />}
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
