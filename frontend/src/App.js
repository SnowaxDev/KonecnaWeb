import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";

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
import { BlogListPage, BlogDetailPage } from "./pages/BlogPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <GoogleAnalytics />
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
                  <Route path="/blog" element={<BlogListPage />} />
                  <Route path="/blog/:slug" element={<BlogDetailPage />} />
                </Routes>
              </main>
              <Footer />
              <WhatsAppButton />
              <EmailPopup />
            </>
          } />
        </Routes>
        <Toaster position="top-center" richColors />
        <Analytics />
      </BrowserRouter>
    </div>
  );
}

export default App;
