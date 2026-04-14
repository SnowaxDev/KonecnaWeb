import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import SEOHead from '../components/SEOHead';
import { 
  ChevronLeft, ChevronRight, Check, Calendar as CalendarIcon,
  Scissors, Sprout, Leaf, TreeDeciduous, Package, HelpCircle,
  User, Phone, Mail, MapPin, Loader2, Tag, CheckCircle, XCircle,
  Sun, Snowflake, Flower2, Truck, ChevronDown, ChevronUp, Banknote, Gift,
  ClipboardList, Building2, Home, Shovel, Flame
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Calendar } from '../components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { cs } from 'date-fns/locale';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponValid, setCouponValid] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [tierInfo, setTierInfo] = useState(null);
  const [activeVoucher, setActiveVoucher] = useState(null);
  
  // Collapsible sections state
  const [expandedSection, setExpandedSection] = useState('basic'); // 'basic', 'packages', 'other'
  
  // Custom order specific state
  const [customOrderTypes, setCustomOrderTypes] = useState([]);
  const [customOrderDescription, setCustomOrderDescription] = useState('');
  const [customOrderCustomerType, setCustomOrderCustomerType] = useState('individual'); // 'individual' | 'company'

  const [formData, setFormData] = useState({
    service: '',
    property_size: 100,
    condition: 'normal',
    additional_services: [],
    preferred_date: null,
    preferred_time: 'anytime',
    alternative_date: null,
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    property_address: '',
    notes: '',
    estimated_price: 0,
    gdpr_consent: false,
    coupon_code: '',
    voucher_fixed_discount: 0,
  });

  useEffect(() => {
    // Handle voucher from URL (from VoucherPage redirect)
    const voucherCode = searchParams.get('voucher');
    const autoApply = searchParams.get('auto_apply');
    
    if (voucherCode && autoApply === 'true') {
      const storedVoucher = localStorage.getItem('active_voucher');
      if (storedVoucher) {
        try {
          const v = JSON.parse(storedVoucher);
          setActiveVoucher(v);
          setCouponCode(v.code);
          if (v.discount_type === 'percentage') {
            setCouponValid(true);
            setCouponDiscount(v.discount_value);
            setFormData(prev => ({ ...prev, coupon_code: v.code }));
            toast.success(`Poukaz aktivován! Sleva ${v.discount_value}%`);
          } else if (v.discount_type === 'fixed_amount') {
            setCouponValid(true);
            setFormData(prev => ({ ...prev, coupon_code: v.code, voucher_fixed_discount: v.discount_value }));
            toast.success(`Poukaz aktivován! Sleva ${v.discount_value} Kč`);
          }
        } catch {}
      }
    } else {
      // Check saved coupon from newsletter
      const savedCoupon = localStorage.getItem('seknuto_coupon');
      if (savedCoupon) {
        setCouponCode(savedCoupon);
        validateCoupon(savedCoupon);
      }
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Skip price calculation for custom orders, 'other', and project-based services
    if (formData.service === 'custom_order' || formData.service === 'other' || isProjectService(formData.service)) return;
    calculatePrice();
  }, [formData.service, formData.property_size, formData.condition, formData.additional_services]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-adjust property_size default based on service type
  useEffect(() => {
    if (formData.service) {
      if (isProjectService(formData.service)) {
        // Project services don't need m² input - skip price calculation
        setFormData(prev => ({ ...prev, property_size: 0, estimated_price: 0 }));
      } else if (formData.property_size < 50) {
        setFormData(prev => ({ ...prev, property_size: 100 }));
      }
    }
  }, [formData.service]); // eslint-disable-line react-hooks/exhaustive-deps

  const calculatePrice = async () => {
    if (!formData.service || formData.property_size <= 0) return;
    
    try {
      const response = await axios.post(`${API}/pricing/calculate`, {
        service: formData.service,
        property_size: formData.property_size,
        condition: formData.condition,
        additional_services: formData.additional_services,
      });
      setFormData(prev => ({ ...prev, estimated_price: response.data.estimated_price }));
      setTierInfo(response.data.tier_info);
    } catch (error) {
      console.error('Failed to calculate price:', error);
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
      toast.success(`Kupón platný! Sleva ${response.data.discount_percent}%`);
    } catch (error) {
      setCouponValid(false);
      setCouponDiscount(0);
      setFormData(prev => ({ ...prev, coupon_code: '' }));
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const getFinalPrice = () => {
    const base = formData.estimated_price;
    if (!base) return 0;
    // Voucher fixed discount
    if (formData.voucher_fixed_discount > 0) {
      return Math.max(0, base - formData.voucher_fixed_discount);
    }
    // Percentage coupon
    if (couponDiscount > 0) {
      return Math.round(base * (1 - couponDiscount / 100));
    }
    return base;
  };

  // Basic services – orientační ceny, bez hodinových sazeb
  const basicServices = [
    { id: 'lawn_mowing', icon: Scissors, title: 'Sekání trávy (bez hnojení)', price: 'od 2,5 Kč/m²', unit: 'm2', info: '✓ Úklid posečené trávy v ceně' },
    { id: 'lawn_with_fertilizer', icon: Sprout, title: 'Sekání trávy (s hnojením)', price: 'od 3,90 Kč/m²', unit: 'm2', info: '✓ Úklid posečené trávy v ceně' },
    { id: 'overgrown', icon: Leaf, title: 'Přerostlá tráva / hrubé sekání', price: 'od 4,5 Kč/m²', unit: 'm2', info: '✓ Úklid posečené trávy v ceně' },
    { id: 'land_clearing', icon: Flame, title: 'Likvidace a čištění pozemků', price: 'Projektová cena', unit: 'project', info: 'Zarostlé parcely, křoviny, náletové dřeviny' },
    { id: 'garden_work', icon: TreeDeciduous, title: 'Zahradnické práce', price: 'Dle rozsahu', unit: 'project', info: 'Pletí, výsadba, úpravy terénu – dle domluvy' },
    { id: 'debris_hourly', icon: Truck, title: 'Odvoz odpadu', price: 'Dle objemu', unit: 'project', info: 'Nakládka a ekologická likvidace' },
  ];

  // Packages – orientační ceny
  const packages = [
    { id: 'spring_package', icon: Flower2, title: '🌸 Jarní balíček', price: 'od 8 Kč/m²', color: 'border-pink-300 bg-pink-50', unit: 'm2' },
    { id: 'summer_package', icon: Sun, title: '☀️ Letní balíček', price: 'od 3 Kč/m²', color: 'border-yellow-300 bg-yellow-50', unit: 'm2' },
    { id: 'autumn_package', icon: Leaf, title: '🍂 Podzimní balíček', price: 'od 10 Kč/m²', color: 'border-orange-300 bg-orange-50', unit: 'm2' },
    { id: 'winter_snow', icon: Snowflake, title: '❄️ Zimní balíček', price: 'Individuální', color: 'border-blue-300 bg-blue-50', unit: 'm2' },
    { id: 'vip_annual', icon: Package, title: '🌀 VIP Celoroční', price: 'od 18 Kč/m²/rok', color: 'border-green-400 bg-green-50', popular: true, unit: 'm2' },
  ];

  const additionalServices = [
    { id: 'mulching', label: 'Mulčování (+0,5 Kč/m²)' },
    { id: 'debris_removal', label: 'Odvoz odpadu (+400 Kč)' },
  ];

  // Custom order work types
  const customOrderWorkTypes = [
    { id: 'terrain_work', label: 'Terénní úpravy (kopání děr, vykopávky...)', icon: Shovel },
    { id: 'lawn_mowing_custom', label: 'Sekání trávy', icon: Scissors },
    { id: 'hedge_trimming', label: 'Sekání / zkracování plotu a keřů', icon: TreeDeciduous },
    { id: 'garden_cleanup', label: 'Čištění zahrady (ozimování, úklid listí...)', icon: Leaf },
    { id: 'planting', label: 'Výsadba (stromy, keře, záhony)', icon: Sprout },
    { id: 'fertilizing', label: 'Hnojení', icon: Flower2 },
    { id: 'event_prep', label: 'Příprava na akci (grill, firemní akce...)', icon: Package },
    { id: 'other_custom', label: 'Jiné (popište níže)', icon: HelpCircle },
  ];

  const toggleCustomOrderType = (typeId) => {
    setCustomOrderTypes(prev =>
      prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]
    );
  };

  const timeOptions = [
    { id: 'morning', label: 'Dopoledne', time: '8:00 - 12:00' },
    { id: 'afternoon', label: 'Odpoledne', time: '12:00 - 17:00' },
    { id: 'anytime', label: 'Kdykoliv', time: 'Flexibilní' },
  ];

  // Helper to check if service is custom order
  const isCustomOrder = (serviceId) => serviceId === 'custom_order';

  // Helper to check if service is hourly (DEPRECATED - no hourly rates now)
  const isHourlyService = (serviceId) => {
    return false; // No more hourly services
  };

  // Helper to check if service is project-based (no m² calculator)
  const isProjectService = (serviceId) => {
    return ['garden_work', 'debris_hourly', 'land_clearing'].includes(serviceId);
  };

  // Get current service unit
  const getServiceUnit = () => {
    const service = [...basicServices, ...packages].find(s => s.id === formData.service);
    return service?.unit || 'm2';
  };

  const steps = [
    { num: 1, title: 'Služba' },
    { num: 2, title: 'Detaily' },
    { num: 3, title: 'Termín' },
    { num: 4, title: 'Kontakt' },
    { num: 5, title: 'Hotovo' },
  ];

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.service) {
          toast.error('Vyberte prosím službu');
          return false;
        }
        return true;
      case 2:
        if (isCustomOrder(formData.service)) {
          if (customOrderTypes.length === 0) {
            toast.error('Vyberte alespoň jeden typ práce');
            return false;
          }
          return true;
        }
        if (isProjectService(formData.service)) {
          return true; // Project services don't need m² input
        }
        if (formData.property_size <= 0) {
          toast.error('Zadejte velikost plochy');
          return false;
        }
        return true;
      case 3:
        if (!formData.preferred_date) {
          toast.error('Vyberte termín');
          return false;
        }
        return true;
      case 4:
        if (!formData.customer_name || !formData.customer_phone || !formData.customer_email || !formData.property_address) {
          toast.error('Vyplňte všechna povinná pole');
          return false;
        }
        if (!formData.gdpr_consent) {
          toast.error('Musíte souhlasit se zpracováním údajů');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsSubmitting(true);
    try {
      // For custom orders, build notes from the custom order form
      let notesValue = formData.notes;
      if (isCustomOrder(formData.service)) {
        const typesText = customOrderTypes.join(', ');
        const customerTypeText = customOrderCustomerType === 'company' ? 'Firma' : 'Soukromá osoba';
        notesValue = `[ZAKÁZKOVÁ PRÁCE]\nTyp zákazníka: ${customerTypeText}\nTypy prací: ${typesText}\nPopis: ${customOrderDescription}${formData.notes ? '\nPoznámka: ' + formData.notes : ''}`;
      }

      const payload = {
        ...formData,
        notes: notesValue,
        preferred_date: formData.preferred_date ? formData.preferred_date.toISOString().split('T')[0] : null,
        alternative_date: formData.alternative_date ? formData.alternative_date.toISOString().split('T')[0] : null,
      };
      
      const response = await axios.post(`${API}/bookings`, payload);
      setBookingId(response.data.id);
      
      // Clear localStorage
      localStorage.removeItem('active_voucher');
      localStorage.removeItem('seknuto_coupon');
      
      setCurrentStep(5);
      toast.success('Poptávka odeslána!');
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error('Chyba při odesílání. Zkuste to znovu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAdditionalService = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      additional_services: prev.additional_services.includes(serviceId)
        ? prev.additional_services.filter(s => s !== serviceId)
        : [...prev.additional_services, serviceId]
    }));
  };

  const selectService = (serviceId, section) => {
    updateFormData('service', serviceId);
    // Auto-collapse other sections when service is selected
    setExpandedSection(section);
  };

  const getServiceName = (id) => {
    if (id === 'custom_order') return 'Služby na objednávku';
    if (id === 'other') return 'Jiná služba';
    const service = [...basicServices, ...packages].find(s => s.id === id);
    return service ? service.title : id;
  };

  const getTimeName = (id) => {
    const time = timeOptions.find(t => t.id === id);
    return time ? time.label : id;
  };

  // Collapsible Section Component
  const CollapsibleSection = ({ title, icon: Icon, isExpanded, onToggle, badge, children }) => (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
          isExpanded ? 'bg-[#F0FDF4]' : 'hover:bg-gray-50'
        }`}
        data-testid={`section-toggle-${title.toLowerCase().replace(/\s/g, '-')}`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${isExpanded ? 'text-[#3FA34D]' : 'text-gray-500'}`} />
          <span className={`font-semibold ${isExpanded ? 'text-[#3FA34D]' : 'text-gray-700'}`}>{title}</span>
          {badge && (
            <span className="text-xs bg-[#3FA34D] text-white px-2 py-0.5 rounded-full">{badge}</span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[#3FA34D]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="p-4 pt-0 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" data-testid="booking-page">
      <SEOHead
        title="Nezávazná poptávka zahradnických prací | SeknuTo.cz"
        description="Vyplňte formulář pro nezávaznou kalkulaci zahradnických prací. Bezplatná obhlídka pozemku v Dvůr Králové a okolí. Odpovídáme do 24 hodin."
        canonical="https://seknuto.cz/rezervace"
      />
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 mt-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-bold text-center text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Nezávazná poptávka
          </h1>
          <p className="text-center text-xs text-gray-500 mb-3">Ozveme se do 24 hodin s přesnou kalkulací</p>
          
          {/* Progress Steps - Compact */}
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      currentStep > step.num 
                        ? 'bg-[#3FA34D] text-white' 
                        : currentStep === step.num 
                          ? 'bg-[#3FA34D] text-white ring-4 ring-[#3FA34D]/20' 
                          : 'bg-gray-200 text-gray-500'
                    }`}
                    data-testid={`step-indicator-${step.num}`}
                  >
                    {currentStep > step.num ? <Check className="w-4 h-4" /> : step.num}
                  </div>
                  <span className={`text-[10px] mt-1 hidden sm:block ${
                    currentStep >= step.num ? 'text-[#3FA34D] font-medium' : 'text-gray-400'
                  }`}>{step.title}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-6 sm:w-12 h-0.5 mx-1 ${
                    currentStep > step.num ? 'bg-[#3FA34D]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Fills remaining space */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex-1 flex flex-col overflow-hidden">
          
          {/* Step 1: Service Selection - Collapsible */}
          {currentStep === 1 && (
            <div className="flex-1 flex flex-col overflow-hidden" data-testid="step-1-content">
              <div className="flex-1 overflow-y-auto">
                {/* Basic Services Section */}
                <CollapsibleSection
                  title="Základní služby"
                  icon={Scissors}
                  isExpanded={expandedSection === 'basic'}
                  onToggle={() => setExpandedSection(expandedSection === 'basic' ? null : 'basic')}
                >
                  <div className="space-y-2">
                    {basicServices.map((service) => (
                      <label
                        key={service.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.service === service.id 
                            ? 'border-[#3FA34D] bg-[#F0FDF4]' 
                            : 'border-gray-100 hover:border-[#3FA34D]/50 hover:bg-gray-50'
                        }`}
                        data-testid={`service-option-${service.id}`}
                      >
                        <input 
                          type="radio" 
                          name="service" 
                          value={service.id}
                          checked={formData.service === service.id}
                          onChange={() => selectService(service.id, 'basic')}
                          className="sr-only"
                        />
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          formData.service === service.id ? 'bg-[#3FA34D]' : 'bg-gray-100'
                        }`}>
                          <service.icon className={`w-5 h-5 ${
                            formData.service === service.id ? 'text-white' : 'text-gray-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{service.title}</p>
                          {service.info && (
                            <p className="text-xs text-green-600">{service.info}</p>
                          )}
                        </div>
                        <span className="text-sm font-bold text-[#3FA34D] whitespace-nowrap">{service.price}</span>
                      </label>
                    ))}
                  </div>
                </CollapsibleSection>

                {/* Packages Section */}
                <CollapsibleSection
                  title="Sezónní balíčky"
                  icon={Package}
                  isExpanded={expandedSection === 'packages'}
                  onToggle={() => setExpandedSection(expandedSection === 'packages' ? null : 'packages')}
                  badge="VÝHODNÉ"
                >
                  <div className="space-y-2">
                    {packages.map((pkg) => (
                      <label
                        key={pkg.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all relative ${
                          formData.service === pkg.id 
                            ? 'border-[#3FA34D] bg-[#F0FDF4]' 
                            : `${pkg.color} hover:shadow-md`
                        }`}
                        data-testid={`service-option-${pkg.id}`}
                      >
                        {pkg.popular && (
                          <span className="absolute -top-2 left-3 text-[10px] bg-[#3FA34D] text-white px-2 py-0.5 rounded-full">
                            NEJOBLÍBENĚJŠÍ
                          </span>
                        )}
                        <input 
                          type="radio" 
                          name="service" 
                          value={pkg.id}
                          checked={formData.service === pkg.id}
                          onChange={() => selectService(pkg.id, 'packages')}
                          className="sr-only"
                        />
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          formData.service === pkg.id ? 'bg-[#3FA34D]' : 'bg-white shadow-sm'
                        }`}>
                          <pkg.icon className={`w-5 h-5 ${
                            formData.service === pkg.id ? 'text-white' : 'text-[#3FA34D]'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{pkg.title}</p>
                        </div>
                        <span className="text-sm font-bold text-[#3FA34D] whitespace-nowrap">{pkg.price}</span>
                      </label>
                    ))}
                  </div>
                </CollapsibleSection>

                {/* Other Section */}
                <CollapsibleSection
                  title="Jiná služba"
                  icon={HelpCircle}
                  isExpanded={expandedSection === 'other'}
                  onToggle={() => setExpandedSection(expandedSection === 'other' ? null : 'other')}
                >
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.service === 'other' 
                        ? 'border-[#3FA34D] bg-[#F0FDF4]' 
                        : 'border-gray-100 hover:border-[#3FA34D]/50'
                    }`}
                    data-testid="service-option-other"
                  >
                    <input 
                      type="radio" 
                      name="service" 
                      value="other"
                      checked={formData.service === 'other'}
                      onChange={() => selectService('other', 'other')}
                      className="sr-only"
                    />
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.service === 'other' ? 'bg-[#3FA34D]' : 'bg-gray-100'
                    }`}>
                      <HelpCircle className={`w-5 h-5 ${
                        formData.service === 'other' ? 'text-white' : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Specifikujte v poznámce</p>
                    </div>
                    <span className="text-sm font-bold text-gray-500">Dle dohody</span>
                  </label>
                </CollapsibleSection>

                {/* Custom Order Section */}
                <CollapsibleSection
                  title="Služby na objednávku"
                  icon={ClipboardList}
                  isExpanded={expandedSection === 'custom'}
                  onToggle={() => setExpandedSection(expandedSection === 'custom' ? null : 'custom')}
                  badge="ZAKÁZKA"
                >
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800">
                      Pro komplexní zahradní úpravy, realizace a větší projekty. Cena bude stanovena po konzultaci.
                    </p>
                  </div>
                  <label
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.service === 'custom_order'
                        ? 'border-[#3FA34D] bg-[#F0FDF4]'
                        : 'border-gray-100 hover:border-[#3FA34D]/50'
                    }`}
                    data-testid="service-option-custom-order"
                  >
                    <input
                      type="radio"
                      name="service"
                      value="custom_order"
                      checked={formData.service === 'custom_order'}
                      onChange={() => selectService('custom_order', 'custom')}
                      className="sr-only"
                    />
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.service === 'custom_order' ? 'bg-[#3FA34D]' : 'bg-gray-100'
                    }`}>
                      <ClipboardList className={`w-5 h-5 ${
                        formData.service === 'custom_order' ? 'text-white' : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Poptávka na zakázkové práce</p>
                      <p className="text-xs text-gray-500">Zahradní realizace, výsadba, terénní úpravy...</p>
                    </div>
                    <span className="text-sm font-bold text-[#3FA34D] whitespace-nowrap">Dle dohody</span>
                  </label>
                </CollapsibleSection>              </div>

              {/* Selected Service Preview */}
              {formData.service && (
                <div className="p-4 bg-[#F0FDF4] border-t border-[#3FA34D]/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Vybraná služba:</p>
                      <p className="font-semibold text-[#3FA34D]">{getServiceName(formData.service)}</p>
                      {isCustomOrder(formData.service) && (
                        <p className="text-xs text-amber-600 mt-0.5">Cena bude stanovena po konzultaci</p>
                      )}
                    </div>
                    <CheckCircle className="w-6 h-6 text-[#3FA34D]" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Custom Order Details (only for custom_order service) */}
          {currentStep === 2 && isCustomOrder(formData.service) && (
            <div className="flex-1 overflow-y-auto p-6" data-testid="step-2-custom-content">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#3FA34D]" />
                Detaily zakázkové poptávky
              </h2>

              <div className="space-y-5">
                {/* Selected Service */}
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Vybraná služba:</p>
                  <p className="font-semibold text-gray-900">Služby na objednávku</p>
                </div>

                {/* Customer Type */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Typ zákazníka *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCustomOrderCustomerType('individual')}
                      className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all ${
                        customOrderCustomerType === 'individual'
                          ? 'border-[#3FA34D] bg-[#F0FDF4]'
                          : 'border-gray-200 hover:border-[#3FA34D]/50 bg-white'
                      }`}
                      data-testid="customer-type-individual"
                    >
                      <Home className={`w-5 h-5 ${customOrderCustomerType === 'individual' ? 'text-[#3FA34D]' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${customOrderCustomerType === 'individual' ? 'text-[#3FA34D]' : 'text-gray-700'}`}>
                        Soukromá osoba
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomOrderCustomerType('company')}
                      className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all ${
                        customOrderCustomerType === 'company'
                          ? 'border-[#3FA34D] bg-[#F0FDF4]'
                          : 'border-gray-200 hover:border-[#3FA34D]/50 bg-white'
                      }`}
                      data-testid="customer-type-company"
                    >
                      <Building2 className={`w-5 h-5 ${customOrderCustomerType === 'company' ? 'text-[#3FA34D]' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${customOrderCustomerType === 'company' ? 'text-[#3FA34D]' : 'text-gray-700'}`}>
                        Firma / Organizace
                      </span>
                    </button>
                  </div>
                </div>

                {/* Work Types */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Typy prací * <span className="text-gray-400 font-normal">(vyberte vše, co se týká)</span></Label>
                  <div className="space-y-2">
                    {customOrderWorkTypes.map((type) => (
                      <label
                        key={type.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          customOrderTypes.includes(type.id)
                            ? 'border-[#3FA34D] bg-[#F0FDF4]'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                        data-testid={`work-type-${type.id}`}
                      >
                        <Checkbox
                          checked={customOrderTypes.includes(type.id)}
                          onCheckedChange={() => toggleCustomOrderType(type.id)}
                        />
                        <type.icon className={`w-4 h-4 ${customOrderTypes.includes(type.id) ? 'text-[#3FA34D]' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium text-gray-800">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="custom-description" className="text-sm font-semibold">
                    Popis požadavků / rozsah prací
                  </Label>
                  <Textarea
                    id="custom-description"
                    value={customOrderDescription}
                    onChange={(e) => setCustomOrderDescription(e.target.value)}
                    className="mt-2 min-h-[100px] border-2 focus:border-[#3FA34D]"
                    placeholder="Popište co potřebujete – velikost pozemku, stávající stav, vaše přání a očekávání..."
                    data-testid="custom-order-description"
                  />
                  <p className="text-xs text-gray-400 mt-1">Čím více informací, tím přesnější nabídku dostanete.</p>
                </div>

                {/* Info box */}
                <div className="p-4 bg-[#1B4332]/5 border border-[#1B4332]/20 rounded-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#3FA34D] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#1B4332]">Co se stane po odeslání?</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Do 24 hodin vás kontaktujeme, probereme detaily a domluvíme nezávaznou prohlídku. Cena bude stanovena individuálně.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Property Details (standard services) */}
          {currentStep === 2 && !isCustomOrder(formData.service) && (
            <div className="flex-1 overflow-y-auto p-6" data-testid="step-2-content">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#3FA34D]" />
                {isProjectService(formData.service) ? 'Informace o zakázce' : 'Informace o ploše'}
              </h2>
              
              <div className="space-y-5">
                {/* Selected Service */}
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Vybraná služba:</p>
                  <p className="font-semibold text-gray-900">{getServiceName(formData.service)}</p>
                </div>

                {/* Project-based services - no m² input, just notes */}
                {isProjectService(formData.service) ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm font-medium text-amber-800 mb-1">Cena bude stanovena po obhlídce</p>
                    <p className="text-xs text-amber-600">Přesnou kalkulaci připravíme na místě nebo na základě fotografií. Pokračujte výběrem termínu a kontaktních údajů.</p>
                  </div>
                ) : (
                  <>
                    {/* Property Size */}
                    <div>
                      <Label htmlFor="property_size" className="text-sm font-semibold">
                        Velikost plochy (m²) *
                      </Label>
                      <Input
                        id="property_size"
                        type="number"
                        value={formData.property_size}
                        onChange={(e) => updateFormData('property_size', parseInt(e.target.value) || 0)}
                        className="mt-2 h-12 text-lg border-2 focus:border-[#3FA34D]"
                        min="1"
                        placeholder="např. 150"
                        data-testid="input-property-size"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Zadejte přibližnou velikost trávníku nebo zahrady v m²
                      </p>
                    </div>

                    {/* Condition - only for lawn services */}
                    {['lawn_mowing', 'lawn_with_fertilizer', 'overgrown'].includes(formData.service) && (
                      <div>
                        <Label className="text-sm font-semibold">Stav trávy</Label>
                        <Select value={formData.condition} onValueChange={(value) => updateFormData('condition', value)}>
                          <SelectTrigger className="mt-2 h-12 border-2" data-testid="select-condition">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Běžný stav</SelectItem>
                            <SelectItem value="overgrown">Přerostlá (+50%)</SelectItem>
                            <SelectItem value="very_neglected">Velmi zanedbaná (+100%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Additional Services */}
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Doplňkové služby</Label>
                      <div className="space-y-2">
                        {additionalServices.map((service) => (
                          <label
                            key={service.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              formData.additional_services.includes(service.id)
                                ? 'border-[#3FA34D] bg-[#F0FDF4]'
                                : 'border-gray-100 hover:border-gray-200'
                            }`}
                            data-testid={`additional-${service.id}`}
                          >
                            <Checkbox
                              checked={formData.additional_services.includes(service.id)}
                              onCheckedChange={() => toggleAdditionalService(service.id)}
                            />
                            <span className="text-sm font-medium">{service.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Price Preview */}
                    {formData.estimated_price > 0 && (
                      <div className="p-5 bg-gradient-to-r from-[#3FA34D] to-[#2d7a38] rounded-2xl text-white" data-testid="price-preview">
                        <p className="text-sm text-white/80">Orientační cena:</p>
                        <p className="text-3xl font-bold">~{formData.estimated_price.toLocaleString('cs-CZ')} Kč</p>
                        <p className="text-xs text-white/60 mt-1">
                          {formData.property_size} m² × sazba
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {currentStep === 3 && (
            <div className="flex-1 overflow-y-auto p-6" data-testid="step-3-content">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#3FA34D]" />
                Kdy vám to vyhovuje?
              </h2>
              
              <div className="space-y-5">
                {/* Order Summary Card */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Vaše poptávka:</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{getServiceName(formData.service)}</p>
                      <p className="text-sm text-gray-500">
                        {isCustomOrder(formData.service)
                          ? (customOrderTypes.length > 0 ? customOrderTypes.slice(0, 2).map(t => customOrderWorkTypes.find(w => w.id === t)?.label).filter(Boolean).join(', ') + (customOrderTypes.length > 2 ? '...' : '') : 'Zakázkové práce')
                          : isProjectService(formData.service)
                          ? 'Cena po obhlídce'
                          : `${formData.property_size} m²`
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      {(isCustomOrder(formData.service) || isProjectService(formData.service)) ? (
                        <p className="text-lg font-bold text-amber-600">Dle domluvy</p>
                      ) : (
                        <p className="text-xl font-bold text-[#3FA34D]">~{formData.estimated_price.toLocaleString('cs-CZ')} Kč</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Calendar */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Vyberte datum *</Label>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={formData.preferred_date}
                      onSelect={(date) => {
                        if (date) {
                          setFormData(prev => ({ ...prev, preferred_date: date }));
                        }
                      }}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      locale={cs}
                      className="rounded-xl border border-gray-200 bg-white shadow-sm"
                      data-testid="calendar-preferred"
                    />
                  </div>
                </div>
                
                {/* Selected Date - More prominent - ABOVE time slots */}
                {formData.preferred_date && (
                  <div className="p-4 bg-[#3FA34D] rounded-xl text-white shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">{formData.preferred_date.getDate()}</span>
                        <span className="text-[10px] uppercase">{formData.preferred_date.toLocaleDateString('cs-CZ', { month: 'short' })}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-white/70">Vybraný termín:</p>
                        <p className="text-lg font-bold">
                          {formData.preferred_date.toLocaleDateString('cs-CZ', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}

                {/* Time Preference */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Preferovaný čas</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updateFormData('preferred_time', option.id)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          formData.preferred_time === option.id 
                            ? 'border-[#3FA34D] bg-[#3FA34D] text-white' 
                            : 'border-gray-200 hover:border-[#3FA34D]/50 bg-white'
                        }`}
                        data-testid={`time-option-${option.id}`}
                      >
                        <p className="font-semibold text-sm">{option.label}</p>
                        <p className={`text-xs mt-0.5 ${
                          formData.preferred_time === option.id ? 'text-white/70' : 'text-gray-500'
                        }`}>{option.time}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info note */}
                <p className="text-xs text-gray-500 text-center">
                  ℹ️ Pracujeme 7 dní v týdnu. Přesný čas domluvíme telefonicky.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Contact Information */}
          {currentStep === 4 && (
            <div className="flex-1 overflow-y-auto p-6" data-testid="step-4-content">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#3FA34D]" />
                Kontaktní údaje
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-semibold">Jméno *</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={formData.customer_name}
                        onChange={(e) => updateFormData('customer_name', e.target.value)}
                        className="h-11 pl-10 border-2"
                        placeholder="Jan Novák"
                        data-testid="input-customer-name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Telefon *</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="tel"
                        value={formData.customer_phone}
                        onChange={(e) => updateFormData('customer_phone', e.target.value)}
                        className="h-11 pl-10 border-2"
                        placeholder="+420..."
                        data-testid="input-customer-phone"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Email *</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => updateFormData('customer_email', e.target.value)}
                      className="h-11 pl-10 border-2"
                      placeholder="jan@email.cz"
                      data-testid="input-customer-email"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Adresa zahrady *</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={formData.property_address}
                      onChange={(e) => updateFormData('property_address', e.target.value)}
                      className="h-11 pl-10 border-2"
                      placeholder="Ulice 123, Město"
                      data-testid="input-property-address"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Poznámka</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => updateFormData('notes', e.target.value)}
                    className="mt-1 min-h-[60px] border-2"
                    placeholder="Speciální požadavky..."
                    data-testid="input-notes"
                  />
                </div>

                {/* Active Voucher Badge */}
                {activeVoucher && !isCustomOrder(formData.service) && (
                  <div className="p-3 bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] rounded-xl flex items-center gap-3" data-testid="active-voucher-badge">
                    <Gift className="w-5 h-5 text-[#52B788]" />
                    <div>
                      <p className="text-white text-sm font-semibold">Poukaz aktivní: {activeVoucher.code}</p>
                      <p className="text-[#52B788] text-xs">{activeVoucher.display_discount} sleva</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                  </div>
                )}

                {/* Coupon – skryt pokud je aktivní voucher nebo custom_order */}
                {!activeVoucher && !isCustomOrder(formData.service) && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-600" />
                    Slevový kupón
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="h-10 uppercase border-2 bg-white"
                      placeholder="KÓD"
                      data-testid="input-coupon-code"
                    />
                    <Button
                      type="button"
                      onClick={() => validateCoupon(couponCode)}
                      disabled={isValidatingCoupon || !couponCode}
                      className="h-10 px-4 bg-amber-500 hover:bg-amber-600"
                      data-testid="btn-validate-coupon"
                    >
                      {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ověřit'}
                    </Button>
                  </div>
                  {couponValid === true && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Sleva {couponDiscount}%
                    </p>
                  )}
                  {couponValid === false && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Neplatný kupón
                    </p>
                  )}
                </div>
                )}

                {/* GDPR */}
                <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl" data-testid="gdpr-consent">
                  <Checkbox
                    checked={formData.gdpr_consent}
                    onCheckedChange={(checked) => updateFormData('gdpr_consent', checked)}
                    className="mt-0.5"
                  />
                  <span className="text-xs text-gray-600">
                    Souhlasím se zpracováním osobních údajů *
                  </span>
                </label>

                {/* Price Summary - standard services only */}
                {formData.estimated_price > 0 && !isCustomOrder(formData.service) && !isProjectService(formData.service) && (
                  <div className="p-4 bg-gray-900 rounded-xl text-white" data-testid="final-price-summary">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-400">{getServiceName(formData.service)}</p>
                        <p className="text-xs text-gray-400">
                          {`${formData.property_size} m²`} • {formData.preferred_date?.toLocaleDateString('cs-CZ')}
                        </p>
                      </div>
                      <div className="text-right">
                        {(couponDiscount > 0 || formData.voucher_fixed_discount > 0) ? (
                          <>
                            <p className="text-xs text-gray-400 line-through">{formData.estimated_price.toLocaleString('cs-CZ')} Kč</p>
                            <p className="text-xs text-[#52B788] mb-0.5">
                              {formData.voucher_fixed_discount > 0
                                ? `Sleva ${formData.voucher_fixed_discount} Kč`
                                : `Sleva ${couponDiscount}%`}
                            </p>
                            <p className="text-2xl font-bold text-[#3FA34D]">~{getFinalPrice().toLocaleString('cs-CZ')} Kč</p>
                          </>
                        ) : (
                          <p className="text-2xl font-bold">~{formData.estimated_price.toLocaleString('cs-CZ')} Kč</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Order - price info */}
                {isCustomOrder(formData.service) && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl" data-testid="custom-order-price-info">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-semibold text-amber-800 text-sm">Cena dle dohody</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Po odeslání poptávky vás kontaktujeme do 24 hodin a domluvíme cenovou nabídku.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Platba na místě */}
                <div className="p-4 rounded-xl border-2 bg-[#F0FDF4] border-[#3FA34D]/30" data-testid="payment-onsite-info">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#3FA34D]/10 flex items-center justify-center shrink-0">
                      <Banknote className="w-5 h-5 text-[#3FA34D]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1B4332] text-sm">Platba na místě po dokončení práce</p>
                      <p className="text-xs text-[#4B5563] mt-0.5">Hotovost nebo bankovní převod – platíte až po dokončení a kontrole práce.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 5 && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center" data-testid="step-5-content">
              <div className="w-20 h-20 bg-[#3FA34D] rounded-full flex items-center justify-center mb-4">
                <Check className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Děkujeme! 🎉</h2>
              <p className="text-gray-600 mb-6">
                {isCustomOrder(formData.service)
                  ? 'Vaše poptávka byla úspěšně odeslána.'
                  : 'Rezervace byla úspěšně odeslána.'
                }
              </p>

              <div className="w-full max-w-sm bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-gray-200">
                    <span className="text-gray-500">Služba:</span>
                    <span className="font-medium">{getServiceName(formData.service)}</span>
                  </div>
                  {!isCustomOrder(formData.service) && !isProjectService(formData.service) && (
                    <div className="flex justify-between py-1.5 border-b border-gray-200">
                      <span className="text-gray-500">Plocha:</span>
                      <span className="font-medium">
                        {`${formData.property_size} m²`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5 border-b border-gray-200">
                    <span className="text-gray-500">Termín:</span>
                    <span className="font-medium">{formData.preferred_date?.toLocaleDateString('cs-CZ')}</span>
                  </div>
                  {!isCustomOrder(formData.service) && (
                    <div className="flex justify-between py-1.5 border-b border-gray-200">
                      <span className="text-gray-500">Čas:</span>
                      <span className="font-medium">{getTimeName(formData.preferred_time)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 bg-[#F0FDF4] -mx-2 px-2 rounded">
                    <span className="font-medium">Cena:</span>
                    <span className={`font-bold ${(isCustomOrder(formData.service) || isProjectService(formData.service)) ? 'text-amber-600' : 'text-[#3FA34D]'}`}>
                      {(isCustomOrder(formData.service) || isProjectService(formData.service)) ? 'Dle domluvy' : `~${getFinalPrice().toLocaleString('cs-CZ')} Kč`}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                {(isCustomOrder(formData.service) || isProjectService(formData.service))
                  ? 'Do 24 hodin vás kontaktujeme pro upřesnění detailů a cenovou nabídku.'
                  : 'Brzy vás budeme kontaktovat pro potvrzení termínu.'
                }
              </p>

              <div className="w-full max-w-sm bg-[#F0FDF4] border border-[#3FA34D]/20 rounded-xl p-3 mb-4 flex items-center gap-3">
                <Banknote className="w-5 h-5 text-[#3FA34D] shrink-0" />
                <p className="text-sm text-[#1B4332]">
                  <span className="font-semibold">Platba na místě</span> – hotovost nebo převodem po dokončení práce.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="border-2 border-[#3FA34D] text-[#3FA34D] rounded-full px-6"
                  data-testid="btn-go-home"
                >
                  Domů
                </Button>
                <Button
                  onClick={() => {
                    setCurrentStep(1);
                    setFormData({
                      service: '', property_size: 100, condition: 'normal',
                      additional_services: [], preferred_date: null, preferred_time: 'anytime',
                      alternative_date: null, customer_name: '', customer_phone: '',
                      customer_email: '', property_address: '', notes: '',
                      estimated_price: 0, gdpr_consent: false, coupon_code: '',
                      voucher_fixed_discount: 0,
                    });
                    setCouponCode('');
                    setCouponValid(null);
                    setCouponDiscount(0);
                    setCustomOrderTypes([]);
                    setCustomOrderDescription('');
                    setCustomOrderCustomerType('individual');
                  }}
                  className="bg-[#3FA34D] hover:bg-[#2d7a38] rounded-full px-6"
                  data-testid="btn-new-booking"
                >
                  Nová rezervace
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Buttons - Fixed at bottom */}
          {currentStep < 5 && (
            <div className="flex justify-between p-4 bg-gray-50 border-t border-gray-100 mt-auto">
              {currentStep > 1 ? (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="border-2 text-gray-600 rounded-full px-5 h-11"
                  data-testid="btn-back"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Zpět
                </Button>
              ) : (
                <div />
              )}
              
              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  className="bg-[#3FA34D] hover:bg-[#2d7a38] rounded-full px-6 h-11 font-semibold"
                  data-testid="btn-next"
                >
                  Pokračovat
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-[#3FA34D] hover:bg-[#2d7a38] rounded-full px-8 h-11 font-semibold"
                  data-testid="btn-submit"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Odesílám...
                    </>
                  ) : (
                    <>
                      {isCustomOrder(formData.service) ? 'Odeslat poptávku' : 'Odeslat rezervaci'}
                      <Check className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
