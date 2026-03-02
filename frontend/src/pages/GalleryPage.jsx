import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const projects = [
  {
    id: 1,
    title: 'Přerostlá louka → luxusní trávník',
    category: 'Hrubé sekání',
    location: 'Dvůr Králové n. L.',
    date: 'Září 2024',
    description: 'Zahrada nebyla sekána celé léto. Tráva dosahovala výšky 60 cm. Po hrubém sekání a úklidu vznikl čistý základ pro pravidelnou údržbu.',
    before: 'https://images.unsplash.com/photo-1723291056776-aec9c390b1d8?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
    after: 'https://images.unsplash.com/photo-1594498653385-d5172c532c00?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
    tag: 'Hrubé sekání',
    tagColor: 'bg-orange-100 text-orange-800',
  },
  {
    id: 2,
    title: 'Jarní restart zahrady',
    category: 'Jarní balíček',
    location: 'Trutnov',
    date: 'Duben 2024',
    description: 'Jarní balíček zahrnoval vertikutaci, hnojení a první sekání sezóny. Trávník se krásně probral a do měsíce byl hustý a zelený.',
    before: 'https://images.unsplash.com/photo-1738669375238-749c847502cb?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
    after: 'https://images.unsplash.com/photo-1661133732576-6140941d5421?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
    tag: 'Jarní balíček',
    tagColor: 'bg-pink-100 text-pink-800',
  },
  {
    id: 3,
    title: 'Pravidelná letní údržba',
    category: 'Letní balíček',
    location: 'Jaroměř',
    date: 'Červenec 2024',
    description: 'Zákazník využil letní balíček s pravidelným sekáním každé 2 týdny. Díky hnojení a správné výšce sečení trávník odolával i letnímu horku.',
    before: 'https://images.unsplash.com/photo-1768055418561-93437e061b32?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
    after: 'https://images.unsplash.com/photo-1759750909584-b96825e93de8?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
    tag: 'Letní balíček',
    tagColor: 'bg-yellow-100 text-yellow-800',
  },
  {
    id: 4,
    title: 'Podzimní příprava na zimu',
    category: 'Podzimní balíček',
    location: 'Náchod',
    date: 'Říjen 2024',
    description: 'Podzimní balíček: úklid listí, poslední sekání sezóny, přihnojení na zimu. Zahrada byla připravena tak, aby na jaře co nejdříve ozelněla.',
    before: 'https://images.unsplash.com/photo-1726484204083-7c9c1daf31b7?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
    after: 'https://images.unsplash.com/photo-1743627621279-e34a2efac6ac?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
    tag: 'Podzimní balíček',
    tagColor: 'bg-amber-100 text-amber-800',
  },
];

const CATEGORIES = ['Vše', 'Hrubé sekání', 'Jarní balíček', 'Letní balíček', 'Podzimní balíček'];

// Before/After slider component
const BeforeAfterCard = ({ project, onOpen }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => onOpen(project)}
      data-testid={`gallery-card-${project.id}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* Before image */}
        <img
          src={project.before}
          alt={`Před – ${project.title}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hover ? 'opacity-0' : 'opacity-100'}`}
        />
        {/* After image */}
        <img
          src={project.after}
          alt={`Po – ${project.title}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hover ? 'opacity-100' : 'opacity-0'}`}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        />

        {/* Before/After label */}
        <div className="absolute inset-0 flex items-end p-3 gap-2"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full transition-all ${hover ? 'bg-[#3FA34D] text-white' : 'bg-red-500 text-white'}`}>
            {hover ? 'PO' : 'PŘED'}
          </span>
          <span className="text-xs text-white/80 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
            Najeďte myší pro zobrazení výsledku
          </span>
        </div>

        {/* Tag */}
        <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${project.tagColor}`}>
          {project.tag}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1 text-sm group-hover:text-[#3FA34D] transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {project.title}
        </h3>
        <p className="text-xs text-gray-500">{project.location} · {project.date}</p>
      </div>
    </div>
  );
};

// Lightbox modal
const Lightbox = ({ project, onClose, onPrev, onNext }) => {
  const [showAfter, setShowAfter] = useState(false);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
        data-testid="lightbox-modal"
      >
        <div className="relative aspect-video bg-gray-900">
          <img
            src={showAfter ? project.after : project.before}
            alt={showAfter ? 'Po' : 'Před'}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <button
              onClick={() => setShowAfter(false)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${!showAfter ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}
            >
              PŘED
            </button>
            <button
              onClick={() => setShowAfter(true)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${showAfter ? 'bg-[#3FA34D] text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}
            >
              PO
            </button>
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
            <X className="w-5 h-5" />
          </button>
          <button onClick={onPrev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={onNext} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{project.title}</h2>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${project.tagColor}`}>{project.tag}</span>
          </div>
          <p className="text-gray-600 text-sm mb-2">{project.description}</p>
          <p className="text-xs text-gray-400">{project.location} · {project.date}</p>
        </div>
      </div>
    </div>
  );
};

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('Vše');
  const [lightboxProject, setLightboxProject] = useState(null);

  const filtered = activeCategory === 'Vše'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  const currentIdx = lightboxProject ? filtered.findIndex(p => p.id === lightboxProject.id) : -1;

  const handlePrev = () => {
    const prev = filtered[(currentIdx - 1 + filtered.length) % filtered.length];
    setLightboxProject(prev);
  };

  const handleNext = () => {
    const next = filtered[(currentIdx + 1) % filtered.length];
    setLightboxProject(next);
  };

  return (
    <div className="min-h-screen" data-testid="gallery-page">
      {/* Hero */}
      <section className="pt-28 pb-12 bg-gradient-to-br from-[#F0FDF4] via-white to-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#3FA34D] uppercase mb-4 bg-[#3FA34D]/10 px-4 py-1.5 rounded-full">
            Naše práce
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1B4332] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Ukázky realizací
          </h1>
          <p className="text-[#4B5563] text-lg max-w-2xl mx-auto">
            Prohlédněte si, jak proměňujeme zahrady a trávníky. Každý projekt je dokladem naší pečlivé práce.
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="py-6 bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {filtered.map(project => (
              <BeforeAfterCard
                key={project.id}
                project={project}
                onOpen={setLightboxProject}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">Žádné projekty v této kategorii</p>
            </div>
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

      {/* Lightbox */}
      {lightboxProject && (
        <Lightbox
          project={lightboxProject}
          onClose={() => setLightboxProject(null)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
