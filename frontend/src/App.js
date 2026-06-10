import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

// Pages
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import PricingPage from "./pages/PricingPage";
import BookingPage from "./pages/BookingPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import VoucherPage from "./pages/VoucherPage";
import AdminPage from "./pages/AdminPage";
import GalleryPage from "./pages/GalleryPage";
import GalleryDetailPage from "./pages/GalleryDetailPage";
import { BlogListPage, BlogDetailPage } from "./pages/BlogPage";
import LocalLandingPage from "./pages/LocalLandingPage";

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

function App() {
  return (
    <HelmetProvider>
    <div className="App">
      <BrowserRouter>
        <GoogleAnalytics />
        <Analytics />
        <SpeedInsights />
        <Routes>
          {/* Admin - no header/footer */}
          <Route path="/admin" element={<AdminPage />} />

          {/* Public site */}
          <Route path="/*" element={
            <>
              <Header />
              <main>
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
              </main>
              <Footer />
              <WhatsAppButton />
              <EmailPopup />
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
