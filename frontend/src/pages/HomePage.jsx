import { Link } from 'react-router-dom';
import { 
  Leaf, Phone, MessageCircle, CheckCircle, ArrowRight, 
  Scissors, TreeDeciduous, Sprout, Package, Truck, Calendar,
  Star, Clock, MapPin, Shield
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import SEOHead, { SCHEMAS } from '../components/SEOHead';

const HomePage = () => {
  const services = [
    {
      icon: Scissors,
      title: 'Sekání trávy',
      description: 'Profesionální sekání trávníků s možností hnojení. Pravidelná údržba nebo jednorázová služba.',
      price: 'od 2,5 Kč/m²',
      features: ['Sekání bez hnojení: 2,5 Kč/m²', 'Sekání s hnojením: 3,83 Kč/m²', 'Mulčování: +0,5 Kč/m²'],
    },
    {
      icon: Sprout,
      title: 'Sezónní balíčky',
      description: 'Kompletní péče o trávník podle ročního období - jarní restart, letní údržba, podzimní příprava.',
      price: 'od 900 Kč',
      features: ['Jarní balíček: od 12 Kč/m²', 'Letní balíček: od 3 Kč/m²', 'Podzimní balíček: od 14 Kč/m²'],
    },
    {
      icon: Package,
      title: 'Celoroční VIP servis',
      description: 'Komplexní roční péče včetně vertikutace, hnojení, sekání a zimního úklidu sněhu.',
      price: 'od 6 900 Kč/rok',
      features: ['2× vertikutace + 4× hnojení', '10× sekání + mulčování', 'Zimní úklid sněhu'],
    },
  ];

  const steps = [
    { icon: MessageCircle, title: 'Napište nám', description: 'Přes WhatsApp nebo formulář' },
    { icon: Calendar, title: 'Domluva termínu', description: 'Vybereme vhodný čas' },
    { icon: Truck, title: 'Přijedeme', description: 'S profesionálním vybavením' },
    { icon: CheckCircle, title: 'Hotovo!', description: 'Krásná zahrada bez starostí' },
  ];

  const stats = [
    { value: '50+', label: 'Spokojených zákazníků' },
    { value: '98%', label: 'Úspěšnost' },
    { value: '24h', label: 'Rychlá odpověď' },
    { value: '5★', label: 'Průměrné hodnocení' },
  ];

  const faqItems = [
    {
      question: 'Kolik stojí sekání trávy ve Dvoře Králové?',
      answer: 'Běžné sekání trávy stojí 2,5 Kč za metr čtvereční. Pro zahradu 300 m² zaplatíte 750 Kč. Nabízíme transparentní ceny bez skrytých poplatků. Pro přesnou kalkulaci zavolejte 730 588 372 nebo použijte náš online rezervační formulář.',
    },
    {
      question: 'Jak často byste doporučovali sekat trávník?',
      answer: 'Doporučujeme sekat trávník jednou za 7–10 dní během vegetačního období (duben–říjen). V horkém létě můžete frekvenci snížit na jednou za dva týdny. V SeknuTo.cz nabízíme pravidelnou údržbu i jednorázové sekání.',
    },
    {
      question: 'Jaké oblasti pokrýváte vašimi službami?',
      answer: 'Působíme v Dvoře Králové nad Labem a okolí do vzdálenosti 30 km – zahrnuje to Trutnov, Vrchlabí, Hostinné, Jaroměř, Náchod a okolní vesnice.',
    },
    {
      question: 'Jak rychle můžete přijet?',
      answer: 'Běžně se dokážeme domluvit na termínu do 3–5 dnů. V případě volné kapacity jsme schopni dojet i do 24 hodin. V sezóně (duben–září) doporučujeme rezervovat termín s týdenním předstihem.',
    },
    {
      question: 'Co zahrnuje celoroční VIP servis?',
      answer: 'VIP balíček za 6 900 Kč/rok zahrnuje: 10× sekání, 4× hnojení, 2× vertikutaci, jarní a podzimní balíček, odvoz bioodpadu a zimní úklid sněhu. Kompletní péče o zahradu po celý rok bez starostí.',
    },
    {
      question: 'Co je zahrnuto v ceně základní služby?',
      answer: 'V základní ceně je zahrnuto sekání trávníku na požadovanou výšku a úklid posečené trávy. Odvoz odpadu a další služby (hnojení, vertikutace) jsou za příplatek dle ceníku.',
    },
  ];

  const reviews = [
    {
      name: 'Markéta Horáčková',
      location: 'Dvůr Králové n. L.',
      date: 'Říjen 2024',
      rating: 5,
      text: 'Naprosto spokojená! Kluci přijeli přesně v domluveném čase, zahradu upravili do posledního detailu a po sobě vše uklidili. Cena odpovídá kvalitě. Určitě se vrátím na jarní balíček.',
      initials: 'MH',
      color: '#3FA34D',
    },
    {
      name: 'Tomáš Beneš',
      location: 'Trutnov',
      date: 'Září 2024',
      rating: 5,
      text: 'Objednal jsem sekání přerostlé zahrady po dvou měsících – vypadalo to beznadějně. SeknuTo.cz to zvládli za odpoledne a výsledek byl úžasný. Skvělý přístup, rychlá domluva přes WhatsApp.',
      initials: 'TB',
      color: '#1B4332',
    },
    {
      name: 'Jana Procházková',
      location: 'Jaroměř',
      date: 'Srpen 2024',
      rating: 5,
      text: 'Využívám jejich VIP celoroční servis a jsem nadšená. Nemusím na nic myslet, přijedou pravidelně a zahrada je vždy v perfektním stavu. Skvělá investice pro každého, kdo to myslí se zahradou vážně.',
      initials: 'JP',
      color: '#2D6A4F',
    },
    {
      name: 'Pavel Novotný',
      location: 'Náchod',
      date: 'Červen 2024',
      rating: 5,
      text: 'Rychlá reakce, férová cena a profesionální práce. Rezervace online fungovala bez problémů. Oceňuji, že hned potvrdili termín a přišli přesně. Doporučuji všem sousedům v okolí!',
      initials: 'PN',
      color: '#52B788',
    },
    {
      name: 'Alena Dvořáčková',
      location: 'Dvůr Králové n. L.',
      date: 'Červenec 2024',
      rating: 5,
      text: 'Jarní balíček byl přesně to, co jsem potřebovala po zimě. Vertikutace, hnojení, sekání – vše najednou a za rozumnou cenu. Trávník teď vypadá skvěle. Mockrát děkuji za práci!',
      initials: 'AD',
      color: '#3FA34D',
    },
    {
      name: 'Radek Šimánek',
      location: 'Hořice',
      date: 'Říjen 2024',
      rating: 5,
      text: 'Zavolal jsem ráno, odpoledne přijeli. Zahradu uklidili od listí a připravili na zimu. Podzimní balíček za skvělou cenu. Profesionální, milý přístup. Bez váhání je doporučím dál.',
      initials: 'RS',
      color: '#1B4332',
    },
  ];

  return (
    <div className="min-h-screen" data-testid="home-page">
      <SEOHead
        title="Sekání trávy Dvůr Králové | SeknuTo.cz – Od 2,5 Kč/m²"
        description="Profesionální sekání trávy ve Dvoře Králové nad Labem od 2,5 Kč/m². Vertikutace, hnojení, sezónní balíčky. Rychlá domluva ☎ 730 588 372"
        canonical="https://seknuto.cz"
        schema={[SCHEMAS.localBusiness, SCHEMAS.faqPage(faqItems)]}
      />
      {/* Hero Section */}
      <section className="relative pt-24 md:pt-28 pb-16 md:pb-24 overflow-hidden" data-testid="hero-section">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F0FDF4] via-white to-[#F8FAFC]" />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232E8B3E' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 bg-white border-2 border-[#2E8B3E]/20 rounded-full px-4 py-2 mb-6 shadow-sm">
                <Star className="w-4 h-4 text-[#2E8B3E]" fill="#2E8B3E" />
                <span className="text-sm font-semibold text-[#374151]">
                  Mladý tým s chutí do práce
                </span>
              </div>
              
              <h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#111827] leading-[1.1] mb-6"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Perfektní sekání{' '}
                <span className="text-[#2E8B3E]">vašeho trávníku</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-[#374151] mb-8 leading-relaxed max-w-xl font-medium">
                Sekání, stříhání, úklid – rychle a za férové ceny. 
                Spoléhejte na mladý, energický tým z Dvora Králové nad Labem.
              </p>

              {/* Trust badges */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-5 mb-8">
                {[
                  { icon: CheckCircle, text: 'Rychlost a spolehlivost' },
                  { icon: Shield, text: 'Transparentní ceny' },
                  { icon: MapPin, text: 'Místní firma' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm font-semibold text-[#374151]">
                    <item.icon className="w-5 h-5 text-[#2E8B3E]" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link to="/rezervace" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full bg-[#2E8B3E] hover:bg-[#256d31] text-white rounded-full px-8 h-14 text-base font-bold shadow-lg hover:shadow-xl transition-all"
                    data-testid="hero-cta-rezervace"
                  >
                    Rezervovat online
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <a href="https://wa.me/420730588372" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full border-2 border-[#2E8B3E] text-[#2E8B3E] hover:bg-[#F0FDF4] rounded-full px-8 h-14 text-base font-bold"
                    data-testid="hero-cta-whatsapp"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp: 730 588 372
                  </Button>
                </a>
              </div>
            </div>

            {/* Right - Stats Card */}
            <div className="relative mt-8 lg:mt-0">
              <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border-2 border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#2E8B3E] rounded-2xl flex items-center justify-center shadow-lg">
                    <Leaf className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg sm:text-xl text-[#111827]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Pěkně udržovaný trávník
                    </h3>
                    <p className="text-[#374151] font-medium">Profesionální sekání a péče</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 sm:gap-6 py-6 border-t-2 border-b-2 border-gray-100">
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl md:text-3xl font-black text-[#2E8B3E]" style={{ fontFamily: 'Poppins, sans-serif' }}>2 Kč</p>
                    <p className="text-xs sm:text-sm font-semibold text-[#6B7280]">od / m²</p>
                  </div>
                  <div className="text-center border-x-2 border-gray-100">
                    <p className="text-xl sm:text-2xl md:text-3xl font-black text-[#2E8B3E]" style={{ fontFamily: 'Poppins, sans-serif' }}>30 km</p>
                    <p className="text-xs sm:text-sm font-semibold text-[#6B7280]">Dosah</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl md:text-3xl font-black text-[#2E8B3E]" style={{ fontFamily: 'Poppins, sans-serif' }}>Zdarma</p>
                    <p className="text-xs sm:text-sm font-semibold text-[#6B7280]">Kalkulace</p>
                  </div>
                </div>

                <div className="mt-6">
                  <Link to="/rezervace">
                    <Button 
                      className="w-full bg-[#2E8B3E] hover:bg-[#256d31] text-white rounded-xl h-12 sm:h-14 font-bold text-base"
                      data-testid="hero-card-cta"
                    >
                      Získat cenovou nabídku zdarma
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-white" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111827] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Naše služby
            </h2>
            <p className="text-[#374151] max-w-2xl mx-auto text-base sm:text-lg font-medium">
              Kompletní zahradnické služby od sekání trávníků po údržbu záhonů. 
              Profesionální přístup a férovost.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service, idx) => (
              <Card 
                key={idx} 
                className="card-hover bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-[#2E8B3E]/30"
                data-testid={`service-card-${idx}`}
              >
                <CardContent className="p-5 sm:p-6 md:p-8">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#2E8B3E] rounded-xl flex items-center justify-center mb-5 shadow-md">
                    <service.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#111827] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {service.title}
                  </h3>
                  <p className="text-[#374151] mb-4 text-sm leading-relaxed font-medium">
                    {service.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-sm text-[#374151] font-medium">
                        <CheckCircle className="w-4 h-4 text-[#2E8B3E] flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                    <span className="text-sm font-semibold text-[#6B7280]">Cena:</span>
                    <span className="text-lg font-black text-[#2E8B3E]">{service.price}</span>
                  </div>
                  <Link to="/rezervace" className="block mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full border-2 border-[#2E8B3E] text-[#2E8B3E] hover:bg-[#F0FDF4] rounded-lg font-bold"
                    >
                      Více informací
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/sluzby">
              <Button 
                className="bg-[#2E8B3E] hover:bg-[#256d31] text-white rounded-full px-8 h-12 font-bold"
                data-testid="view-all-services-btn"
              >
                Zobrazit všechny služby
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-[#F8FAFC]" data-testid="why-us-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111827] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Proč si vybrat naše služby?
            </h2>
            <p className="text-[#374151] max-w-2xl mx-auto text-base sm:text-lg font-medium">
              Mladý tým s energií a profesionálním přístupem. 
              Férové ceny bez skrytých poplatků.
            </p>
          </div>

          {/* How it works */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
            {steps.map((step, idx) => (
              <div key={idx} className="text-center" data-testid={`step-${idx}`}>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md border border-gray-100">
                  <step.icon className="w-7 h-7 text-[#3FA34D]" />
                </div>
                <p className="text-sm text-[#9CA3AF] mb-1">{idx + 1}.</p>
                <h4 className="font-semibold text-[#222222] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {step.title}
                </h4>
                <p className="text-sm text-[#4B5563]">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100"
                data-testid={`stat-${idx}`}
              >
                <p className="text-3xl md:text-4xl font-bold text-[#3FA34D] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {stat.value}
                </p>
                <p className="text-sm text-[#4B5563]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 md:py-24 bg-[#F0FDF4]" data-testid="reviews-section">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest text-[#3FA34D] uppercase mb-3 bg-[#3FA34D]/10 px-4 py-1.5 rounded-full">
              Hodnocení zákazníků
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Co říkají naši zákazníci
            </h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-[#4B5563] text-sm">Průměrné hodnocení 5.0 ze 5 — přes 20 recenzí</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                data-testid={`review-card-${idx}`}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[#374151] text-sm leading-relaxed mb-5 italic">
                  "{review.text}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: review.color }}
                  >
                    {review.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                    <p className="text-xs text-gray-400">{review.location} · {review.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-white" data-testid="faq-section">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#222222] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Často kladené otázky
            </h2>
            <p className="text-[#4B5563]">
              Odpovědi na nejčastější otázky o našich službách a praktické rady pro vaši zahradu.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, idx) => (
              <AccordionItem 
                key={idx} 
                value={`item-${idx}`}
                className="bg-[#F9FAFB] rounded-xl border-none px-6"
                data-testid={`faq-item-${idx}`}
              >
                <AccordionTrigger className="text-left font-medium text-[#222222] hover:no-underline py-5">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#4B5563] pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#222222]" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Chcete zahradu jako z katalogu?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Objednejte se ještě dnes a svěřte péči o trávník profesionálům. 
            Rychle, spolehlivě a za férové ceny.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/rezervace">
              <Button 
                size="lg"
                className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-10 h-14 text-base font-semibold"
                data-testid="cta-rezervace"
              >
                Rezervovat online
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="tel:+420730588372">
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 rounded-full px-10 h-14 text-base font-semibold"
                data-testid="cta-phone"
              >
                <Phone className="w-5 h-5 mr-2" />
                730 588 372
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
