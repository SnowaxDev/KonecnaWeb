import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ArrowRight, X, ChevronLeft, ChevronRight, MapPin, Calendar, Ruler, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import SEOHead, { SCHEMAS } from '../components/SEOHead';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import Reveal from '../components/Reveal';
import { SAMPLE_PROJECTS, normalizeProject, parseVideo } from '../data/galleryData';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Jednoduchý lightbox na jednotlivé fotky
const PhotoLightbox = ({ photos, index, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  const photo = photos[index];
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={onClose} data-testid="photo-lightbox">
      <img
        src={photo.url}
        alt={photo.label}
        className="max-w-full max-h-[85vh] object-contain rounded-lg"
        onClick={e => e.stopPropagation()}
      />
      <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full text-white ${photo.type === 'before' ? 'bg-red-500' : 'bg-[#3FA34D]'}`}>
        {photo.label}
      </span>
      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
        {index + 1} / {photos.length}
      </span>
      <button onClick={onClose} className="absolute top-4 right-4 bg-white/10 text-white p-2.5 rounded-full hover:bg-white/25">
        <X className="w-5 h-5" />
      </button>
      {photos.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); onPrev(); }} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 text-white p-2.5 rounded-full hover:bg-white/25">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={e => { e.stopPropagation(); onNext(); }} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 text-white p-2.5 rounded-full hover:bg-white/25">
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};

export default function GalleryDetailPage() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      setProject(null);
      try {
        // 1) Detail endpoint (slug nebo id)
        const r = await axios.get(`${API}/gallery/projects/${slug}`);
        if (!r.data || typeof r.data !== 'object' || Array.isArray(r.data) || !r.data.title) throw new Error('invalid response');
        if (!cancelled) setProject(normalizeProject(r.data));
      } catch {
        try {
          // 2) Fallback: najdi projekt v seznamu (funguje i se starším backendem)
          const r = await axios.get(`${API}/gallery/projects`);
          if (!Array.isArray(r.data)) throw new Error('invalid response');
          const found = r.data.find(p => p.slug === slug || p.id === slug);
          if (!found) throw new Error('not found');
          if (!cancelled) setProject(normalizeProject(found));
        } catch {
          // 3) Fallback: ukázkové projekty
          const sample = SAMPLE_PROJECTS.find(p => p.slug === slug || p.id === slug);
          if (!cancelled) {
            if (sample) setProject(normalizeProject(sample));
            else setNotFound(true);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#3FA34D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Projekt nenalezen</h1>
        <p className="text-gray-500 mb-6">Tato realizace neexistuje nebo byla odstraněna.</p>
        <Link to="/nase-prace">
          <Button className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Zpět na naše práce
          </Button>
        </Link>
      </div>
    );
  }

  const beforeImages = project.before_images;
  const afterImages = project.after_images;

  // Dvojice PŘED/PO pro slidery; fotky navíc se zobrazí samostatně
  const pairCount = Math.min(beforeImages.length, afterImages.length);
  const extraPhotos = [
    ...beforeImages.slice(pairCount).map(url => ({ url, type: 'before' })),
    ...afterImages.slice(pairCount).map(url => ({ url, type: 'after' })),
  ];

  // Všechny fotky pro lightbox (PŘED pak PO)
  const allPhotos = [
    ...beforeImages.map(url => ({ url, type: 'before', label: 'PŘED' })),
    ...afterImages.map(url => ({ url, type: 'after', label: 'PO' })),
  ];

  const openLightbox = (url) => {
    const idx = allPhotos.findIndex(p => p.url === url);
    if (idx >= 0) setLightboxIndex(idx);
  };

  // Pro og:image a schema jen veřejné http URL (nahrané fotky jsou base64)
  const ogImage = [...afterImages, ...beforeImages].find(u => typeof u === 'string' && u.startsWith('http'));

  return (
    <div className="min-h-screen" data-testid="gallery-detail-page">
      <SEOHead
        title={`${project.title} | Naše práce | SeknuTo.cz`}
        description={project.description || `Realizace ${project.title} – fotky před a po. ${project.location}.`}
        canonical={`https://seknuto.cz/nase-prace/${project.slug}`}
        image={ogImage}
        schema={[
          SCHEMAS.breadcrumb([
            { name: 'Úvod', url: '/' },
            { name: 'Naše práce', url: '/nase-prace' },
            { name: project.title, url: `/nase-prace/${project.slug}` },
          ]),
          SCHEMAS.galleryProject({
            title: project.title,
            description: project.description,
            slug: project.slug,
            images: [...afterImages, ...beforeImages],
            videos: project.videos,
            uploadDate: project.created_at?.slice(0, 10),
          }),
        ]}
      />

      {/* Hero */}
      <section className="pt-28 pb-8 bg-gradient-to-br from-[#F0FDF4] via-white to-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <Link to="/nase-prace" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3FA34D] hover:text-[#2d7a38] mb-5">
            <ArrowLeft className="w-4 h-4" /> Zpět na naše práce
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${project.tagColor}`}>{project.tag}</span>
            {project.location && (
              <span className="flex items-center gap-1 text-sm text-gray-500"><MapPin className="w-4 h-4" /> {project.location}</span>
            )}
            {project.date && (
              <span className="flex items-center gap-1 text-sm text-gray-500"><Calendar className="w-4 h-4" /> {project.date}</span>
            )}
            {project.area && (
              <span className="flex items-center gap-1 text-sm text-gray-500"><Ruler className="w-4 h-4" /> {project.area}</span>
            )}
            {project.duration && (
              <span className="flex items-center gap-1 text-sm text-gray-500"><Clock className="w-4 h-4" /> {project.duration}</span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1B4332] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {project.title}
          </h1>
          {project.description && (
            <p className="text-[#4B5563] text-lg max-w-3xl">{project.description}</p>
          )}
          {project.services.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {project.services.map((s, i) => (
                <span key={i} className="flex items-center gap-1.5 text-sm bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-700 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#3FA34D]" /> {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Hlavní porovnání */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-10">
          <Reveal variant="reveal-scale">
            <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100">
              <BeforeAfterSlider
                before={beforeImages[0]}
                after={afterImages[0]}
                alt={project.title}
                className="aspect-[16/10]"
              />
            </div>
            <p className="text-center text-sm text-gray-400 mt-3">
              Přejeďte čárou po fotce a porovnejte stav před a po
            </p>
          </Reveal>

          {/* Videa a prohlídky */}
          {project.videos.length > 0 && (
            <Reveal>
              <h2 className="text-xl font-bold text-[#1B4332] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Video z realizace
              </h2>
              <div className={`grid grid-cols-1 gap-6 ${project.videos.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                {project.videos.map((url, i) => {
                  const video = parseVideo(url);
                  return (
                    <div key={i} className="rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-black aspect-video">
                      {video.type === 'file' ? (
                        <video src={video.src} controls preload="metadata" className="w-full h-full" />
                      ) : (
                        <iframe
                          src={video.src}
                          title={`Video ${i + 1} – ${project.title}`}
                          className="w-full h-full"
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </Reveal>
          )}

          {/* Další dvojice před/po */}
          {pairCount > 1 && (
            <Reveal>
              <h2 className="text-xl font-bold text-[#1B4332] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Další porovnání
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Array.from({ length: pairCount - 1 }, (_, i) => i + 1).map(i => (
                  <div key={i} className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    <BeforeAfterSlider
                      before={beforeImages[i]}
                      after={afterImages[i]}
                      alt={`${project.title} – porovnání ${i + 1}`}
                      className="aspect-[4/3]"
                    />
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {/* Fotky navíc (bez dvojice) */}
          {extraPhotos.length > 0 && (
            <Reveal>
              <h2 className="text-xl font-bold text-[#1B4332] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Další fotky
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {extraPhotos.map((photo, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => openLightbox(photo.url)}
                    className="relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-100 shadow-sm group"
                  >
                    <img src={photo.url} alt={photo.type === 'before' ? 'Před' : 'Po'} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className={`absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${photo.type === 'before' ? 'bg-red-500' : 'bg-[#3FA34D]'}`}>
                      {photo.type === 'before' ? 'PŘED' : 'PO'}
                    </span>
                  </button>
                ))}
              </div>
            </Reveal>
          )}

          {/* Všechny fotky */}
          {allPhotos.length > 2 && (
            <Reveal>
              <h2 className="text-xl font-bold text-[#1B4332] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Všechny fotky ({allPhotos.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {allPhotos.map((photo, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 group"
                  >
                    <img src={photo.url} alt={photo.label} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className={`absolute bottom-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${photo.type === 'before' ? 'bg-red-500/90' : 'bg-[#3FA34D]/90'}`}>
                      {photo.label}
                    </span>
                  </button>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#1B4332]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Chcete takový výsledek i vy?
          </h2>
          <p className="text-[#A7C4B2] mb-6">Pošlete nezávaznou poptávku – přijedeme na bezplatnou obhlídku a navrhneme řešení.</p>
          <Link to="/rezervace">
            <Button className="bg-[#3FA34D] hover:bg-[#2d7a38] text-white rounded-full px-8 h-12 font-semibold">
              Nezávazná poptávka
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={allPhotos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(i => (i - 1 + allPhotos.length) % allPhotos.length)}
          onNext={() => setLightboxIndex(i => (i + 1) % allPhotos.length)}
        />
      )}
    </div>
  );
}
