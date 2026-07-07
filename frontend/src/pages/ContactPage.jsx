import { useState } from 'react';
import axios from 'axios';
import { Phone, Mail, MapPin, MessageCircle, Clock, Send, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import SEOHead, { SCHEMAS } from '../components/SEOHead';
import Reveal from '../components/Reveal';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Vyplňte prosím všechna povinná pole');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API}/contact`, formData);
      toast.success('Zpráva byla úspěšně odeslána! Brzy se vám ozveme.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Contact form failed:', error);
      toast.error('Při odesílání došlo k chybě. Zkuste to prosím znovu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefon',
      value: '+420 730 588 372',
      link: 'tel:+420730588372',
      description: 'Volejte Po-Pá 8-18h',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: '730 588 372',
      link: 'https://wa.me/420730588372',
      description: 'Rychlá odpověď do 2 hodin',
      highlight: true,
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'info@seknuto.cz',
      link: 'mailto:info@seknuto.cz',
      description: 'Odpovíme do 24 hodin',
    },
    {
      icon: MapPin,
      title: 'Oblast působení',
      value: 'Dvůr Králové nad Labem',
      description: 'a okolí do 50 km',
    },
  ];

  return (
    <div className="min-h-screen pt-20" data-testid="contact-page">
      <SEOHead
        title="Kontakt | SeknuTo.cz – Sekání trávy Dvůr Králové"
        description="Kontaktujte SeknuTo.cz pro nezávaznou cenovou nabídku. Tel: 730 588 372. Zahradnické služby ve Dvoře Králové nad Labem a okolí."
        canonical="https://seknuto.cz/kontakt"
        schema={SCHEMAS.localBusiness}
      />
      {/* Hero */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-[#F0FDF4] via-white to-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <Reveal>
            <h1 className="text-4xl md:text-5xl font-bold text-[#222222] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Kontakt
            </h1>
            <p className="text-lg text-[#4B5563] max-w-2xl mx-auto">
              Máte dotaz nebo chcete nezávaznou cenovou nabídku?
              Ozvěte se nám – rádi pomůžeme!
            </p>
          </Reveal>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <Reveal variant="reveal-left">
              <h2 className="text-2xl font-bold text-[#222222] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Kontaktní údaje
              </h2>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {contactInfo.map((item, idx) => (
                  <Reveal key={idx} delay={(idx % 2) * 100} variant="reveal-scale">
                  <Card
                    className={`rounded-xl h-full ${item.highlight ? 'border-[#25D366] bg-[#F0FFF4]' : 'border-gray-100'}`}
                    data-testid={`contact-info-${idx}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          item.highlight ? 'bg-[#25D366]' : 'bg-[#F0FDF4]'
                        }`}>
                          <item.icon className={`w-6 h-6 ${item.highlight ? 'text-white' : 'text-[#3FA34D]'}`} />
                        </div>
                        <div>
                          <p className="text-sm text-[#9CA3AF] mb-1">{item.title}</p>
                          {item.link ? (
                            <a 
                              href={item.link}
                              target={item.link.startsWith('http') ? '_blank' : undefined}
                              rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                              className={`font-semibold hover:underline ${
                                item.highlight ? 'text-[#25D366]' : 'text-[#222222]'
                              }`}
                            >
                              {item.value}
                            </a>
                          ) : (
                            <p className="font-semibold text-[#222222]">{item.value}</p>
                          )}
                          <p className="text-xs text-[#9CA3AF] mt-1">{item.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  </Reveal>
                ))}
              </div>

              {/* Working Hours */}
              <Card className="rounded-xl border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-[#3FA34D]" />
                    <h3 className="font-semibold text-[#222222]">Pracovní doba</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#4B5563]">Pondělí - Pátek</span>
                      <span className="font-medium text-[#222222]">8:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#4B5563]">Sobota</span>
                      <span className="font-medium text-[#222222]">9:00 - 15:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#4B5563]">Neděle</span>
                      <span className="text-[#9CA3AF]">Zavřeno</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp CTA */}
              <div className="mt-6 p-6 bg-[#25D366] rounded-xl text-white">
                <h3 className="font-bold text-lg mb-2">Nejrychlejší způsob kontaktu?</h3>
                <p className="text-white/90 text-sm mb-4">
                  Napište nám na WhatsApp – obvykle odpovídáme do 2 hodin!
                </p>
                <a 
                  href="https://wa.me/420730588372?text=Dobrý%20den,%20mám%20zájem%20o%20vaše%20služby."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button 
                    className="bg-white text-[#25D366] hover:bg-gray-100 rounded-full"
                    data-testid="contact-whatsapp-btn"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Napsat na WhatsApp
                  </Button>
                </a>
              </div>
            </Reveal>

            {/* Contact Form */}
            <Reveal variant="reveal-right" delay={120}>
              <h2 className="text-2xl font-bold text-[#222222] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Napište nám
              </h2>
              
              <Card className="rounded-xl border-gray-100 shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-[#222222]">
                        Jméno *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-2 h-12"
                        placeholder="Vaše jméno"
                        required
                        data-testid="contact-input-name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-[#222222]">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-2 h-12"
                        placeholder="vas@email.cz"
                        required
                        data-testid="contact-input-email"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-[#222222]">
                        Telefon (volitelné)
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-2 h-12"
                        placeholder="+420 123 456 789"
                        data-testid="contact-input-phone"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <Label htmlFor="message" className="text-sm font-medium text-[#222222]">
                        Zpráva *
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        className="mt-2 min-h-[150px]"
                        placeholder="Jak vám můžeme pomoci?"
                        required
                        data-testid="contact-input-message"
                      />
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-lg h-12"
                      data-testid="contact-submit-btn"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Odesílám...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Odeslat zprávu
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="py-12 md:py-20 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <Reveal>
            <h2 className="text-2xl font-bold text-[#222222] text-center mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Naše oblast působení
            </h2>
          </Reveal>
          <Reveal variant="reveal-scale" delay={100} className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <MapPin className="w-12 h-12 text-[#3FA34D] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#222222] mb-2">Dvůr Králové nad Labem</h3>
            <p className="text-[#4B5563] mb-4">a okolí do vzdálenosti 50 km</p>
            <p className="text-sm text-[#9CA3AF]">
              Trutnov • Jaroměř • Náchod • Hradec Králové • a další
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
