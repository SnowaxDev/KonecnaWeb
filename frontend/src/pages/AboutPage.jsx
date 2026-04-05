import { Link } from 'react-router-dom';
import { Users, Heart, MapPin, Leaf, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import SEOHead from '../components/SEOHead';

const AboutPage = () => {
  const values = [
    {
      icon: Heart,
      title: 'Férovost',
      description: 'Transparentní ceny bez skrytých poplatků. Co řekneme, to platí.',
    },
    {
      icon: Users,
      title: 'Kvalita',
      description: 'Každou práci děláme jako bychom ji dělali pro sebe. Na kvalitu nedáme dopustit.',
    },
    {
      icon: MapPin,
      title: 'Lokálnost',
      description: 'Jsme z Dvora Králové a známe místní podmínky. Podporujeme lokální komunitu.',
    },
    {
      icon: Leaf,
      title: 'Přátelskost',
      description: 'S námi je komunikace snadná a příjemná. Jsme tu pro vás.',
    },
  ];

  return (
    <div className="min-h-screen pt-20" data-testid="about-page">
      <SEOHead
        title="O nás | SeknuTo.cz – Zahradnické služby Dvůr Králové"
        description="Jsme lokální tým zahradníků z Dvůru Králové nad Labem. Poskytujeme profesionální sekání trávy a zahradnické služby s důrazem na spolehlivost a férové ceny."
        canonical="https://seknuto.cz/o-nas"
        keywords="zahradník Dvůr Králové, zahradnická firma Královéhradecký kraj, lokální zahradnické služby"
      />
      {/* Hero */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-[#F0FDF4] via-white to-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#222222] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                O nás
              </h1>
              <p className="text-lg text-[#4B5563] mb-6 leading-relaxed">
                Jsme parta kluků z Dvora Králové, co mají rádi práci venku a baví je dělat zahrady krásné.
              </p>
              <p className="text-[#4B5563] mb-8 leading-relaxed">
                Založili jsme SeknuTo.cz, protože jsme věděli, že můžeme pomoci lidem ušetřit čas a mít 
                krásný trávník bez starostí. Naším cílem je poskytovat profesionální služby s lidským 
                přístupem za férové ceny.
              </p>
              <Link to="/rezervace">
                <Button 
                  className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-8"
                  data-testid="about-cta"
                >
                  Rezervovat službu
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/6728919/pexels-photo-6728919.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Tým SeknuTo.cz při práci"
                className="rounded-2xl shadow-2xl w-full object-cover h-[400px]"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4">
                <p className="text-3xl font-bold text-[#3FA34D]" style={{ fontFamily: 'Poppins, sans-serif' }}>2025</p>
                <p className="text-sm text-[#4B5563]">Založeno</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-bold text-[#222222] text-center mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Náš příběh
          </h2>
          <div className="prose prose-lg max-w-none text-[#4B5563]">
            <p className="mb-4">
              Všechno to začalo jednoduše – pomáhali jsme sousedům s údržbou zahrad a zjistili jsme, 
              že nás to baví. Práce venku, fyzická aktivita a hlavně radost zákazníků, když vidí 
              svůj upravený trávník.
            </p>
            <p className="mb-4">
              Postupně se nám ozývalo stále více lidí a my jsme se rozhodli z toho udělat pořádnou věc. 
              Pořídili jsme profesionální techniku, sjednotili postupy a vytvořili SeknuTo.cz.
            </p>
            <p>
              Dnes obsluhujeme desítky spokojených zákazníků v Dvoře Králové a okolí. A pořád nás to baví 
              stejně jako na začátku. Možná i víc.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 md:py-20 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-bold text-[#222222] text-center mb-12" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Naše hodnoty
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <Card 
                key={idx}
                className="card-hover rounded-2xl border-gray-100"
                data-testid={`value-${idx}`}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-[#F0FDF4] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-[#3FA34D]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#222222] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {value.title}
                  </h3>
                  <p className="text-sm text-[#4B5563]">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#222222] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Mladý tým s energií
          </h2>
          <p className="text-lg text-[#4B5563] mb-8">
            Jsme mladý, dynamický tým, který má chuť do práce. Nebojíme se žádné výzvy a každou 
            zahradu bereme jako nový projekt, do kterého dáváme maximum.
          </p>
          
          <div className="bg-[#F0FDF4] rounded-2xl p-8">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-[#3FA34D]" style={{ fontFamily: 'Poppins, sans-serif' }}>50+</p>
                <p className="text-sm text-[#4B5563]">Spokojených zákazníků</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#3FA34D]" style={{ fontFamily: 'Poppins, sans-serif' }}>30 km</p>
                <p className="text-sm text-[#4B5563]">Dosah služeb</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#3FA34D]" style={{ fontFamily: 'Poppins, sans-serif' }}>100%</p>
                <p className="text-sm text-[#4B5563]">Nasazení</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 bg-[#222222]">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Pojďme spolupracovat
          </h2>
          <p className="text-gray-400 mb-8">
            Máte zahradu, která potřebuje péči? Ozvěte se nám a my se o ni postaráme.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/rezervace">
              <Button 
                className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-8 h-12"
                data-testid="about-cta-bottom"
              >
                Rezervovat službu
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/kontakt">
              <Button 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8 h-12"
              >
                Kontaktovat nás
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
