import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, ArrowRight, ArrowLeft, User, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ─── BLOG LIST PAGE ───────────────────────────────────────────────────────────
export function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/blog/posts`)
      .then(r => setPosts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" data-testid="blog-list-page">
      {/* Hero */}
      <section className="pt-28 pb-12 bg-gradient-to-br from-[#F0FDF4] via-white to-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#3FA34D] uppercase mb-4 bg-[#3FA34D]/10 px-4 py-1.5 rounded-full">
            Zahradní blog
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1B4332] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Tipy pro vaši zahradu
          </h1>
          <p className="text-[#4B5563] text-lg max-w-2xl mx-auto">
            Rady od profesionálů – jak pečovat o trávník, zahradu a zeleň po celý rok.
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#3FA34D] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg mb-2">Zatím žádné články</p>
              <p className="text-sm">Brzy přidáme první tipy pro vaši zahradu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group"
                  data-testid={`blog-post-${post.id}`}
                >
                  {post.cover_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  {!post.cover_image && (
                    <div className="aspect-video bg-gradient-to-br from-[#1B4332] to-[#3FA34D] flex items-center justify-center">
                      <span className="text-white/20 text-6xl font-bold">SeknuTo</span>
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(post.published_at).toLocaleDateString('cs-CZ')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.read_time || 3} min čtení
                      </span>
                    </div>
                    {post.category && (
                      <span className="text-xs font-semibold text-[#3FA34D] bg-[#3FA34D]/10 px-2 py-0.5 rounded-full mb-2 inline-block">
                        {post.category}
                      </span>
                    )}
                    <h2 className="font-bold text-gray-900 mb-2 group-hover:text-[#3FA34D] transition-colors leading-snug" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {post.title}
                    </h2>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{post.excerpt}</p>
                    <span className="text-sm font-semibold text-[#3FA34D] flex items-center gap-1">
                      Číst dál <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── BLOG DETAIL PAGE ─────────────────────────────────────────────────────────
export function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    axios.get(`${API}/blog/posts/${slug}`)
      .then(r => setPost(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#3FA34D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4 pt-16">
      <h1 className="text-2xl font-bold text-gray-900">Článek nenalezen</h1>
      <Link to="/blog"><Button className="bg-[#3FA34D] hover:bg-[#2d7a38] rounded-full">Zpět na blog</Button></Link>
    </div>
  );

  return (
    <div className="min-h-screen" data-testid="blog-detail-page">
      {/* Cover */}
      {post.cover_image ? (
        <div className="relative h-64 md:h-80 overflow-hidden mt-16">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332]/80 to-transparent" />
          <div className="absolute bottom-8 left-0 right-0 max-w-3xl mx-auto px-4">
            <span className="text-xs font-semibold text-[#52B788] uppercase tracking-wide">{post.category}</span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-1 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {post.title}
            </h1>
          </div>
        </div>
      ) : (
        <div className="pt-28 pb-8 bg-gradient-to-br from-[#1B4332] to-[#2D6A4F]">
          <div className="max-w-3xl mx-auto px-4">
            <span className="text-xs font-semibold text-[#52B788] uppercase tracking-wide">{post.category}</span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {post.title}
            </h1>
          </div>
        </div>
      )}

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" /> {post.author || 'SeknuTo.cz'}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> {new Date(post.published_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> {post.read_time || 3} min čtení
          </span>
        </div>

        {/* Render content as HTML */}
        <div
          className="prose prose-green max-w-none text-gray-700 leading-relaxed
            [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:text-[#1B4332] [&_h2]:mt-8 [&_h2]:mb-4
            [&_h3]:font-semibold [&_h3]:text-xl [&_h3]:text-[#2D6A4F] [&_h3]:mt-6 [&_h3]:mb-3
            [&_p]:mb-4 [&_ul]:my-4 [&_ul]:pl-6 [&_li]:mb-2 [&_li]:list-disc
            [&_strong]:text-[#1B4332] [&_a]:text-[#3FA34D] [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: post.content }}
          data-testid="blog-content"
        />

        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <Link to="/blog" className="flex items-center gap-2 text-[#3FA34D] font-semibold hover:text-[#2d7a38]">
            <ArrowLeft className="w-4 h-4" /> Zpět na blog
          </Link>
          <Link to="/rezervace">
            <Button className="bg-[#3FA34D] hover:bg-[#2d7a38] rounded-full px-6">
              Objednat sekání <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </article>
    </div>
  );
}
