# SeknuTo.cz - PRD (Product Requirements Document)

## Original Problem Statement
Vytvoření moderního, minimalistického webu pro "SeknuTo.cz" - lokální služba sekání trávy v ČR.
Konverzní web s rezervačním systémem, emailovými notifikacemi, QR poukazovým systémem a online platbou zálohy.

## Target Audience
- Majitelé rodinných domů a zahrádek v ČR
- Hledají spolehlivou a rychlou službu sekání trávy

## Core Pages
- Homepage (hero, služby, recenze, FAQ, CTA)
- /sluzby, /cenik, /o-nas, /kontakt
- /rezervace (multi-step booking + Stripe záloha 50 Kč)
- /poukaz/:code (QR poukaz landing page)
- /nase-prace (galerie before/after)
- /blog (seznam + detail)
- /admin (admin dashboard)

## Architecture
- Frontend: React, React Router, Tailwind CSS, shadcn/ui
- Backend: FastAPI, Pydantic, MongoDB (Motor)
- Integrations: Resend (email), Google Calendar API, Stripe (platby)

## Key DB Schema
- bookings: {id, service, property_size, condition, customer_name, customer_phone, customer_email, property_address, notes, preferred_date, preferred_time, estimated_price, coupon_code, deposit_paid, deposit_session_id, status}
- subscribers: {email, coupon_code, created_at}
- coupons: {id, code, discount_percent, description, uses_count, active, created_at}
- vouchers: {id, code, display_name, discount_type, discount_value, max_uses, uses_count, valid_from, valid_until, status, campaign_name, flyer_batch}
- voucher_redemptions: {id, voucher_id, voucher_code, booking_id, discount_applied, redeemed_at}
- payment_transactions: {id, session_id, amount, currency, payment_status, status, metadata, created_at}
- blog_posts: {id, title, slug, excerpt, content, category, cover_image, author, read_time, published, published_at}
- admin_sessions: {token, created_at}

## Brand Colors & Fonts
- Colors: #1B4332 (dark green), #3FA34D (main green), #52B788 (light green), #FF8C42 (orange CTA)
- Fonts: Poppins (headings), Inter (body)

---

## What's Been Implemented

### Phase 1: Core Website
- Homepage, Services, Pricing, About, Contact pages
- Header/Footer navigation (now includes Naše práce + Blog)
- WhatsApp floating button, Google Analytics

### Phase 2: Booking System
- Multi-step form (5 steps) with dynamic price calculation
- m² vs hourly services differentiation
- Calendar date picker (Czech locale), time slots
- Coupon/discount code validation
- GDPR consent, form validation
- Admin email notifications (Resend)

### Phase 3: Integrations
- Resend email (newsletters, notifications)
- Newsletter popup with coupon delivery
- Google Calendar API (coded, pending OAuth)

### Phase 4: Voucher System (December 2025)
- /poukaz/:code route - confetti animation, countdown, CTA
- Backend CRUD: create, get, claim, redeem vouchers
- Auto-apply voucher on BookingPage redirect

### Phase 5: Stripe Deposit (December 2025)
- POST /api/payments/deposit/create - 50 CZK Stripe checkout
- GET /api/payments/deposit/status/:session_id
- Form draft saved/restored via localStorage
- "Zaplatit zálohu 50 Kč" button + deposit info box

### Phase 6: Admin Dashboard + Content (December 2025)
- /admin login (password: SeknuTo2025!)
- Overview stats (bookings, vouchers, coupons, revenue)
- Voucher management (create with all fields, list, deactivate, copy URL)
- Coupon management (create, list, deactivate)
- Booking management (list, expandable details, status change)
- Blog management (create, edit, delete posts with HTML content)
- Homepage reviews section (6 sample reviews with star ratings)
- Gallery /nase-prace (before/after hover cards, filter, lightbox)
- Blog /blog (list + detail pages with HTML rendering)

---

## Prioritized Backlog

