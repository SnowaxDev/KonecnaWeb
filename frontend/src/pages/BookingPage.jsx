import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Check, Calendar as CalendarIcon, Scissors, Package,
  User, Phone, Mail, MapPin, Loader2, Tag, CheckCircle, XCircle,
  Clock, ArrowRight, Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Calendar } from '../components/ui/calendar';
import { toast } from 'sonner';
import { cs } from 'date-fns/locale';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BookingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponValid, setCouponValid] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  
  const [formData, setFormData] = useState({
    service: '',
    property_size: 150,
    condition: 'normal',
    additional_services: [],
    preferred_date: null,
    preferred_time: 'anytime',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    property_address: '',
    notes: '',
    estimated_price: 0,
    gdpr_consent: false,
    coupon_code: '',
  });

  // Services - simplified
  const services = [
    { id: 'lawn_mowing', label: 'Sekání trávy', price: '2 Kč/m²', icon: '✂️' },
    { id: 'lawn_with_fertilizer', label: 'Sekání + hnojení', price: '3,33 Kč/m²', icon: '🌱' },
    { id: 'spring_package', label: 'Jarní balíček', price: '8-12 Kč/m²', icon: '🌸', popular: true },
    { id: 'summer_package', label: 'Letní balíček', price: '3-4 Kč/m²', icon: '☀️' },
    { id: 'autumn_package', label: 'Podzimní balíček', price: '10-14 Kč/m²', icon: '🍂' },
    { id: 'winter_snow', label: 'Zimní úklid', price: '8-10 Kč/m²', icon: '❄️' },
    { id: 'vip_annual', label: 'VIP Celoroční', price: '18-22 Kč/m²/rok', icon: '🌀' },
    { id: 'garden_work', label: 'Zahradnické práce', price: '300-450 Kč/hod', icon: '🛠️' },
  ];

  const timeSlots = [
    { id: 'morning', label: 'Dopoledne', time: '8:00 - 12:00' },
    { id: 'afternoon', label: 'Odpoledne', time: '12:00 - 17:00' },
    { id: 'anytime', label: 'Kdykoliv', time: 'Flexibilní' },
  ];

  useEffect(() => {
    const savedCoupon = localStorage.getItem('seknuto_coupon');
    if (savedCoupon) {
      setCouponCode(savedCoupon);
      validateCoupon(savedCoupon);
    }
  }, []);

  useEffect(() => {
    if (formData.service && formData.property_size > 0) {
      calculatePrice();
    }
  }, [formData.service, formData.property_size, formData.condition]);

  const calculatePrice = async () => {
    try {
      const response = await axios.post(`${API}/pricing/calculate`, {
        service: formData.service,
        property_size: formData.property_size,
        condition: formData.condition,
        additional_services: [],
      });
      setFormData(prev => ({ ...prev, estimated_price: response.data.estimated_price }));
    } catch (error) {
      console.error('Price calculation error:', error);
    }
  };

  const validateCoupon = async (code) => {
    if (!code) {
      setCouponValid(null);
      setCouponDiscount(0);
      return;
    }
    setIsValidatingCoupon(true);
    try {
      const response = await axios.post(`${API}/coupons/validate`, { code: code.toUpperCase() });
      setCouponValid(true);
      setCouponDiscount(response.data.discount_percent);
      setFormData(prev => ({ ...prev, coupon_code: code.toUpperCase() }));
      toast.success(`Sleva ${response.data.discount_percent}% aktivována!`);
    } catch {
      setCouponValid(false);
      setCouponDiscount(0);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const getFinalPrice = () => {
    if (couponDiscount > 0) {
      return Math.round(formData.estimated_price * (1 - couponDiscount / 100));
    }
    return formData.estimated_price;
  };

  const getServiceLabel = (id) => services.find(s => s.id === id)?.label || id;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.service && formData.property_size > 0;
      case 2: return formData.preferred_date;
      case 3: return formData.customer_name && formData.customer_phone && formData.customer_email && formData.property_address && formData.gdpr_consent;
      default: return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast.error('Vyplňte prosím všechna povinná pole');
      return;
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleSubmit = async () => {
    if (!canProceed()) {
      toast.error('Vyplňte prosím všechna povinná pole');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        preferred_date: formData.preferred_date?.toISOString().split('T')[0],
        estimated_price: getFinalPrice(),
      };
      await axios.post(`${API}/bookings`, payload);
      setCurrentStep(4);
      toast.success('Rezervace odeslána!');
    } catch (error) {
      toast.error('Chyba při odesílání');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress indicator
  const steps = ['Služba', 'Termín', 'Kontakt', 'Hotovo'];

  return (
    <div className="min-h-screen bg-gray-50 pt-16" data-testid="booking-page">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Rychlá rezervace
            </h1>
            {formData.estimated_price > 0 && currentStep < 4 && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Cena</p>
                <p className="text-lg font-bold text-[#3FA34D]">~{getFinalPrice().toLocaleString('cs-CZ')} Kč</p>
              </div>
            )}
          </div>
          
          {/* Progress */}
          <div className="flex items-center gap-1">
            {steps.map((step, idx) => (
              <div key={idx} className="flex-1 flex items-center">
                <div className={`flex-1 h-1.5 rounded-full transition-all ${
                  idx < currentStep ? 'bg-[#3FA34D]' : 'bg-gray-200'
                }`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {steps.map((step, idx) => (
              <span key={idx} className={`text-[10px] ${
                idx < currentStep ? 'text-[#3FA34D] font-medium' : 'text-gray-400'
              }`}>{step}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        
        {/* Step 1: Service Selection */}
        {currentStep === 1 && (
          <div className="space-y-4" data-testid="step-1-content">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Co potřebujete?</h2>
              <p className="text-sm text-gray-500">Vyberte službu a zadejte velikost plochy</p>
            </div>

            {/* Service Grid */}
            <div className="grid grid-cols-2 gap-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, service: service.id }))}
                  className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                    formData.service === service.id
                      ? 'border-[#3FA34D] bg-[#F0FDF4]'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                  data-testid={`service-option-${service.id}`}
                >
                  {service.popular && (
                    <span className="absolute -top-2 right-2 text-[9px] bg-[#3FA34D] text-white px-1.5 py-0.5 rounded-full">
                      TOP
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{service.icon}</span>
                    <span className="font-medium text-gray-900 text-sm">{service.label}</span>
                  </div>
                  <p className="text-xs text-[#3FA34D] font-semibold">{service.price}</p>
                </button>
              ))}
            </div>

            {/* Size Input */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Velikost plochy (m²)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="10"
                  value={formData.property_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, property_size: parseInt(e.target.value) }))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#3FA34D]"
                />
                <div className="w-20">
                  <Input
                    type="number"
                    value={formData.property_size}
                    onChange={(e) => setFormData(prev => ({ ...prev, property_size: parseInt(e.target.value) || 0 }))}
                    className="h-10 text-center font-semibold"
                    data-testid="input-property-size"
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>50 m²</span>
                <span>1000 m²</span>
              </div>
            </div>

            {/* Price Preview */}
            {formData.service && formData.estimated_price > 0 && (
              <div className="bg-[#3FA34D] rounded-xl p-4 text-white" data-testid="price-preview">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">{getServiceLabel(formData.service)}</p>
                    <p className="text-xs text-white/60">{formData.property_size} m²</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">~{formData.estimated_price.toLocaleString('cs-CZ')} Kč</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Date & Time */}
        {currentStep === 2 && (
          <div className="space-y-4" data-testid="step-2-content">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Kdy vám to vyhovuje?</h2>
              <p className="text-sm text-gray-500">Vyberte preferovaný termín</p>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex justify-center">
              <Calendar
                mode="single"
                selected={formData.preferred_date}
                onSelect={(date) => setFormData(prev => ({ ...prev, preferred_date: date }))}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today || date.getDay() === 0;
                }}
                locale={cs}
                className="rounded-xl"
                data-testid="calendar-preferred"
              />
            </div>

            {formData.preferred_date && (
              <div className="bg-[#F0FDF4] rounded-xl p-3 flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-[#3FA34D]" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formData.preferred_date.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-[#3FA34D] ml-auto" />
              </div>
            )}

            {/* Time Slots */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Preferovaný čas</p>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, preferred_time: slot.id }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      formData.preferred_time === slot.id
                        ? 'border-[#3FA34D] bg-[#F0FDF4]'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                    data-testid={`time-option-${slot.id}`}
                  >
                    <p className="font-medium text-sm text-gray-900">{slot.label}</p>
                    <p className="text-xs text-gray-500">{slot.time}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Contact */}
        {currentStep === 3 && (
          <div className="space-y-4" data-testid="step-3-content">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Kontaktní údaje</h2>
              <p className="text-sm text-gray-500">Kam vám máme přijet?</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
              {/* Name & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Jméno *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={formData.customer_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                      className="pl-9 h-11"
                      placeholder="Jan Novák"
                      data-testid="input-customer-name"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Telefon *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={formData.customer_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                      className="pl-9 h-11"
                      placeholder="+420..."
                      data-testid="input-customer-phone"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                    className="pl-9 h-11"
                    placeholder="jan@email.cz"
                    data-testid="input-customer-email"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Adresa zahrady *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={formData.property_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, property_address: e.target.value }))}
                    className="pl-9 h-11"
                    placeholder="Ulice 123, Město"
                    data-testid="input-property-address"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Poznámka (volitelné)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full h-16 px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:ring-2 focus:ring-[#3FA34D] focus:border-transparent"
                  placeholder="Speciální požadavky..."
                  data-testid="input-notes"
                />
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Slevový kupón</span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 h-10 uppercase bg-white"
                  placeholder="KÓD"
                  data-testid="input-coupon-code"
                />
                <Button
                  type="button"
                  onClick={() => validateCoupon(couponCode)}
                  disabled={isValidatingCoupon || !couponCode}
                  className="h-10 px-4 bg-amber-500 hover:bg-amber-600 text-white"
                  data-testid="btn-validate-coupon"
                >
                  {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Použít'}
                </Button>
              </div>
              {couponValid === true && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Sleva {couponDiscount}% aplikována
                </p>
              )}
              {couponValid === false && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Neplatný kupón
                </p>
              )}
            </div>

            {/* GDPR */}
            <label className="flex items-start gap-3 cursor-pointer" data-testid="gdpr-consent">
              <input
                type="checkbox"
                checked={formData.gdpr_consent}
                onChange={(e) => setFormData(prev => ({ ...prev, gdpr_consent: e.target.checked }))}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#3FA34D] focus:ring-[#3FA34D]"
              />
              <span className="text-xs text-gray-600">
                Souhlasím se zpracováním osobních údajů pro účely rezervace *
              </span>
            </label>

            {/* Summary */}
            <div className="bg-gray-900 rounded-xl p-4 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400">Shrnutí objednávky</p>
                  <p className="font-medium">{getServiceLabel(formData.service)}</p>
                  <p className="text-xs text-gray-400">{formData.property_size} m² • {formData.preferred_date?.toLocaleDateString('cs-CZ')}</p>
                </div>
                <div className="text-right">
                  {couponDiscount > 0 && (
                    <p className="text-xs text-gray-400 line-through">{formData.estimated_price.toLocaleString('cs-CZ')} Kč</p>
                  )}
                  <p className="text-2xl font-bold text-[#3FA34D]">~{getFinalPrice().toLocaleString('cs-CZ')} Kč</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {currentStep === 4 && (
          <div className="text-center py-8" data-testid="step-4-content">
            <div className="w-20 h-20 bg-[#3FA34D] rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Děkujeme! 🎉
            </h2>
            <p className="text-gray-500 mb-6">
              Rezervace byla úspěšně odeslána. Brzy vás budeme kontaktovat.
            </p>

            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 text-left max-w-sm mx-auto">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Služba</span>
                  <span className="font-medium">{getServiceLabel(formData.service)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Plocha</span>
                  <span className="font-medium">{formData.property_size} m²</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Termín</span>
                  <span className="font-medium">{formData.preferred_date?.toLocaleDateString('cs-CZ')}</span>
                </div>
                <div className="flex justify-between py-2 bg-[#F0FDF4] -mx-2 px-2 rounded-lg">
                  <span className="font-medium">Cena</span>
                  <span className="font-bold text-[#3FA34D]">{getFinalPrice().toLocaleString('cs-CZ')} Kč</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="border-2 rounded-full px-6"
                data-testid="btn-go-home"
              >
                Domů
              </Button>
              <Button
                onClick={() => {
                  setCurrentStep(1);
                  setFormData({
                    service: '', property_size: 150, condition: 'normal', additional_services: [],
                    preferred_date: null, preferred_time: 'anytime', customer_name: '',
                    customer_phone: '', customer_email: '', property_address: '', notes: '',
                    estimated_price: 0, gdpr_consent: false, coupon_code: '',
                  });
                  setCouponCode('');
                  setCouponValid(null);
                  setCouponDiscount(0);
                }}
                className="bg-[#3FA34D] hover:bg-[#2d7a38] rounded-full px-6"
                data-testid="btn-new-booking"
              >
                Nová rezervace
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {currentStep < 4 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            {currentStep > 1 ? (
              <Button
                onClick={() => setCurrentStep(currentStep - 1)}
                variant="ghost"
                className="text-gray-600"
                data-testid="btn-back"
              >
                ← Zpět
              </Button>
            ) : (
              <div />
            )}
            
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-8 h-11"
                data-testid="btn-next"
              >
                Pokračovat
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !canProceed()}
                className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-8 h-11"
                data-testid="btn-submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Odesílám...
                  </>
                ) : (
                  <>
                    Odeslat rezervaci
                    <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Quick Contact */}
      {currentStep < 4 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto">
          <div className="bg-white rounded-full shadow-lg border border-gray-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#3FA34D]" />
              <span className="text-sm text-gray-600">Potřebujete pomoct?</span>
            </div>
            <a href="tel:+420730588372" className="text-sm font-semibold text-[#3FA34D]">
              730 588 372
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
