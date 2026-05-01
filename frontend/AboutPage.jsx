import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Scissors, TreeDeciduous, Sprout, Package, Leaf,
  CheckCircle, ArrowRight, Truck, Sun, Snowflake, Flower2,
  Star, Shield, Clock, Phone, Zap, ChevronDown, ChevronUp, Flame
} from 'lucide-react';
import { Button } from '../components/ui/button';
import SEOHead, { SCHEMAS } from '../components/SEOHead';

const ServicesPage = () => {
  const [expandedService, setExpandedService] = useState(null);

  const basicServices = [
    {
      id: 'lawn_mowing',
      icon: Scissors,
      title: 'Sekání trávy',
      subtitle: 'Základní služba',
      price: 'Po obhlídce',
      unit: '',
      description: 'Profesionální sekání trávníků všech velikostí – pravidelná údržba i jednorázové služby.',
      features: [
        { label: 'Sekání bez hnojení', price: '✓' },
        { label: 'Sekání s hnojením NPK', price: '✓' },
        { label: 'Přerostlá tráva / hrubé sekání', price: '✓' },
        { label: 'Mulčování', price: '✓' },
      ],
      time: 'Dle rozsahu',
      color: 'bg-emerald-50 border-emerald-200',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      id: 'land_clearing',
      icon: Flame,
      title: 'Likvidace a čištění pozemků',
      subtitle: 'Zarostlé parcely',
      price: 'Po obhlídce',
      unit: '',
      description: 'Kompletní vyčištění zarostlých pozemků, parcel a zahrad – křoviny, nálety, přerostlá vegetace.',
      features: [
        { label: 'Kácení křovin a náletů', price: '✓' },
        { label: 'Mulčování vysoké trávy', price: '✓' },
        { label: 'Odvoz a likvidace odpadu', price: '✓' },
        { label: 'Finální úklid pozemku', price: '✓' },
      ],
      time: 'Dle rozsahu',
      color: 'bg-orange-50 border-orange-200',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      id: 'garden_work',
      icon: TreeDeciduous,
      title: 'Zahradnické práce',
      subtitle: 'Ruční práce',
      price: 'Po domluvě',
      unit: '',
      description: 'Pletí, výsadba, údržba záhonů, odstranění kořenů, úprava terénu a další práce na zahradě.',
      features: [
        { label: 'Pletí záhonů', price: '✓' },
        { label: 'Výsadba rostlin', price: '✓' },
        { label: 'Úprava terénu', price: '✓' },
        { label: 'Odvoz odpadu', price: '✓' },
      ],
      time: 'Dle rozsahu',
      color: 'bg-amber-50 border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
  ];

  const seasonalPackages = [
    {
      id: 'spring_package',
      icon: Flower2,
      emoji: '🌸',
      title: 'Jarní balíček',
      subtitle: 'Restart po zimě',
      price: 'Po obhlídce',
      unit: '',
      popular: true,
      description: 'Kompletní jarní obnova trávníku po zimě.',
      features: [
        'Vertikutace (provzdušnění)',
        'První hnojení s dusíkem',
        'První sekání + vyhrabání',
        'Ošetření proti mechu',
      ],
      savings: '',
      time: '3-5 hod',
      season: 'Březen - Květen',
      color: 'from-pink-50 to-rose-50',
      borderColor: 'border-pink-200',
    },
    {
      id: 'summer_package',
      icon: Sun,
      emoji: '☀️',
      title: 'Letní balíček',
      subtitle: 'Pravidelná údržba',
      price: 'Po obhlídce',
      unit: '',
      description: 'Pravidelné sekání 2× měsíčně s hnojením NPK.',
      features: [
        'Sekání 2× měsíčně',
        'Hnojení NPK',
        'Mulčování na přání',
        'Kontrola zdraví trávníku',
      ],
      savings: '',
      time: 'Pravidelně',
      season: 'Červen - Srpen',
      color: 'from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-200',
    },
    {
      id: 'autumn_package',
      icon: Leaf,
      emoji: '🍂',
      title: 'Podzimní balíček',
      subtitle: 'Příprava na zimu',
      price: 'Po obhlídce',
      unit: '',
      description: 'Vertikutace, podzimní hnojení a kompletní úklid listí.',
      features: [
        'Vertikutace + hnojení',
        'Shrabání veškerého listí',
        'Odvoz odpadu',
        'Příprava na zimu',
      ],
      savings: '',
      time: '3-5 hod',
      season: 'Září - Listopad',
      color: 'from-orange-50 to-amber-50',
      borderColor: 'border-orange-200',
    },
    {
      id: 'winter_snow',
      icon: Snowflake,
      emoji: '❄️',
      title: 'Zimní balíček',
      subtitle: 'Úklid sněhu',
      price: 'Po obhlídce',
      unit: '',
      description: 'Odklízení sněhu z chodníků, cest a ploch včetně solení.',
      features: [
        'Ruční odklízení chodníků',
        'Plošné odklízení sněhu',
        'Solení/posyp dle potřeby',
        'Paušál dle domluvy',
      ],
      savings: '',
      time: 'Dle potřeby',
      season: 'Prosinec - Únor',
      color: 'from-sky-50 to-blue-50',
      borderColor: 'border-sky-200',
    },
  ];

  const vipPackage = {
    id: 'vip_annual',
    icon: Package,
    title: 'VIP Celoroční servis',
    subtitle: 'Kompletní péče bez starostí',
    price: 'Individuální',
    unit: 'kalkulace',
    description: 'Všechny sezónní služby v jednom balíčku. Žádné starosti po celý rok.',
    features: [
      '2× vertikutace (jaro + podzim)',
      '4× sezónní hnojení',
      '10× sekání + mulčování',
      'Jarní a podzimní balíček',
      '2× odvoz odpadu',
      'Zimní úklid sněhu ZDARMA',
    ],
    savings: 'Výhodný balíček',
    minSize: '',
  };

  return (
    <div className="min-h-screen pt-16" data-testid="services-page">
      <SEOHead
        title="Zahradnické služby Dvůr Králové | Sekání trávy, likvidace pozemků | SeknuTo.cz"
        description="Kompletní zahradnické služby ve Dvoře Králové nad Labem a okolí: sekání trávy, likvidace zarostlých pozemků, sezónní balíčky, vertikutace, hnojení, odvoz odpadu. Bezplatná obhlídka zdarma."
        canonical="https://seknuto.cz/sluzby"
        keywords="zahradnické služby Dvůr Králové, sekání trávy Dvůr Králové nad Labem, likvidace pozemků, čištění zarostlých parcel, vertikutace trávníku, hnojení trávy, sezónní balíčky zahrada, odvoz zahradního odpadu, zahradník Trutnov, sekání trávy Vrchlabí"
        schema={[
          SCHEMAS.breadcrumb([
            { name: 'Úvod', url: '/' },
            { name: 'Zahradnické služby', url: '/sluzby' },
          ]),
          SCHEMAS.service({
            name: 'Sekání trávy',
            description: 'Profesionální sekání trávníků všech velikostí s možností hnojení a mulčování. Pravidelná i jednorázová údržba.',
            areaServed: 'Dvůr Králové nad Labem',
          }),
          SCHEMAS.service({
            name: 'Likvidace a čištění pozemků',
            description: 'Kompletní vyčištění zarostlých pozemků, parcel a zahrad – křoviny, nálety, přerostlá vegetace, odvoz odpadu.',
            areaServed: 'Dvůr Králové nad Labem',
          }),
          SCHEMAS.service({
            name: 'Vertikutace trávníku',
            description: 'Provzdušnění trávníku pro lepší růst a zdravý vzhled. Součást jarního a podzimního balíčku.',
            areaServed: 'Dvůr Králové nad Labem',
          }),
          SCHEMAS.service({
            name: 'Sezónní balíčky zahrada',
            description: 'Kompletní sezónní péče o zahradu – jarní restart, letní údržba, podzimní příprava na zimu, zimní úklid sněhu.',
            areaServed: 'Dvůr Králové nad Labem',
          }),
        ]}
      />
      {/* Hero */}
      <section className="py-10 bg-gradient-to-b from-[#F0FDF4] to-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-[#3FA34D]/30 rounded-full px-4 py-1.5 mb-4">
            <Sprout className="w-4 h-4 text-[#3FA34D]" />
            <span className="text-sm font-medium text-[#3FA34D]">Profesionální zahradnické služby</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Zahradnické služby Dvůr Králové
          </h1>
          <p className="text-gray-500 text-sm font-medium mb-1">Sekání trávy · Likvidace pozemků · Sezónní balíčky · Vertikutace</p>
          <p className="text-gray-600 max-w-xl mx-auto mb-6">
            Od jednorázového sekání po celoroční péči. Všechny ceny jsou orientační – přesnou kalkulaci připravíme po obhlídce.
          </p>
          
          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>5/5 hodnocení</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#3FA34D]" />
              <span>Garance kvality</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#3FA34D]" />
              <span>Termín do 48h</span>
            </div>
          </div>
        </div>
      </section>

      {/* Basic Services */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Základní služby
              </h2>
              <p className="text-sm text-gray-500">Jednorázové služby dle potřeby</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {basicServices.map((service) => (
              <div 
                key={service.id}
                className={`rounded-2xl border-2 ${service.color} p-5 hover:shadow-lg transition-all cursor-pointer`}
                onClick={() => setExpandedService(expandedService === service.id ? null : service.id)}
                data-testid={`service-${service.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 ${service.iconBg} rounded-xl flex items-center justify-center`}>
                      <service.icon className={`w-5 h-5 ${service.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{service.title}</h3>
                      <p className="text-xs text-gray-500">{service.subtitle}</p>
                    </div>
                  </div>
                  {expandedService === service.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <div className="mb-3">
                  <span className="text-2xl font-bold text-gray-900">{service.price}</span>
                  <span className="text-gray-500 ml-1 text-sm">{service.unit}</span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{service.description}</p>

                {expandedService === service.id && (
                  <div className="border-t border-gray-200 pt-4 mt-4 space-y-2 animate-fade-in">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">{feature.label}</span>
                        <span className="font-semibold text-gray-900">{feature.price}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
                      <span className="text-xs text-gray-500">⏱️ {service.time}</span>
                      <Link to="/rezervace">
                        <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-4 h-8 text-xs">
                          Poptat
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {expandedService !== service.id && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">⏱️ {service.time}</span>
                    <span className="text-xs text-[#3FA34D] font-medium">Klikněte pro detail →</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal Packages */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3FA34D] rounded-xl flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Sezónní balíčky
                </h2>
                <p className="text-sm text-gray-500">Výhodné kombinace služeb se slevou</p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 bg-[#3FA34D] text-white text-xs font-bold px-3 py-1.5 rounded-full">
              <Zap className="w-3 h-3" />
              VÝHODNÉ BALÍČKY
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {seasonalPackages.map((pkg) => (
              <div 
                key={pkg.id}
                className={`relative bg-gradient-to-br ${pkg.color} rounded-2xl border-2 ${pkg.borderColor} p-5 hover:shadow-lg transition-all`}
                data-testid={`package-${pkg.id}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-2.5 left-4 bg-[#3FA34D] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    NEJOBLÍBENĚJŠÍ
                  </div>
                )}
                
                <div className="text-3xl mb-3">{pkg.emoji}</div>
                
                <h3 className="font-bold text-gray-900 mb-1">{pkg.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{pkg.subtitle}</p>
                
                <div className="mb-3">
                  <span className="text-xl font-bold text-gray-900">{pkg.price}</span>
                  <span className="text-gray-500 ml-1 text-xs">{pkg.unit}</span>
                  {pkg.savings && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      {pkg.savings}
                    </span>
                  )}
                </div>

                <ul className="space-y-1.5 mb-4">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle className="w-3.5 h-3.5 text-[#3FA34D] flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200/50">
                  <span className="text-[10px] text-gray-500">📅 {pkg.season}</span>
                  <Link to="/rezervace">
                    <Button size="sm" className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-full px-3 h-7 text-xs shadow-sm">
                      Poptat
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIP Package */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-3xl border-2 border-amber-200 p-6 md:p-8 relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-200/30 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg">
                      <Package className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          🌀 {vipPackage.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500">{vipPackage.subtitle}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{vipPackage.description}</p>

                  <div className="grid sm:grid-cols-2 gap-2 mb-4">
                    {vipPackage.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-amber-500" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500">* Vhodné pro zahrady {vipPackage.minSize}</p>
                </div>

                <div className="md:text-right md:min-w-[180px]">
                  <div className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    {vipPackage.savings}
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">{vipPackage.price}</span>
                    <span className="text-gray-500 ml-1">{vipPackage.unit}</span>
                  </div>
                  <Link to="/rezervace">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-6 h-11 font-semibold shadow-lg">
                      Mám zájem
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Compare Table */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl font-bold text-center text-gray-900 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Rychlé srovnání
          </h2>
          
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Služba</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Co obsahuje</th>
                  <th className="text-right py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">✂️ Sekání trávy</td>
                  <td className="py-3 px-4 text-center text-gray-500">Sekání, hnojení, mulčování</td>
                  <td className="py-3 px-4 text-right">
                    <Link to="/rezervace" className="text-[#3FA34D] font-medium hover:underline">Poptat →</Link>
                  </td>
                </tr>
                <tr className="border-t border-gray-100 hover:bg-gray-50 bg-orange-50/50">
                  <td className="py-3 px-4 font-medium">🔥 Likvidace pozemků</td>
                  <td className="py-3 px-4 text-center text-gray-500">Křoviny, nálety, vysoká tráva</td>
                  <td className="py-3 px-4 text-right">
                    <Link to="/rezervace" className="text-[#3FA34D] font-medium hover:underline">Poptat →</Link>
                  </td>
                </tr>
                <tr className="border-t border-gray-100 hover:bg-gray-50 bg-pink-50/50">
                  <td className="py-3 px-4 font-medium">🌸 Sezónní balíčky</td>
                  <td className="py-3 px-4 text-center text-gray-500">Jaro, léto, podzim, zima</td>
                  <td className="py-3 px-4 text-right">
                    <Link to="/rezervace" className="text-[#3FA34D] font-medium hover:underline">Poptat →</Link>
                  </td>
                </tr>
                <tr className="border-t border-gray-100 hover:bg-gray-50 bg-amber-50/50">
                  <td className="py-3 px-4 font-medium">🌀 VIP Celoroční</td>
                  <td className="py-3 px-4 text-center text-gray-500">Kompletní celoroční péče</td>
                  <td className="py-3 px-4 text-right">
                    <Link to="/rezervace" className="text-amber-600 font-medium hover:underline">Poptat →</Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-[#222]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Nevíte, co vybrat?
              </h2>
              <p className="text-gray-400 text-sm">
                Pošlete nezávaznou poptávku nebo zavolejte. Poradíme a připravíme kalkulaci na míru.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/rezervace">
                <Button className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-8 h-12 font-semibold">
                  Nezávazná poptávka
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

export default ServicesPage;
