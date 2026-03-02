import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";

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

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <GoogleAnalytics />
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
          </Routes>
        </main>
        <Footer />
        <WhatsAppButton />
        <EmailPopup />
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
