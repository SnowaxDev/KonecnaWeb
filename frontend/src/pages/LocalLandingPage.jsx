import { Link, useParams } from 'react-router-dom';
import { 
  CheckCircle, ArrowRight, Phone, MessageCircle, MapPin, 
  Star, Shield, Clock, Zap, Scissors, Flame, Sprout, TreeDeciduous, Truck, Package
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import SEOHead, { SCHEMAS } from '../components/SEOHead';

const CITY_DATA = {
  trutnov:  { name: 'Trutnov',  distanceKm: 20 },
  vrchlabi: { name: 'Vrchlabí', distanceKm: 25 },
  jaromer:  { name: 'Jaroměř',  distanceKm: 22 },
  nachod:   { name: 'Náchod',   distanceKm: 30 },
  hostinne: { name: 'Hostinné', distanceKm: 18 },
};

const LocalLandingPage = ({ citySlug: propSlug }) => {
  const params = useParams();
  const slug = propSlug || params.citySlug;
  const city = CITY_DATA[slug];

  if (!city) {
    return (
      <div className="min-h-screen pt-24 text-center">
        <h1 className="text-2xl font-bold">Stránka nenalezena</h1>
        <Link to="/" className="text-[#3FA34D] mt-4 inline-block">Zpět na hlavní stránku</Link>
      </div>
    );
  }

  const { name, distanceKm } = city;

  const faqItems = [
    {
      question: `Jak rychle přijedete do ${name}?`,
      answer: `Do ${name} jezdíme pravidelně. Dojezdová vzdálenost je ${distanceKm} km z Dvůra Králové. Termín domluvíme běžně do 3–5 dnů.`,
    },
    {
      question: `Jaké služby nabízíte v ${name}?`,
      answer: `Sekání trávy, vertikutaci, hnojení, likvidaci zarostlých pozemků, odvoz bioodpadu, sezónní balíčky a celoroční VIP servis – vše dostupné i v ${name} a okolí.`,
    },
    {
      question: `Jak zjistím cenu sekání v ${name}?`,
      answer: `Přijedeme se podívat – zdarma a nezávazně. Cenu dostanete přímo na místě, bez čekání. Zavolejte 730 588 372 nebo pošlete poptávku online.`,
    },
  ];

  const services = [
    { icon: Scissors, title: 'Sekání trávy', desc: 'Pravidelné i jednorázové sekání trávníků, s hnojením i bez.' },
    { icon: Flame, title: 'Likvidace pozemků', desc: 'Vyčištění zarostlých parcel – křoviny, nálety, vysoká tráva.' },
    { icon: Sprout, title: 'Sezónní balíčky', desc: 'Jarní restart, letní údržba, podzimní příprava.' },
    { icon: TreeDeciduous, title: 'Zahradnické práce', desc: 'Pletí, výsadba, úprava terénu.' },
    { icon: Truck, title: 'Odvoz odpadu', desc: 'Nakládka a ekologická likvidace.' },
    { icon: Package, title: 'VIP Celoroční servis', desc: 'Kompletní celoroční péče.' },
  ];

  const benefits = [
    `Místní firma – jezdíme pravidelně do ${name}`,
    'Bez příplatku za dojezd v rámci 30 km',
    'Cena jasná před zahájením prací',
    'Rychlá odpověď do 24 hodin',
    'Profesionální vybavení a zkušený tým',
    'Hodnocení 5/5 od zákazníků v okolí',
  ];

  return (
    <div className="min-h-screen pt-16" data-testid={`landing-${slug}`}>
      <SEOHead
        title={`Sekání trávy ${name} | SeknuTo.cz – Bezplatná prohlídka`}
        description={`Profesionální sekání trávy v ${name} a okolí. Bezplatná prohlídka a kalkulace zdarma. Místní tým z Dvůra Králové. 730 588 372`}
        canonical={`https://seknuto.cz/sekani-travy-${slug}`}
        keywords={`sekání trávy ${name}, zahradník ${name}, zahradnické služby ${name}, údržba trávníku ${name}, vertikutace ${name}, likvidace pozemků ${name}`}
        schema={[
          SCHEMAS.localLanding({ cityName: name, citySlug: slug }),
          SCHEMAS.faqPage(faqItems),
          SCHEMAS.breadcrumb([
            { name: 'Úvod', url: '/' },
            { name: `Sekání trávy ${name}`, url: `/sekani-travy-${slug}` },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="py-12 bg-gradient-to-b from-[#F0FDF4] to-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-[#3FA34D]/30 rounded-full px-4 py-1.5 mb-4">
            <MapPin className="w-4 h-4 text-[#3FA34D]" />
            <span className="text-sm font-medium text-[#3FA34D]">Dvůr Králové → {name} ({distanceKm} km)</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Sekání trávy {name} a okolí
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-base sm:text-lg">
            Místní tým SeknuTo.cz z Dvůra Králové. Sekáme zahrady v {name} a okolí. 
            Bezplatná prohlídka a kalkulace na míru.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/rezervace">
              <Button size="lg" className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-8 h-14 text-base font-bold shadow-lg">
                Objednat bezplatnou prohlídku
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="https://wa.me/420730588372" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-2 border-[#2E8B3E] text-[#2E8B3E] hover:bg-[#F0FDF4] rounded-full px-8 h-14 text-base font-bold">
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp: 730 588 372
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Jak to funguje
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Přijedeme se podívat', desc: 'Zdarma a nezávazně. Zhodnotíme stav zahrady na místě.' },
              { num: '02', title: 'Nacenění na místě', desc: 'Přesnou cenu dostanete přímo při prohlídce – bez čekání.' },
              { num: '03', title: 'Domluvíme termín', desc: 'Souhlasíte? Domluvíme termín. Nesouhlasíte? Žádný závazek.' },
            ].map(step => (
              <div key={step.num} className="text-center">
                <div className="w-14 h-14 bg-[#3FA34D] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">{step.num}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Co vše děláme v {name}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s, i) => (
              <Card key={i} className="rounded-xl border border-gray-100 hover:border-[#3FA34D]/30 transition-all hover:shadow-md">
                <CardContent className="p-5">
                  <div className="w-10 h-10 bg-[#F0FDF4] rounded-lg flex items-center justify-center mb-3">
                    <s.icon className="w-5 h-5 text-[#3FA34D]" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{s.title}</h3>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Proč my v {name}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <CheckCircle className="w-5 h-5 text-[#3FA34D] shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 font-medium">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Nejčastější dotazy
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-white rounded-xl border border-gray-100 px-5">
                <AccordionTrigger className="text-left font-semibold text-gray-900 text-sm py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-600 pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-[#222]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Sekání trávy {name} – bezplatná prohlídka
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Pošlete nezávaznou poptávku. Přijedeme, prohlédneme a sdělíme přesnou cenu. Zdarma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/rezervace">
              <Button size="lg" className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-8 h-14 font-bold">
                Objednat online
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="tel:+420730588372">
              <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-14 font-bold">
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

export default LocalLandingPage;
