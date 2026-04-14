# SeknuTo.cz – Product Requirements Document

## Původní zadání
Webová aplikace pro zahradnickou firmu SeknuTo.cz (Dvůr Králové nad Labem). Slouží jako akviziční nástroj pro sběr poptávek – NE e-shop s fixními cenami.

## Architektura
- **Frontend**: React + Shadcn/UI (Vercel)
- **Backend**: FastAPI + MongoDB (Render)
- **Emaily**: Resend (vyžaduje ověření domény pro produkční odesílání)
- **Obrázky galerie**: Base64 v MongoDB (kvůli ephemeral storage na Render)

## Cenová strategie (aktuální)
- Všechny ceny jsou **orientační** s prefixem "od"
- **Žádné hodinové sazby** (smazány, nahrazeny "Dle rozsahu" / "Projektová cena")
- Nová služba: **Likvidace a čištění pozemků** (Projektová cena)
- CTA tlačítka: poptávkové varianty ("Nezávazná poptávka", "Poptat", "Získat nezávaznou kalkulaci")

## Dokončené úkoly
- [x] Vercel Analytics a SpeedInsights
- [x] CSS active state tlačítek, kalendář vizuál
- [x] Base64 galerie obrázků v MongoDB
- [x] Admin kontaktní zprávy tab
- [x] Newsletter popup s error handling
- [x] Transakční emaily (confirmed, completed, cancelled)
- [x] Revert designu 4 klíčových stránek (HomePage, ServicesPage, PricingPage, BookingPage)
- [x] Textová cenová strategie: "od" ceny, smazání hodinových sazeb, nová služba Likvidace pozemků
- [x] SEOHead na všech hlavních stránkách (HomePage, ServicesPage, PricingPage, BookingPage)
- [x] Newsletter endpoint refactoring: BackgroundTasks pro Resend operace (nikdy neblokují odpověď)
- [x] land_clearing service v SERVICE_PRICES backendu

## Čeká na uživatele
- [ ] **Resend domain verification** – nutné pro produkční emaily zákazníkům
- [ ] **RESEND_AUDIENCE_ID** – nastavit v Render env variables pro ukládání kontaktů do audience
- [ ] **Google Calendar authorization** – pro integraci kalendáře

## Backlog
- [ ] Klientský portál s historií rezervací
- [ ] Refaktoring monolitu server.py do modulární struktury (routers, models)

## Přihlašovací údaje
- Admin heslo: `SeknuTo2025!`
