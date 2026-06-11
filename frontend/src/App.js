import "@/App.css";
import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import axios from "axios";

// Layout Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import EmailPopup from "./components/EmailPopup";
import GoogleAnalytics from "./components/GoogleAnalytics";

// Homepage se načítá hned (první dojem); ostatní stránky lazy –
// návštěvník nestahuje admin, rezervaci ani blog, dokud na ně nejde
import HomePage from "./pages/HomePage";
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const VoucherPage = lazy(() => import("./pages/VoucherPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const GalleryDetailPage = lazy(() => import("./pages/GalleryDetailPage"));
const BlogListPage = lazy(() => import("./pages/BlogPage").then(m => ({ default: m.BlogListPage })));
const BlogDetailPage = lazy(() => import("./pages/BlogPage").then(m => ({ default: m.BlogDetailPage })));
const LocalLandingPage = lazy(() => import("./pages/LocalLandingPage"));

// Set axios base timeout
axios.defaults.timeout = 15000;

// Global axios response interceptor – network/CORS errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error or CORS – log pro debugging
      console.error('[API] Network/CORS error:', error.message, 'URL:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

// Po změně routy odscrollovat nahoru
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Plynulý nástup obsahu při přechodu mezi stránkami
const PageFade = ({ children }) => {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
};

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-[#3FA34D] border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <HelmetProvider>
    <div className="App">
      <BrowserRouter>
        <GoogleAnalytics />
        <Analytics />
        <SpeedInsights />
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Admin - no header/footer */}
          <Route path="/admin" element={<AdminPage />} />

          {/* Public site */}
          <Route path="/*" element={
            <>
              <Header />
              <main>
                <PageFade>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/sluzby" element={<ServicesPage />} />
                  <Route path="/cenik" element={<PricingPage />} />
                  <Route path="/rezervace" element={<BookingPage />} />
                  <Route path="/o-nas" element={<AboutPage />} />
                  <Route path="/kontakt" element={<ContactPage />} />
                  <Route path="/poukaz/:code" element={<VoucherPage />} />
                  <Route path="/nase-prace" element={<GalleryPage />} />
                  <Route path="/nase-prace/:slug" element={<GalleryDetailPage />} />
                  <Route path="/blog" element={<BlogListPage />} />
                  <Route path="/blog/:slug" element={<BlogDetailPage />} />
                  <Route path="/sekani-travy-trutnov" element={<LocalLandingPage citySlug="trutnov" />} />
                  <Route path="/sekani-travy-vrchlabi" element={<LocalLandingPage citySlug="vrchlabi" />} />
                  <Route path="/sekani-travy-jaromer" element={<LocalLandingPage citySlug="jaromer" />} />
                  <Route path="/sekani-travy-nachod" element={<LocalLandingPage citySlug="nachod" />} />
                  <Route path="/sekani-travy-hostinne" element={<LocalLandingPage citySlug="hostinne" />} />
                </Routes>
                </PageFade>
              </main>
              <Footer />
              <WhatsAppButton />
              <EmailPopup />
            </>
          } />
        </Routes>
        </Suspense>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </div>
    </HelmetProvider>
  );
}

export default App;
