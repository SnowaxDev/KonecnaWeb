import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowRight, Images, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import SEOHead, { SCHEMAS } from '../components/SEOHead';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import Reveal from '../components/Reveal';
import { normalizeProject } from '../data/galleryData';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Karta projektu s interaktivním PŘED/PO sliderem, proklik na detail
const BeforeAfterCard = ({ project, priority = false }) => {
  const photoCount = project.photo_count || 0;
  const videoCount = project.video_count || 0;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group lift-hover"
      data-testid={`gallery-card-${project.id}`}
    >
      <div className="relative">
        <BeforeAfterSlider
          before={project.before_images[0]}
          after={project.after_images[0]}
          alt={project.title}
          className="aspect-[4/3]"
          priority={priority}
        />

        {/* Tag */}
        <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full pointer-events-none ${project.tagColor}`}>
          {project.tag}
        </span>

        {/* Počet fotek a videí */}
        <div className="absolute top-3 left-3 flex gap-1.5 pointer-events-none">
          {photoCount > 2 && (
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-black/50 text-white backdrop-blur-sm">
              <Images className="w-3.5 h-3.5" /> {photoCount}
            </span>
          )}
          {videoCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#3FA34D]/90 text-white backdrop-blur-sm">
              <PlayCircle className="w-3.5 h-3.5" /> video
            </span>
          )}
        </div>
      </div>

      <Link to={`/nase-prace/${project.slug}`} className="block p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 mb-1 text-sm group-hover:text-[#3FA34D] transition-colors truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {project.title}
            </h3>
            <p className="text-xs text-gray-500">{project.location} · {project.date}</p>
          </div>
          <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-[#3FA34D]">
            Detail <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>
    </div>
  );
};

export default function GalleryPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Vše');

  useEffect(() => {
    // Zobrazujeme VÝHRADNĚ vlastní nahrané realizace. Žádné ukázkové/stock fotky –
    // při prázdnu nebo chybě raději nic (resp. hláška), ať web nepůsobí falešně.
    axios.get(`${API}/gallery/projects`)
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : [];
        setProjects(data.map(normalizeProject));
        setError(false);
      })
      .catch(() => { setProjects([]); setError(true); })
      .finally(() => setLoading(false));
  }, []);

  // Build dynamic categories from loaded projects
  const categories = ['Vše', ...new Set(projects.map(p => p.category || p.tag).filter(Boolean))];

  const filtered = activeCategory === 'Vše'
    ? projects
    : projects.filter(p => (p.category === activeCategory) || (p.tag === activeCategory));

  return (
    <div className="min-h-screen" data-testid="gallery-page">
      <SEOHead
        title="Ukázky naší práce – Sekání trávy Dvůr Králové | SeknuTo.cz"
        description="Prohlédněte si realizace SeknuTo.cz – sekání přerostlé trávy, stříhání keřů, jarní balíčky, pravidelná údržba zahrad. Výsledky před a po z Dvůra Králové, Trutnova a okolí."
        canonical="https://seknuto.cz/nase-prace"
        keywords="sekání trávy před a po, realizace zahrad Dvůr Králové, ukázky sekání trávy, fotky trávníku, zahradnické práce výsledky"
        schema={SCHEMAS.breadcrumb([
          { name: 'Úvod', url: '/' },
          { name: 'Naše práce', url: '/nase-prace' },
        ])}
      />
      {/* Hero */}
      <section className="pt-28 pb-12 bg-gradient-to-br from-[#F0FDF4] via-white to-[#F8FAFC]">
        <Reveal className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#3FA34D] uppercase mb-4 bg-[#3FA34D]/10 px-4 py-1.5 rounded-full">
            Naše práce
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1B4332] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Ukázky realizací
          </h1>
          <p className="text-[#4B5563] text-lg max-w-2xl mx-auto">
            Prohlédněte si, jak proměňujeme zahrady a trávníky. Přejeďte čárou po fotce a porovnejte stav před a po – kliknutím na projekt zobrazíte všechny fotky i videa.
          </p>
        </Reveal>
      </section>

      {/* Filter */}
      <section className="py-6 bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-[#3FA34D] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                data-testid={`filter-${cat}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#3FA34D] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-lg font-semibold text-gray-700 mb-1">Ukázky se teď nepodařilo načíst</p>
              <p className="text-gray-500 mb-6">Zkuste to prosím za chvíli, nebo nás rovnou nezávazně kontaktujte.</p>
              <Link to="/rezervace">
                <Button className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-8 h-11 font-semibold">
                  Nezávazná poptávka
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg font-semibold text-gray-700 mb-1">Připravujeme ukázky našich realizací</p>
              <p className="text-gray-500 mb-6">Fotky před/po brzy doplníme. Mezitím nám můžete napsat nezávaznou poptávku.</p>
              <Link to="/rezervace">
                <Button className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-8 h-11 font-semibold">
                  Nezávazná poptávka
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filtered.map((project, idx) => (
                  <Reveal key={project.id} delay={(idx % 2) * 90} variant="reveal-scale">
                    <BeforeAfterCard project={project} priority={idx === 0} />
                  </Reveal>
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                  <p className="text-lg">Žádné realizace v této kategorii</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#1B4332]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Chcete takový výsledek i vy?
          </h2>
          <p className="text-[#A7C4B2] mb-6">Rezervujte si termín ještě dnes a svěřte péči o trávník profesionálům.</p>
          <Link to="/rezervace">
            <Button className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-8 h-12 font-semibold">
              Objednat sekání
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
