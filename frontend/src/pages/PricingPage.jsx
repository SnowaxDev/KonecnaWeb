import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calculator, CheckCircle, ArrowRight, Star, Shield, Clock,
  Scissors, Sprout, Package, Phone, Zap, TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import SEOHead from '../components/SEOHead';

const PricingPage = () => {
  const [service, setService] = useState('lawn_mowing');
  const [size, setSize] = useState(200);
  const [condition, setCondition] = useState('normal');
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  const servicePrices = {
    lawn_mowing: 2,
    lawn_with_fertilizer: 3.33,
    overgrown: 3.5,
    spring_package: 10,
    summer_package: 3.5,
    autumn_package: 12,
    vip_annual: 20,
  };

  const conditionMultipliers = {
    normal: 1,
    overgrown: 1.5,
    very_neglected: 2,
  };

  const calculatePrice = () => {
    const basePrice = servicePrices[service] || 2;
    const multiplier = conditionMultipliers[condition] || 1;
    const total = Math.round(basePrice * size * multiplier);
    setCalculatedPrice(total);
  };

  return (
    <div className="min-h-screen pt-16" data-testid="pricing-page">
      <SEOHead
        title="Ceník zahradnických služeb | Sekání trávy od 2,5 Kč/m²"
        description="Transparentní ceník zahradnických služeb SeknuTo.cz. Sekání trávy od 2,5 Kč/m², vertikutace, hnojení, sezónní balíčky. Žádné skryté poplatky."
        canonical="https://seknuto.cz/cenik"
        keywords="ceník sekání trávy, cena zahradník Dvůr Králové, cena vertikutace, cena hnojení trávníku"
      />
      {/* Hero - Compact & Action-focused */}
      <section className="py-10 bg-gradient-to-b from-[#F0FDF4] to-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-[#3FA34D]/30 rounded-full px-4 py-1.5 mb-4">
            <Zap className="w-4 h-4 text-[#3FA34D]" />
            <span className="text-sm font-medium text-[#3FA34D]">Transparentní ceny • Žádné skryté poplatky</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Vyberte si ideální řešení
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto mb-6">
            Od jednorázového sekání po celoroční péči. Ušetřete až 35% s našimi balíčky.
          </p>
          
          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>4.9/5 hodnocení</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#3FA34D]" />
              <span>Garance spokojenosti</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#3FA34D]" />
              <span>Reakce do 24h</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Pricing Cards */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Card 1: Jednorázové služby */}
            <Card className="rounded-2xl border-2 border-gray-100 hover:border-[#3FA34D]/30 transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Scissors className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Jednorázově</h3>
                    <p className="text-xs text-gray-500">Pro konkrétní potřeby</p>
                  </div>
                </div>
                
                <div className="mb-5">
                  <span className="text-3xl font-bold text-gray-900">od 2</span>
                  <span className="text-gray-500 ml-1">Kč/m²</span>
                </div>

                <ul className="space-y-2.5 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-[#3FA34D]" />
                    Sekání trávy: 2 Kč/m²
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-[#3FA34D]" />
                    S hnojením: 3,33 Kč/m²
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-[#3FA34D]" />
                    Hrubé sekání: 3-4 Kč/m²
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-[#3FA34D]" />
                    Odvoz odpadu: 400 Kč/hod
                  </li>
                </ul>

                <Link to="/rezervace" className="block">
                  <Button variant="outline" className="w-full h-11 rounded-xl border-2 border-gray-200 hover:border-[#3FA34D] hover:bg-[#F0FDF4]">
                    Objednat
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card 2: Sezónní balíčky - POPULAR */}
            <Card className="rounded-2xl border-2 border-[#3FA34D] shadow-xl relative lg:scale-105 bg-white">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3FA34D] text-white text-xs font-bold px-4 py-1 rounded-full">
                NEJOBLÍBENĚJŠÍ
              </div>
              <CardContent className="p-6 pt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#F0FDF4] rounded-xl flex items-center justify-center">
                    <Sprout className="w-6 h-6 text-[#3FA34D]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Sezónní balíčky</h3>
                    <p className="text-xs text-[#3FA34D] font-medium">Úspora 20-25%</p>
                  </div>
                </div>
                
                <div className="mb-5">
                  <span className="text-3xl font-bold text-gray-900">od 900</span>
                  <span className="text-gray-500 ml-1">Kč</span>
                </div>

                <ul className="space-y-2.5 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-[#3FA34D]" />
                    <span>🌸 Jarní restart: <strong>8-12 Kč/m²</strong></span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-[#3FA34D]" />
                    <span>☀️ Letní údržba: <strong>3-4 Kč/m²</strong></span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-[#3FA34D]" />
                    <span>🍂 Podzimní příprava: <strong>10-14 Kč/m²</strong></span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-[#3FA34D]" />
                    <span>❄️ Zimní úklid: <strong>8-10 Kč/m²</strong></span>
                  </li>
                </ul>

                <Link to="/rezervace" className="block">
                  <Button className="w-full h-11 rounded-xl bg-[#3FA34D] hover:bg-[#2d7a38] text-white font-semibold">
                    Vybrat balíček
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                
                <p className="text-center text-xs text-gray-400 mt-3">
                  Cena závisí na velikosti zahrady
                </p>
              </CardContent>
            </Card>

            {/* Card 3: VIP Celoroční */}
            <Card className="rounded-2xl border-2 border-gray-100 hover:border-[#3FA34D]/30 transition-all hover:shadow-lg bg-gradient-to-b from-white to-gray-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">VIP Celoroční</h3>
                    <p className="text-xs text-amber-600 font-medium">Úspora až 35%</p>
                  </div>
                </div>
                
                <div className="mb-5">
                  <span className="text-3xl font-bold text-gray-900">18-22</span>
                  <span className="text-gray-500 ml-1">Kč/m²/rok</span>
                </div>

                <ul className="space-y-2.5 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-amber-500" />
                    Jarní + podzimní balíček
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-amber-500" />
                    Pravidelné letní sekání
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-amber-500" />
                    4× sezónní hnojení
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-amber-500" />
                    Zimní úklid sněhu zdarma
                  </li>
                </ul>

                <Link to="/rezervace" className="block">
                  <Button variant="outline" className="w-full h-11 rounded-xl border-2 border-amber-300 text-amber-700 hover:bg-amber-50">
                    Zjistit více
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Calculator - Inline */}
      <section className="py-12 bg-gray-50" data-testid="price-calculator-section">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-[#3FA34D] px-6 py-4 flex items-center gap-3">
              <Calculator className="w-6 h-6 text-white" />
              <h2 className="text-lg font-bold text-white">Rychlá kalkulace ceny</h2>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-4 gap-4 items-end">
                {/* Service */}
                <div>
                  <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Služba</Label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger className="h-11" data-testid="calc-service-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lawn_mowing">Sekání (2 Kč/m²)</SelectItem>
                      <SelectItem value="lawn_with_fertilizer">S hnojením (3,33 Kč/m²)</SelectItem>
                      <SelectItem value="spring_package">Jarní balíček (10 Kč/m²)</SelectItem>
                      <SelectItem value="summer_package">Letní balíček (3,5 Kč/m²)</SelectItem>
                      <SelectItem value="autumn_package">Podzimní balíček (12 Kč/m²)</SelectItem>
                      <SelectItem value="vip_annual">VIP roční (20 Kč/m²)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Size */}
                <div>
                  <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Plocha (m²)</Label>
                  <Input
                    type="number"
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value) || 0)}
                    className="h-11"
                    min="1"
                    data-testid="calc-size-input"
                  />
                </div>

                {/* Condition */}
                <div>
                  <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Stav</Label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger className="h-11" data-testid="calc-condition-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Běžný (×1)</SelectItem>
                      <SelectItem value="overgrown">Přerostlý (×1.5)</SelectItem>
                      <SelectItem value="very_neglected">Zanedbaný (×2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Calculate */}
                <Button 
                  onClick={calculatePrice}
                  className="h-11 bg-[#222] hover:bg-[#333] text-white"
                  data-testid="calc-button"
                >
                  Spočítat
                </Button>
              </div>

              {/* Result */}
              {calculatedPrice !== null && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between p-4 bg-[#F0FDF4] rounded-xl gap-4" data-testid="calc-result">
                  <div>
                    <p className="text-sm text-gray-600">Orientační cena:</p>
                    <p className="text-3xl font-bold text-[#3FA34D]">
                      {calculatedPrice.toLocaleString('cs-CZ')} Kč
                    </p>
                  </div>
                  <Link to="/rezervace">
                    <Button className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-6 h-11">
                      Objednat nyní
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Price Comparison Table */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Porovnání služeb
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Služba</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Cena</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Obsahuje</th>
                  <th className="text-right py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-900">Sekání trávy</td>
                  <td className="py-4 px-4 text-center text-[#3FA34D] font-bold">2 Kč/m²</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-500">Základní sekání</td>
                  <td className="py-4 px-4 text-right">
                    <Link to="/rezervace" className="text-[#3FA34D] text-sm font-medium hover:underline">Objednat →</Link>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-900">Sekání + hnojení</td>
                  <td className="py-4 px-4 text-center text-[#3FA34D] font-bold">3,33 Kč/m²</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-500">Sekání + NPK hnojivo</td>
                  <td className="py-4 px-4 text-right">
                    <Link to="/rezervace" className="text-[#3FA34D] text-sm font-medium hover:underline">Objednat →</Link>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50 bg-[#F0FDF4]/50">
                  <td className="py-4 px-4 font-medium text-gray-900">
                    🌸 Jarní balíček
                    <span className="ml-2 text-xs bg-[#3FA34D] text-white px-2 py-0.5 rounded">-20%</span>
                  </td>
                  <td className="py-4 px-4 text-center text-[#3FA34D] font-bold">8-12 Kč/m²</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-500">Vertikutace + hnojení + sekání</td>
                  <td className="py-4 px-4 text-right">
                    <Link to="/rezervace" className="text-[#3FA34D] text-sm font-medium hover:underline">Objednat →</Link>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-900">Odvoz odpadu</td>
                  <td className="py-4 px-4 text-center text-[#3FA34D] font-bold">400 Kč/hod</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-500">Nakládka + odvoz</td>
                  <td className="py-4 px-4 text-right">
                    <Link to="/rezervace" className="text-[#3FA34D] text-sm font-medium hover:underline">Objednat →</Link>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 bg-amber-50/50">
                  <td className="py-4 px-4 font-medium text-gray-900">
                    🌀 VIP Celoroční
                    <span className="ml-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded">-35%</span>
                  </td>
                  <td className="py-4 px-4 text-center text-amber-600 font-bold">18-22 Kč/m²/rok</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-500">Kompletní celoroční péče</td>
                  <td className="py-4 px-4 text-right">
                    <Link to="/rezervace" className="text-amber-600 text-sm font-medium hover:underline">Objednat →</Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Urgency CTA */}
      <section className="py-12 bg-[#222]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-[#3FA34D]" />
                <span className="text-[#3FA34D] font-medium text-sm">Sezóna začíná!</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Rezervujte si termín včas
              </h2>
              <p className="text-gray-400 text-sm">
                Jarní kapacity se rychle plní. Objednejte dnes a mějte jistotu.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/rezervace">
                <Button className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-8 h-12 font-semibold">
                  Rezervovat online
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="tel:+420730588372">
                <Button variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 rounded-full px-6 h-12">
                  <Phone className="w-4 h-4 mr-2" />
                  730 588 372
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
