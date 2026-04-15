# SeknuTo.cz – Product Requirements Document

## Původní zadání
Web pro zahradnickou firmu SeknuTo.cz (Dvůr Králové nad Labem). **Akviziční nástroj pro sběr poptávek** – bez cen. Zákazník na webu nevidí žádné ceny – vše po bezplatné obhlídce.

## Architektura
- **Frontend**: React + Shadcn/UI (Vercel)
- **Backend**: FastAPI + MongoDB (Render)
- **Emaily**: Resend (vyžaduje ověření domény)
- **Obrázky galerie**: Base64 v MongoDB

## Dokončené úkoly (14.4.2026)
- [x] Kompletní odstranění VŠECH cen z webu
- [x] PricingPage → "Jak to funguje" (FAQ, Co ovlivňuje cenu, Sezónní balíčky)
- [x] Galerie fix – Base64 URL bez prefixu BACKEND_URL
- [x] Admin custom email zákazníkům (POST /api/admin/bookings/{id}/email + modal)
- [x] BookingPage – m² pole pro všechny služby (orientační, volitelné)
- [x] SEO Master Update:
  - index.html: geotags, JSON-LD, noscript, Montserrat font, odstraněno "Praha"
  - SEOHead.jsx: array schema, LawnCareService, reviewCount number, blogPost/reviews/localLanding schemas
  - sitemap.xml: oprava /galerie→/nase-prace, 5 lokálních stránek
  - robots.txt: Googlebot sekce
  - BlogPage + GalleryPage: SEOHead
  - 5 LocalLandingPages: Trutnov, Vrchlabí, Jaroměř, Náchod, Hostinné
  - Footer: "Oblast působení" sloupec + lokální linky
  - HomePage: isoDate recenze + Reviews schema
  - ServicesPage: breadcrumb + service schema
- [x] Firmy.cz banner

## Čeká na uživatele
- [ ] Resend domain verification
- [ ] RESEND_AUDIENCE_ID v Render
- [ ] Google Calendar authorization
- [ ] Aktualizovat galerie projekty v DB (odstranit "Praha" z lokací)

## Backlog
- [ ] Klientský portál s historií rezervací
- [ ] Refaktoring server.py do modulární struktury

## Přihlašovací údaje
- Admin heslo: SeknuTo2025!
