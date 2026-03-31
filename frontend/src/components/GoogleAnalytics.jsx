import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics Measurement ID - nastavte v .env jako REACT_APP_GA_ID
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) {
    return; // Tiše ignorovat pokud GA není nakonfigurováno
  }

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false // We'll send page views manually for SPA
  });
};

// Track page views
export const trackPageView = (path, title) => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title
  });
};

// Track custom events
export const trackEvent = (action, category, label, value) => {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value
  });
};

// Predefined events for SeknuTo.cz
export const gaEvents = {
  // Booking funnel
  bookingStarted: () => trackEvent('booking_started', 'booking', 'form_opened'),
  bookingStepCompleted: (step) => trackEvent('booking_step_completed', 'booking', `step_${step}`),
  bookingSubmitted: (service, price) => trackEvent('booking_submitted', 'booking', service, price),
  
  // Lead generation
  newsletterSubscribed: () => trackEvent('newsletter_signup', 'lead', 'popup'),
  couponApplied: (code) => trackEvent('coupon_applied', 'conversion', code),
  
  // Contact
  phoneClicked: () => trackEvent('phone_click', 'contact', 'header'),
  whatsappClicked: () => trackEvent('whatsapp_click', 'contact', 'float_button'),
  contactFormSubmitted: () => trackEvent('contact_form', 'lead', 'submitted'),
  
  // Navigation
  ctaClicked: (location) => trackEvent('cta_click', 'navigation', location),
  serviceViewed: (service) => trackEvent('service_view', 'engagement', service),
};

// React component for automatic page tracking
const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    // Track page view on route change
    const pageTitles = {
      '/': 'Domů - SeknuTo.cz',
      '/sluzby': 'Služby - SeknuTo.cz',
      '/cenik': 'Ceník - SeknuTo.cz',
      '/rezervace': 'Rezervace - SeknuTo.cz',
      '/o-nas': 'O nás - SeknuTo.cz',
      '/kontakt': 'Kontakt - SeknuTo.cz',
    };
    
    trackPageView(location.pathname, pageTitles[location.pathname] || 'SeknuTo.cz');
  }, [location]);

  return null; // This component doesn't render anything
};

export default GoogleAnalytics;
