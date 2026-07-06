import "@/App.css";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import axios from "axios";

// Layout Components (eager – above the fold / on every page)
import Header from "./components/Header";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import CallButton from "./components/CallButton";

// Landing page is eager so it renders immediately without a chunk round-trip
import HomePage from "./pages/HomePage";

// Secondary pages are code-split – they load only when their route is visited,
// which keeps the initial mobile bundle small (esp. the heavy AdminPage).
// The public pages are marked webpackPrefetch so the browser fetches their
// chunks during idle time – navigation stays instant/smooth, just like when
// everything was bundled, but without bloating the first load.
const ServicesPage = lazy(() => import(/* webpackPrefetch: true */ "./pages/ServicesPage"));
const PricingPage = lazy(() => import(/* webpackPrefetch: true */ "./pages/PricingPage"));
const BookingPage = lazy(() => import(/* webpackPrefetch: true */ "./pages/BookingPage"));
const AboutPage = lazy(() => import(/* webpackPrefetch: true */ "./pages/AboutPage"));
const ContactPage = lazy(() => import(/* webpackPrefetch: true */ "./pages/ContactPage"));
const GalleryPage = lazy(() => import(/* webpackPrefetch: true */ "./pages/GalleryPage"));
const LocalLandingPage = lazy(() => import(/* webpackPrefetch: true */ "./pages/LocalLandingPage"));
const BlogListPage = lazy(() => import(/* webpackPrefetch: true */ "./pages/BlogPage").then((m) => ({ default: m.BlogListPage })));
const BlogDetailPage = lazy(() => import("./pages/BlogPage").then((m) => ({ default: m.BlogDetailPage })));
// Admin & voucher stay lazy WITHOUT prefetch (rarely visited / admin-only).
const VoucherPage = lazy(() => import("./pages/VoucherPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const EmailPopup = lazy(() => import("./components/EmailPopup"));
const GoogleAnalytics = lazy(() => import("./components/GoogleAnalytics"));

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

// Lightweight fallback while a lazy route chunk loads
const RouteFallback = () => (
  <div style={{ minHeight: "60vh" }} aria-hidden="true" />
);

function App() {
  return (
    <HelmetProvider>
    <div className="App">
      <BrowserRouter>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <Analytics />
        <SpeedInsights />
        <Routes>
          {/* Admin - no header/footer */}
          <Route path="/admin" element={<Suspense fallback={<RouteFallback />}><AdminPage /></Suspense>} />

          {/* Public site */}
          <Route path="/*" element={
            <>
              <Header />
              <main>
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/sluzby" element={<ServicesPage />} />
                    <Route path="/cenik" element={<PricingPage />} />
                    <Route path="/rezervace" element={<BookingPage />} />
                    <Route path="/o-nas" element={<AboutPage />} />
                    <Route path="/kontakt" element={<ContactPage />} />
                    <Route path="/poukaz/:code" element={<VoucherPage />} />
                    <Route path="/nase-prace" element={<GalleryPage />} />
                    <Route path="/blog" element={<BlogListPage />} />
                    <Route path="/blog/:slug" element={<BlogDetailPage />} />
                    <Route path="/sekani-travy-trutnov" element={<LocalLandingPage citySlug="trutnov" />} />
                    <Route path="/sekani-travy-vrchlabi" element={<LocalLandingPage citySlug="vrchlabi" />} />
                    <Route path="/sekani-travy-jaromer" element={<LocalLandingPage citySlug="jaromer" />} />
                    <Route path="/sekani-travy-nachod" element={<LocalLandingPage citySlug="nachod" />} />
                    <Route path="/sekani-travy-hostinne" element={<LocalLandingPage citySlug="hostinne" />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              <CallButton />
              <WhatsAppButton />
              <Suspense fallback={null}>
                <EmailPopup />
              </Suspense>
            </>
          } />
        </Routes>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </div>
    </HelmetProvider>
  );
}

export default App;
