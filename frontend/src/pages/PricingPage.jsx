import { Link } from 'react-router-dom';
import { 
  CheckCircle, ArrowRight, Star, Shield, Clock,
  Scissors, Sprout, Package, Phone, Zap,
  MessageCircle, MapPin, Truck, Flame, TreeDeciduous, Leaf
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import SEOHead, { SCHEMAS } from '../components/SEOHead';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import Reveal from '../components/Reveal';

const PricingPage = () => {
  const steps = [
    { 
      num: '01', 
      icon: MessageCircle, 
      title: 'Pošlete poptávku', 
      description: 'Vyplňte jednoduchý formulář, zavolejte nebo napište na WhatsApp. Popište, co potřebujete – sekání, likvidaci pozemku, sezónní péči.',
      color: 'bg-[#3FA34D]'
    },
    { 
      num: '02', 
      icon: MapPin, 
      title: 'Bezplatná obhlídka', 
      description: 'Přijedeme přímo k vám, zhodnotíme stav zahrady nebo pozemku a na místě připravíme přesnou kalkulaci. Obhlídka je zcela zdarma a nezávazná.',
      color: 'bg-[#2E8B3E]'
    },
    { 
      num: '03', 
      icon: CheckCircle, 
      title: 'Cena předem', 
      description: 'Přesnou cenu vždy znáte ještě před zahájením prací. Žádná překvapení, žádné skryté poplatky. Odsouhlasíte a my začneme.',
      color: 'bg-[#1B4332]'
    },
    { 
      num: '04', 
      icon: Truck, 
      title: 'Práce hotova', 
      description: 'Dorazíme v domluveném termínu, odvedeme kvalitní práci a po sobě vše uklidíme. Platíte až po dokončení – hotově nebo převodem.',
      color: 'bg-[#111827]'
    },
  ];

  const services = [
    { icon: Scissors, title: 'Sekání trávy', desc: 'Pravidelné i jednorázové sekání trávníků všech velikostí, s hnojením i bez.' },
    { icon: Flame, title: 'Likvidace pozemků', desc: 'Kompletní vyčištění zarostlých parcel, zahrad a pozemků – křoviny, nálety, vysoká tráva.' },
    { icon: Sprout, title: 'Sezónní balíčky', desc: 'Jarní restart, letní údržba, podzimní příprava na zimu, zimní úklid sněhu.' },
    { icon: TreeDeciduous, title: 'Zahradnické práce', desc: 'Pletí, výsadba, údržba záhonů, úprava terénu, odstranění kořenů.' },
    { icon: Truck, title: 'Odvoz odpadu', desc: 'Nakládka a ekologická likvidace zahradního odpadu – listí, větve, tráva, zemina.' },
    { icon: Package, title: 'VIP Celoroční servis', desc: 'Kompletní celoroční péče o zahradu – vertikutace, hnojení, sekání, zimní úklid.' },
  ];

  const benefits = [
    { icon: Star, title: '5/5 hodnocení', desc: 'Přes 20 spokojených zákazníků nás hodnotí na plný počet hvězd.' },
    { icon: Shield, title: 'Cena vždy předem', desc: 'Nikdy nezačínáme bez odsouhlasené ceny. Žádná překvapení.' },
    { icon: Clock, title: 'Odpověď do 24h', desc: 'Na každou poptávku odpovídáme nejpozději do druhého dne.' },
    { icon: MapPin, title: 'Dvůr Králové + 30 km', desc: 'Pokrýváme Trutnov, Vrchlabí, Hostinné, Jaroměř, Náchod a okolí.' },
  ];

  const faqItems = [
    { question: 'Proč nezveřejňujete ceník?', answer: 'Každá zahrada je jiná. Cena závisí na velikosti, stavu a přístupnosti. Chceme vám dát přesnou cenu – ne orientační číslo, které pak nesedí.' },
    { question: 'Je prohlídka opravdu zdarma?', answer: 'Ano, 100% zdarma a bez závazku. Přijedeme, podíváme se a nacenujeme. Pokud se nedohodneme, nic neplatíte.' },
    { question: 'Jak rychle dostanu cenu?', answer: 'Cenu dostanete přímo při prohlídce – na místě, bez čekání.' },
  ];

  const priceFactors = [
    'Velikost plochy',
    'Stav trávy (pravidelně sekáno vs. přerostlé)',
    'Typ služby (sekání, hnojení, vertikutace, odvoz)',
    'Frekvence (jednorázově vs. pravidelně)',
    'Přístupnost pozemku',
  ];

  return (
    <div className="min-h-screen pt-16" data-testid="pricing-page">
      <SEOHead
        title="Cena sekání trávy – transparentně a bez překvapení | SeknuTo.cz"
        description="Cenu vždy stanovíme po bezplatné prohlídce vaší zahrady. Žádné skryté poplatky. Sekání trávy, likvidace pozemků, sezónní balíčky. Dvůr Králové a okolí."
        canonical="https://seknuto.cz/cenik"
        keywords="cena sekání trávy, kalkulace zahradník, bezplatná obhlídka zahrady, cena likvidace pozemku, zahradnické služby Dvůr Králové, cena údržba zahrady"
        schema={[
          SCHEMAS.breadcrumb([
            { name: 'Úvod', url: '/' },
            { name: 'Jak to funguje', url: '/cenik' },
          ]),
          SCHEMAS.faqPage(faqItems),
        ]}
      />

      {/* Hero */}
      <section className="py-10 bg-gradient-to-b from-[#F0FDF4] to-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-white border border-[#3FA34D]/30 rounded-full px-4 py-1.5 mb-4">
              <Zap className="w-4 h-4 text-[#3FA34D]" />
              <span className="text-sm font-medium text-[#3FA34D]">Bezplatná obhlídka • Cena vždy předem</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Jak zjistíte cenu?
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Každá zahrada je jiná. Proto nabízíme <strong>bezplatnou obhlídku</strong> na místě,
              kde vám sdělíme přesnou cenu ještě před zahájením prací.
            </p>
          </Reveal>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>5/5 hodnocení</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#3FA34D]" />
              <span>Bez skrytých poplatků</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#3FA34D]" />
              <span>Odpověď do 24h</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - 4 steps */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-10" style={{ fontFamily: 'Poppins, sans-serif' }}>
              4 jednoduché kroky
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <Reveal key={step.num} delay={(idx % 4) * 100} variant="reveal-scale" className="text-center" data-testid={`step-${step.num}`}>
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-bold text-[#3FA34D] mb-1 block">KROK {step.num}</span>
                <h3 className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </Reveal>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/rezervace">
              <Button className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-8 h-12 font-semibold shadow-lg">
                Poslat nezávaznou poptávku
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Co vše pro vás uděláme
            </h2>
            <p className="text-center text-gray-500 mb-10 max-w-xl mx-auto">
              Kompletní zahradnické služby od jednorázového sekání po celoroční péči. Cenu vždy stanovíme individuálně po obhlídce.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service, idx) => (
              <Reveal key={idx} delay={(idx % 3) * 100} variant="reveal-scale">
              <Card className="rounded-2xl border-2 border-gray-100 hover:border-[#3FA34D]/30 transition-all hover:shadow-lg h-full">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-[#F0FDF4] rounded-xl flex items-center justify-center mb-4">
                    <service.icon className="w-6 h-6 text-[#3FA34D]" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">{service.desc}</p>
                  <Link to="/rezervace" className="text-[#3FA34D] text-sm font-medium hover:underline inline-flex items-center gap-1">
                    Poptat <ArrowRight className="w-3 h-3" />
                  </Link>
                </CardContent>
              </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* What affects price */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <Reveal>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Co ovlivňuje cenu
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-3">
            {priceFactors.map((factor, i) => (
              <Reveal key={i} delay={(i % 2) * 100} variant="reveal-scale" className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <CheckCircle className="w-5 h-5 text-[#3FA34D] shrink-0" />
                <span className="text-sm font-medium text-gray-700">{factor}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal Packages */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <Reveal>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Sezónní balíčky
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: 'Jarní balíček', desc: 'Vertikutace + hnojení + první sekání sezóny', color: 'border-pink-200 bg-pink-50' },
              { title: 'Letní balíček', desc: 'Pravidelné sekání po celé léto + hnojení', color: 'border-yellow-200 bg-yellow-50' },
              { title: 'Podzimní balíček', desc: 'Vertikutace + podzimní hnojení + úklid listí', color: 'border-orange-200 bg-orange-50' },
              { title: 'VIP Celoroční servis', desc: 'Kompletní péče po celý rok – nemusíte na nic myslet', color: 'border-green-200 bg-green-50' },
            ].map((pkg, i) => (
              <Reveal key={i} delay={(i % 2) * 100} variant="reveal-scale" className={`p-5 rounded-xl border-2 ${pkg.color}`}>
                <h3 className="font-bold text-gray-900 mb-1">{pkg.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{pkg.desc}</p>
                <Link to="/rezervace" className="text-[#3FA34D] text-sm font-medium hover:underline inline-flex items-center gap-1">
                  Poptat balíček <ArrowRight className="w-3 h-3" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <Reveal>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Časté dotazy o cenách
            </h2>
          </Reveal>
          <Reveal>
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-gray-50 rounded-xl border border-gray-100 px-5">
                <AccordionTrigger className="text-left font-semibold text-gray-900 text-sm py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-600 pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          </Reveal>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((item, idx) => (
              <Reveal key={idx} delay={(idx % 4) * 100} variant="reveal-scale" className="text-center p-6 bg-[#F8FAFC] rounded-2xl border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100">
                  <item.icon className="w-6 h-6 text-[#3FA34D]" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-[#222]">
        <div className="max-w-4xl mx-auto px-4">
          <Reveal className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Chcete vědět, kolik bude stát vaše zahrada?
              </h2>
              <p className="text-gray-400 text-sm">
                Objednejte bezplatnou prohlídku. Přijedeme, nacenujeme a domluvíme se. Zdarma a nezávazně.
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
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
