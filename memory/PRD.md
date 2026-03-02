# SeknuTo.cz - PRD (Product Requirements Document)

## Original Problem Statement
Vytvoření moderního, minimalistického webu pro "SeknuTo.cz" - lokální služba sekání trávy v ČR.
Konverzní web s rezervačním systémem, emailovými notifikacemi, QR poukazovým systémem a online platbou zálohy.

## Target Audience
- Majitelé rodinných domů a zahrádek v ČR
- Hledají spolehlivou a rychlou službu sekání trávy

## Core Pages
- Homepage, Služby, Ceník, Rezervace, O nás, Kontakt
- /poukaz/:code (QR poukaz landing page)

## Architecture
- Frontend: React, React Router, Tailwind CSS, shadcn/ui
- Backend: FastAPI, Pydantic, MongoDB (Motor)
- Integrations: Resend (email), Google Calendar API, Stripe (platby)

## Key DB Schema
- bookings: {id, service, property_size, condition, customer_name, customer_phone, customer_email, property_address, notes, preferred_date, preferred_time, estimated_price, coupon_code, deposit_paid, deposit_session_id}
- subscribers: {email, coupon_code, created_at}
- coupons: {code, discount_percent, created_at}
- vouchers: {id, code, display_name, discount_type, discount_value, max_uses, uses_count, valid_from, valid_until, status, campaign_name, flyer_batch, target_audience}
- voucher_redemptions: {id, voucher_id, voucher_code, booking_id, discount_applied, redeemed_at}
- payment_transactions: {id, session_id, amount, currency, payment_status, status, metadata, created_at}

## Brand Identity
- Colors: #1B4332 (dark green), #3FA34D (main green), #52B788 (light green), #FF8C42 (orange CTA)
- Fonts: Poppins (headings), system

---

## What's Been Implemented

### Phase 1: Core Website (completed earlier)
- Homepage with hero, features, CTA
- Services page (redesigned card layout)
- Pricing page (conversion-focused with tiers)
- About & Contact pages
- Header & Footer navigation
- WhatsApp floating button
- Google Analytics integration

### Phase 2: Booking System (completed)
- Multi-step booking form (5 steps)
- Dynamic price calculation (m² vs hourly services)
- Calendar date picker with Czech locale
- Service selection (basic + packages)
- Additional services (mulching, debris removal)
- Coupon/discount code validation
- Form validation + GDPR consent
- Admin email notifications (Resend)
- Customer email confirmation (blocked - domain not verified)

### Phase 3: Integrations (completed)
- Resend email integration (newsletters, notifications)
- Newsletter popup with coupon delivery
- Google Calendar API (coded, pending OAuth authorization)

### Phase 4: Voucher System (completed - December 2025)
- /poukaz/:code route added to App.js
- VoucherPage.jsx with confetti animation, countdown timer
- Backend: CRUD endpoints for vouchers
- POST /api/vouchers - create voucher
- GET /api/vouchers/:code - get voucher for landing page
- POST /api/vouchers/:code/claim - claim voucher session
- POST /api/vouchers/:code/redeem - finalize redemption
- Auto-apply voucher discount on BookingPage when redirected

### Phase 5: Stripe Deposit (completed - December 2025)
- POST /api/payments/deposit/create - create 50 CZK Stripe checkout
- GET /api/payments/deposit/status/:session_id - check payment status
- POST /api/webhook/stripe - Stripe webhook handler
- payment_transactions collection in MongoDB
- BookingPage: "Zaplatit zálohu 50 Kč" button
- Form draft saved to localStorage before Stripe redirect
- Form restore after returning from Stripe
- Deposit info badge in step 4
- EmailPopup hidden on /poukaz/* pages

---

## Prioritized Backlog

### P0 (Critical - User Action Required)
- Resend domain verification: User must verify domain at resend.com to send customer emails
- Google Calendar OAuth: User must authorize via /api/google/auth/url endpoint

### P1 (High Priority)
- User testing of booking form fixes (hourly pricing, date picker)
- Prepare for production deployment (Vercel + Render)

### P2 (Medium Priority)
- Customer testimonials section on homepage
- Admin dashboard for managing bookings and vouchers
- Photo gallery of completed work

### P3 (Future/Backlog)
- Customer portal with booking history
- Blog for gardening tips
- Online payment for full service price (not just deposit)
- Repeat booking / subscription feature
- SMS notifications via Twilio

---

## Key API Endpoints
- POST /api/bookings
- POST /api/pricing/calculate
- GET /api/google/auth/url
- GET /api/google/auth/callback
- POST /api/vouchers
- GET /api/vouchers/:code
- POST /api/vouchers/:code/claim
- POST /api/vouchers/:code/redeem
- POST /api/payments/deposit/create
- GET /api/payments/deposit/status/:session_id
- POST /api/webhook/stripe

## Known Blockers
- Resend: customer emails need domain verification
- Google Calendar: needs OAuth consent from owner