### Phase 8: Security & Performance Audit Fixes (Prosinec 2025) ✅ DONE
- [SEC-001/002] verify_admin přidán na POST/GET/DELETE /vouchers + DELETE /auth/google/disconnect
- [SEC-003] .env je v .gitignore; uživatel musí rotovat klíče na produkci
- [FUNC-001] Atomický redeem_voucher (find_one_and_update) - race condition opravena
- [FUNC-003] Coupon se označí jako použitý (used=True, active=False) při vytvoření rezervace
- [FUNC-004] custom_order přidán do SERVICE_NAMES_CZ pro správné emailové notifikace
- [SEC-006] Expirace admin session tokenů po 24h
- [SEC-007] Rate limiting přes slowapi: 5/min admin login, 30/min vouchers, 20/min coupons
- [PERF-001] MongoDB indexy vytvořeny při startu (TTL na admin_sessions)
- [PERF-001b] Batch update expirovaných voucherů (1 dotaz místo N+1)
- [PERF-002] Paginace admin bookings endpoint ({bookings, total, skip, limit})
- [PERF-003] calculatePrice přeskakuje custom_order (zbytečný HTTP request)
- [SEC-004] CORS čte z CORS_ORIGINS env variable
- [SEC-005] Google OAuth callback nezveřejňuje interní stacktrace
- Pydantic field_validator pro service, condition, preferred_time
- Nová kategorie v rezervačním formuláři: "Služby na objednávku" (custom_order)
- Krok 1: Nová sekce s labellem ZAKÁZKA
- Krok 2: Speciální formulář – typ zákazníka (soukromá osoba/firma), 9 typů prací (checkboxy), popis požadavků
- Krok 3: Výběr termínu (stejný jako standard)
- Krok 4: Kontakt bez ceny – zobrazí "Cena dle dohody", skryta coupon sekce, tlačítko "Odeslat poptávku"
- Krok 5: Potvrzení "poptávka odeslána" s cenou "Dle dohody"
- Backend: custom_order service type, notes obsahují [ZAKÁZKOVÁ PRÁCE] marker se strukturovanými daty

### P0 (Critical - User Action Required)
- Resend domain verification: verify at resend.com to send customer emails
- Google Calendar OAuth: authorize via /api/google/auth/url

### P1 (High Priority)
- User testing of booking form
- Prepare for production deployment (Vercel + Render or similar)
- Real photos upload for gallery (replace stock photos)

### P2 (Medium Priority)
- Admin: photo upload for gallery projects
- Admin: manage gallery projects (CRUD)
- Contact form admin management

### P3 (Future/Backlog)
- Customer portal with booking history
- Online payment for full service (not just deposit)
- Repeat booking / subscription feature
- SMS notifications via Twilio

---

## Key API Endpoints
- POST /api/bookings
- POST /api/pricing/calculate
- GET /api/google/auth/url
- POST /api/vouchers | GET /api/vouchers/:code | POST /api/vouchers/:code/claim | POST /api/vouchers/:code/redeem
- POST /api/payments/deposit/create | GET /api/payments/deposit/status/:session_id
- POST /api/admin/login
- GET /api/admin/stats | GET /api/admin/bookings | PATCH /api/admin/bookings/:id/status
- GET /api/admin/coupons | POST /api/admin/coupons | DELETE /api/admin/coupons/:code
- GET /api/admin/vouchers
- GET /api/blog/posts | GET /api/blog/posts/:slug
- POST /api/admin/blog/posts | GET /api/admin/blog/posts | PATCH /api/admin/blog/posts/:id | DELETE /api/admin/blog/posts/:id

## Deploy Configuration
- **Frontend:** Vercel (`frontend/vercel.json` prepared)
- **Backend:** Render (`backend/render.yaml` + `Dockerfile` prepared)
- **Database:** MongoDB Atlas (production)
- **Deploy Guide:** `/app/DEPLOY.md` - step-by-step instructions

## Admin Credentials
- URL: /admin
- Password: SeknuTo2025! (CHANGE before production!)

## Health Check
- GET /api/health → {"status": "ok"}

## Known Blockers
- Resend: customer emails need domain verification
- Google Calendar: needs OAuth consent from owner
