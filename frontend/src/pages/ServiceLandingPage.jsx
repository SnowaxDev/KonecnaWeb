import { Link, useParams } from 'react-router-dom';
import {
  CheckCircle, ArrowRight, Phone, MessageCircle, MapPin,
  TreeDeciduous, Sprout, Scissors, TreePine, Axe, Flower2,
  Ruler, Leaf, Droplets, ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import SEOHead, { SCHEMAS } from '../components/SEOHead';
import Reveal from '../components/Reveal';

// Samostatné SEO landing stránky pro hlavní služby
const SERVICE_DATA = {
  'strihani-keru-kaceni-stromu': {
    badge: 'Keře · túje · živé ploty · stromy',
    h1: 'Stříhání keřů a kácení stromů',
    hero: 'Stříhání a tvarování keřů, tújí a živých plotů, ořez i kompletní kácení stromů ve Dvoře Králové nad Labem a okolí do 30 km. Profesionální technika, úklid a odvoz větví v ceně.',
    metaTitle: 'Stříhání keřů a kácení stromů Dvůr Králové | SeknuTo.cz',
    metaDescription: 'Profesionální stříhání keřů, živých plotů a tújí, ořez a kácení stromů ve Dvoře Králové a okolí. Rizikové kácení, štěpkování a odvoz větví. Bezplatná obhlídka. 730 588 372',
    keywords: 'stříhání keřů Dvůr Králové, stříhání živých plotů, tvarování tújí, ořez stromů, kácení stromů Dvůr Králové, rizikové kácení, prořez ovocných stromů, štěpkování větví, řez keřů Trutnov',
    serviceName: 'Stříhání keřů a kácení stromů',
    serviceDesc: 'Stříhání a tvarování keřů, tújí a živých plotů, ořez a kácení stromů včetně rizikového kácení, štěpkování a odvozu větví.',
    services: [
      { icon: Scissors, title: 'Stříhání keřů a tújí', desc: 'Tvarování okrasných keřů, tújí a zerav do roviny i do tvaru.' },
      { icon: TreeDeciduous, title: 'Stříhání živých plotů', desc: 'Pravidelný i jednorázový řez živých plotů všech výšek.' },
      { icon: TreePine, title: 'Ořez a prořez stromů', desc: 'Zdravotní a bezpečnostní ořez, prosvětlení korun, řez ovocných stromů.' },
      { icon: Axe, title: 'Kácení stromů', desc: 'Kácení stromů včetně rizikového kácení po částech v omezeném prostoru.' },
      { icon: Leaf, title: 'Štěpkování větví', desc: 'Štěpkování větví přímo na místě – méně odpadu a žádný nepořádek.' },
      { icon: ShieldCheck, title: 'Úklid a odvoz', desc: 'Naložení, ekologická likvidace a kompletní úklid po práci.' },
    ],
    benefits: [
      'Profesionální vybavení – výškové práce i řez ze žebříku',
      'Rizikové kácení po částech tam, kde nelze kácet celé',
      'Štěpkování a odvoz větví rovnou v ceně',
      'Cena jasná před zahájením prací',
      'Místní firma z Dvůra Králové, dojezd do 30 km',
      'Rychlá odpověď do 24 hodin',
    ],
    faq: [
      { question: 'Kdy je nejlepší stříhat keře a živé ploty?', answer: 'Většinu keřů a živých plotů (např. túje, ptačí zob, habr) stříháme od jara do podzimu, ideálně 1–2× ročně. Konkrétní termín rádi doporučíme při bezplatné obhlídce podle druhu rostlin.' },
      { question: 'Provádíte i rizikové kácení u domu nebo drátů?', answer: 'Ano. Stromy v omezeném prostoru – u domu, plotu nebo elektrického vedení – kácíme bezpečně po částech. Vždy nejprve posoudíme situaci na místě.' },
      { question: 'Odvážíte větve a uklidíte po sobě?', answer: 'Samozřejmě. Větve nastěpkujeme nebo naložíme a ekologicky zlikvidujeme a místo po práci uklidíme. Vše je součástí nabídky.' },
      { question: 'Kolik stojí stříhání keřů nebo kácení stromu?', answer: 'Cena závisí na rozsahu, výšce a přístupnosti. Přesnou cenu dostanete při bezplatné nezávazné obhlídce – bez čekání a bez skrytých poplatků.' },
    ],
  },
  'pokladani-travniku': {
    badge: 'Travní koberec · setý trávník · podloží',
    h1: 'Pokládání trávníku',
    hero: 'Pokládka travního koberce i zakládání trávníku ze semene ve Dvoře Králové nad Labem a okolí do 30 km. Připravíme podloží, položíme rolovaný trávník a předáme vám okamžitě zelenou zahradu – s úklidem a poradenstvím o péči.',
    metaTitle: 'Pokládání trávníku a travní koberec Dvůr Králové | SeknuTo.cz',
    metaDescription: 'Pokládka travního koberce a zakládání trávníku ze semene ve Dvoře Králové a okolí. Příprava podloží, rolovaný trávník, okamžitě zelená zahrada. Bezplatná obhlídka. 730 588 372',
    keywords: 'pokládání trávníku, pokládka travního koberce, travní koberec cena, travní koberec cena za m2, založení trávníku, rolovaný trávník, anglický trávník, založení trávníku ze semene, výsev trávníku, příprava podloží pod trávník, nový trávník Dvůr Králové, travní koberec Dvůr Králové, pokládka trávníku Trutnov, pokládka trávníku Vrchlabí, zahradník Dvůr Králové',
    serviceName: 'Pokládání trávníku',
    serviceDesc: 'Pokládka travního koberce i zakládání trávníku ze semene – příprava podloží, rotavace, pokládka rolovaného trávníku, zaválcování a poradenství o závlaze a péči.',
    services: [
      { icon: Ruler, title: 'Příprava a srovnání podloží', desc: 'Odplevelení, nakypření a urovnání vegetační vrstvy pro rovný trávník.' },
      { icon: Sprout, title: 'Pokládka travního koberce', desc: 'Rolovaný (předpěstovaný) trávník s okamžitě zeleným a hustým výsledkem.' },
      { icon: Leaf, title: 'Založení trávníku ze semene', desc: 'Výsev kvalitní travní směsi vhodné pro vaši zahradu a podmínky.' },
      { icon: Droplets, title: 'Závlaha a poradenství', desc: 'Doporučíme zálivku a péči, případně připravíme automatickou závlahu.' },
      { icon: Scissors, title: 'První seč a dokončení', desc: 'Poradíme s prvním sečením a předáme trávník připravený k užívání.' },
      { icon: ShieldCheck, title: 'Úklid po práci', desc: 'Odvoz odpadu a kompletní úklid – přebíráte hotovou zahradu.' },
    ],
    benefits: [
      'Travní koberec = okamžitě zelená a hustá zahrada bez plevele',
      'Koberec pokládáme do 24 hodin od sloupnutí pro maximální ujmutí',
      'Poradíme: travní koberec vs. setí ze semene podle vašeho rozpočtu',
      'Správně připravené podloží = trávník, který vydrží',
      'Místní firma z Dvůra Králové, dojezd do 30 km',
      'Cena jasná před zahájením, rychlá odpověď do 24 hodin',
    ],
    faq: [
      { question: 'Kolik stojí travní koberec za m² včetně pokládky?', answer: 'Orientačně se cena travního koberce včetně pokládky pohybuje kolem 170–260 Kč/m² podle rozsahu a náročnosti přípravy podloží. Přesnou cenu vždy stanovíme po bezplatné nezávazné obhlídce.' },
      { question: 'Je lepší travní koberec, nebo trávník ze semene?', answer: 'Travní koberec je okamžitě funkční, hustý a bez plevele; setí ze semene je levnější, ale plně se zapojí až za sezónu či dvě a vyžaduje víc péče. Při obhlídce doporučíme variantu vhodnou pro vaši zahradu a rozpočet.' },
      { question: 'Kdy se travní koberec pokládá?', answer: 'V bezmrazém období, nejčastěji od dubna do října. Ideální je jaro a podzim kvůli nižší spotřebě vody a lepšímu zakořenění.' },
      { question: 'Jak připravíte podloží?', answer: 'Odstraníme plevel a kameny, nakypříme a urovnáme vegetační vrstvu (cca 20 cm) tak, aby byl trávník rovný a dobře zakořenil.' },
      { question: 'Jak nový trávník zalévat?', answer: 'Hned po pokládce vydatně (cca 10–15 l/m²) a první zhruba dva týdny pravidelně, aby koberec srostl s podložím. Přesný režim zálivky vám předáme.' },
      { question: 'Kdy můžu po novém trávníku chodit?', answer: 'Lehká zátěž je možná zhruba po dvou týdnech, plná zátěž přibližně po šesti týdnech od pokládky. První seč obvykle po cca dvou týdnech.' },
    ],
  },
  'realizace-zahrad': {
    badge: 'Návrh · trávníky · výsadba · úpravy',
    h1: 'Realizace zahrad',
    hero: 'Kompletní realizace zahrad na klíč ve Dvoře Králové nad Labem a okolí – od návrhu přes terénní úpravy a založení trávníku až po výsadbu zeleně. Nová zahrada od základu i proměna té stávající.',
    metaTitle: 'Realizace zahrad Dvůr Králové | Návrh a založení | SeknuTo.cz',
    metaDescription: 'Realizace zahrad na klíč ve Dvoře Králové a okolí – návrh zahrady, zakládání trávníků ze semene i travního koberce, výsadba zeleně a terénní úpravy. Bezplatná obhlídka. 730 588 372',
    keywords: 'realizace zahrad Dvůr Králové, realizace zahrady cena, návrh zahrady, zahradní architekt Dvůr Králové, zakládání trávníků, pokládka travního koberce, založení trávníku ze semene, výsadba zeleně, terénní úpravy zahrada, automatická závlaha, nová zahrada na klíč, realizace zahrad Trutnov, realizace zahrad Vrchlabí',
    serviceName: 'Realizace zahrad',
    serviceDesc: 'Realizace zahrad na klíč – návrh, terénní úpravy, zakládání trávníků ze semene i travního koberce a výsadba zeleně.',
    services: [
      { icon: Ruler, title: 'Návrh zahrady', desc: 'Návrh řešení na míru podle vašich představ, pozemku a rozpočtu.' },
      { icon: Sprout, title: 'Zakládání trávníků', desc: 'Nový trávník ze semene i pokládka travního koberce s rychlým výsledkem.' },
      { icon: Flower2, title: 'Výsadba zeleně', desc: 'Výsadba stromů, okrasných keřů, trvalkových a okrasných záhonů.' },
      { icon: TreeDeciduous, title: 'Terénní a sadové úpravy', desc: 'Modelace terénu, srovnání ploch a příprava pozemku pro výsadbu.' },
      { icon: Droplets, title: 'Závlaha a obruby', desc: 'Příprava automatické závlahy, obrub záhonů a zpevněných ploch.' },
      { icon: ShieldCheck, title: 'Realizace na klíč', desc: 'Postaráme se o vše od první návštěvy po hotovou zahradu.' },
    ],
    benefits: [
      'Zahrada na klíč – jeden tým od návrhu po výsadbu',
      'Trávník ze semene i rychlá pokládka travního koberce',
      'Poradíme s výběrem rostlin vhodných pro vaši zahradu',
      'Cena jasná před zahájením prací',
      'Místní firma z Dvůra Králové, dojezd do 30 km',
      'Rychlá odpověď do 24 hodin',
    ],
    faq: [
      { question: 'Co všechno realizace zahrady zahrnuje?', answer: 'Od návrhu přes přípravu a modelaci terénu, založení trávníku a výsadbu zeleně až po obruby a přípravu závlahy. Rozsah přizpůsobíme vašim představám i rozpočtu.' },
      { question: 'Je lepší trávník ze semene, nebo travní koberec?', answer: 'Travní koberec dává okamžitý výsledek a je odolnější hned po pokládce, trávník ze semene je levnější. Při obhlídce doporučíme variantu vhodnou pro vaši zahradu.' },
      { question: 'Uděláte i návrh, nebo realizujete podle mého?', answer: 'Obojí. Navrhneme zahradu na míru, nebo zrealizujeme váš stávající návrh. Vše doladíme na bezplatné obhlídce přímo u vás.' },
      { question: 'Kolik realizace zahrady stojí?', answer: 'Každá zahrada je jiná, proto cenu stanovíme až po bezplatné obhlídce a podle zvoleného rozsahu. Cenu vždy znáte předem, bez skrytých poplatků.' },
    ],
  },
};

const ServiceLandingPage = ({ serviceSlug: propSlug }) => {
  const params = useParams();
  const slug = propSlug || params.serviceSlug;
  const data = SERVICE_DATA[slug];

  if (!data) {
    return (
      <div className="min-h-screen pt-24 text-center">
        <h1 className="text-2xl font-bold">Stránka nenalezena</h1>
        <Link to="/" className="text-[#3FA34D] mt-4 inline-block">Zpět na hlavní stránku</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16" data-testid={`service-landing-${slug}`}>
      <SEOHead
        title={data.metaTitle}
        description={data.metaDescription}
        canonical={`https://seknuto.cz/${slug}`}
        keywords={data.keywords}
        schema={[
          SCHEMAS.service({ name: data.serviceName, description: data.serviceDesc, areaServed: 'Dvůr Králové nad Labem' }),
          SCHEMAS.faqPage(data.faq),
          SCHEMAS.breadcrumb([
            { name: 'Úvod', url: '/' },
            { name: 'Služby', url: '/sluzby' },
            { name: data.h1, url: `/${slug}` },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="py-12 bg-gradient-to-b from-[#F0FDF4] to-white">
        <Reveal className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-[#3FA34D]/30 rounded-full px-4 py-1.5 mb-4">
            <TreeDeciduous className="w-4 h-4 text-[#3FA34D]" />
            <span className="text-sm font-medium text-[#3FA34D]">{data.badge}</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {data.h1} Dvůr Králové a okolí
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-base sm:text-lg">
            {data.hero}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/rezervace">
              <Button size="lg" className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-8 h-14 text-base font-bold shadow-lg">
                Objednat bezplatnou obhlídku
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
        </Reveal>
      </section>

      {/* 3 Steps */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <Reveal>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-10" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Jak to funguje
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Přijedeme se podívat', desc: 'Zdarma a nezávazně. Zhodnotíme stav na místě a poradíme.' },
              { num: '02', title: 'Nacenění na místě', desc: 'Přesnou cenu dostanete přímo při obhlídce – bez čekání.' },
              { num: '03', title: 'Domluvíme termín', desc: 'Souhlasíte? Domluvíme termín. Nesouhlasíte? Žádný závazek.' },
            ].map((step, idx) => (
              <Reveal key={step.num} delay={(idx % 3) * 100} variant="reveal-scale" className="text-center">
                <div className="w-14 h-14 bg-[#3FA34D] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">{step.num}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <Reveal>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Co pro vás uděláme
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.services.map((s, i) => (
              <Reveal key={i} delay={(i % 3) * 100} variant="reveal-scale" className="h-full">
              <Card className="h-full rounded-xl border border-gray-100 hover:border-[#3FA34D]/30 transition-all hover:shadow-md">
                <CardContent className="p-5">
                  <div className="w-10 h-10 bg-[#F0FDF4] rounded-lg flex items-center justify-center mb-3">
                    <s.icon className="w-5 h-5 text-[#3FA34D]" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{s.title}</h3>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </CardContent>
              </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <Reveal>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Proč si vybrat nás
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {data.benefits.map((b, i) => (
              <Reveal key={i} delay={(i % 2) * 100} variant="reveal-scale" className="flex items-start gap-3 p-3">
                <CheckCircle className="w-5 h-5 text-[#3FA34D] shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 font-medium">{b}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <Reveal>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Nejčastější dotazy
            </h2>
          </Reveal>
          <Accordion type="single" collapsible className="space-y-3">
            {data.faq.map((item, i) => (
              <Reveal key={i} delay={i * 100} variant="reveal-scale">
              <AccordionItem value={`faq-${i}`} className="bg-white rounded-xl border border-gray-100 px-5">
                <AccordionTrigger className="text-left font-semibold text-gray-900 text-sm py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-600 pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
              </Reveal>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-[#222]">
        <Reveal className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {data.h1} – bezplatná obhlídka
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
        </Reveal>
      </section>
    </div>
  );
};

export default ServiceLandingPage;
