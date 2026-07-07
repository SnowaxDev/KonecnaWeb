// Sdílená data galerie – fallback ukázkové projekty a normalizace projektů z API

export const SAMPLE_PROJECTS = [
  {
    id: 'sample-1', slug: 'prerostla-louka-luxusni-travnik',
    title: 'Přerostlá louka → luxusní trávník', category: 'Hrubé sekání',
    location: 'Dvůr Králové n. L.', date: 'Září 2024',
    description: 'Zahrada nebyla sekána celé léto. Po hrubém sekání vznikl čistý základ pro pravidelnou údržbu.',
    before_image: 'https://images.unsplash.com/photo-1723291056776-aec9c390b1d8?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
    after_image: 'https://images.unsplash.com/photo-1594498653385-d5172c532c00?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
    tag: 'Hrubé sekání', tagColor: 'bg-orange-100 text-orange-800',
  },
  {
    id: 'sample-2', slug: 'jarni-restart-zahrady',
    title: 'Jarní restart zahrady', category: 'Jarní balíček',
    location: 'Trutnov', date: 'Duben 2024',
    description: 'Jarní balíček zahrnoval vertikutaci, hnojení a první sekání sezóny.',
    before_image: 'https://images.unsplash.com/photo-1738669375238-749c847502cb?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
    after_image: 'https://images.unsplash.com/photo-1661133732576-6140941d5421?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
    tag: 'Jarní balíček', tagColor: 'bg-pink-100 text-pink-800',
  },
  {
    id: 'sample-3', slug: 'pravidelna-letni-udrzba',
    title: 'Pravidelná letní údržba', category: 'Letní balíček',
    location: 'Jaroměř', date: 'Červenec 2024',
    description: 'Letní balíček s pravidelným sekáním každé 2 týdny.',
    before_image: 'https://images.unsplash.com/photo-1768055418561-93437e061b32?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
    after_image: 'https://images.unsplash.com/photo-1759750909584-b96825e93de8?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
    tag: 'Letní balíček', tagColor: 'bg-yellow-100 text-yellow-800',
  },
  {
    id: 'sample-4', slug: 'podzimni-priprava-na-zimu',
    title: 'Podzimní příprava na zimu', category: 'Podzimní balíček',
    location: 'Náchod', date: 'Říjen 2024',
    description: 'Podzimní balíček: úklid listí, poslední sekání, přihnojení na zimu.',
    before_image: 'https://images.unsplash.com/photo-1726484204083-7c9c1daf31b7?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
    after_image: 'https://images.unsplash.com/photo-1743627621279-e34a2efac6ac?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
    tag: 'Podzimní balíček', tagColor: 'bg-amber-100 text-amber-800',
  },
];

export const TAG_COLORS = {
  'Hrubé sekání': 'bg-orange-100 text-orange-800',
  'Jarní balíček': 'bg-pink-100 text-pink-800',
  'Letní balíček': 'bg-yellow-100 text-yellow-800',
  'Podzimní balíček': 'bg-amber-100 text-amber-800',
  'Sekání': 'bg-green-100 text-green-800',
  'Zahradní práce': 'bg-teal-100 text-teal-800',
  'Stříhání keřů a stromů': 'bg-emerald-100 text-emerald-800',
  'Kácení stromů': 'bg-teal-100 text-teal-800',
  'Realizace zahrad': 'bg-lime-100 text-lime-800',
  'Pokládání trávníku': 'bg-green-100 text-green-800',
};

// Doplní tagColor, slug a pole fotek (starší projekty mají jen before_image/after_image)
export const normalizeProject = (p) => {
  const before_images = (p.before_images && p.before_images.length > 0) ? p.before_images : [p.before_image || p.before].filter(Boolean);
  const after_images = (p.after_images && p.after_images.length > 0) ? p.after_images : [p.after_image || p.after].filter(Boolean);
  const extra_images = p.extra_images || [];
  return {
    ...p,
    slug: p.slug || p.id,
    tagColor: p.tagColor || TAG_COLORS[p.tag] || TAG_COLORS[p.category] || 'bg-gray-100 text-gray-700',
    before_images,
    after_images,
    extra_images,
    services: p.services || [],
    area: p.area || '',
    duration: p.duration || '',
    videos: p.videos || [],
    // Seznamový endpoint posílá jen první fotky + počty; u plných dat se počty dopočítají
    photo_count: p.photo_count || (before_images.length + after_images.length + extra_images.length),
    video_count: p.video_count ?? (p.videos || []).length,
  };
};

// Převod URL videa na embed – podporuje YouTube, Vimeo a přímé video soubory
export const parseVideo = (url) => {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { type: 'embed', src: `https://www.youtube-nocookie.com/embed/${yt[1]}` };
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { type: 'embed', src: `https://player.vimeo.com/video/${vimeo[1]}` };
  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(url)) return { type: 'file', src: url };
  return { type: 'embed', src: url };
};
