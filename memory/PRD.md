# SeknuTo.cz – Product Requirements Document

## Původní zadání
Webová aplikace pro zahradnickou firmu SeknuTo.cz (Dvůr Králové nad Labem). Slouží jako **akviziční nástroj pro sběr poptávek** – NE e-shop. Zákazník na webu **nevidí žádné ceny** – vše je po bezplatné obhlídce.

## Architektura
- **Frontend**: React + Shadcn/UI (Vercel)
- **Backend**: FastAPI + MongoDB (Render)
- **Emaily**: Resend (vyžaduje ověření domény)
- **Obrázky galerie**: Base64 v MongoDB

## Cenová strategie (aktuální)
- **ŽÁDNÉ ceny na webu** – ani orientační, ani "od"
- Vše je "Cena po obhlídce" / "Po domluvě" / "Individuální kalkulace"
- Stránka "Ceník" přeměněna na "Jak to funguje" (4 kroky: Poptávka → Obhlídka → Cena → Práce)
- Zákazník neuvidí žádnou částku v Kč

## SEO zaměření
- Lokální SEO: Dvůr Králové, Trutnov, Vrchlabí, Hostinné, Jaroměř, Náchod
- Klíčová slova: sekání trávy, likvidace pozemků, čištění zarostlých parcel, údržba zahrad, vertikutace, hnojení, zahradník
- Bezplatná obhlídka jako hlavní CTA

## Služby na webu
1. Sekání trávy (s/bez hnojení, přerostlá tráva)
2. Likvidace a čištění pozemků (křoviny, nálety, vysoká tráva)
3. Sezónní balíčky (jaro, léto, podzim, zima)
4. Zahradnické práce (pletí, výsadba, úprava terénu)
5. Odvoz odpadu
6. VIP Celoroční servis

## Dokončené úkoly
- [x] Vercel Analytics a SpeedInsights
- [x] CSS active state, kalendář vizuál
- [x] Base64 galerie v MongoDB
- [x] Admin kontaktní zprávy
- [x] Newsletter popup + BackgroundTasks pro Resend
- [x] Transakční emaily (confirmed, completed, cancelled)
- [x] Revert designu 4 klíčových stránek
- [x] Kompletní odstranění VŠECH cen z webu (14.4.2026)
- [x] Přeměna "Ceník" → "Jak to funguje" (14.4.2026)
- [x] SEO aktualizace na všech stránkách (14.4.2026)
- [x] Přidání služby "Likvidace a čištění pozemků"
- [x] Newsletter endpoint refactoring na BackgroundTasks

## Čeká na uživatele
- [ ] Resend domain verification
- [ ] RESEND_AUDIENCE_ID v Render env variables
- [ ] Google Calendar authorization

## Backlog
- [ ] Klientský portál s historií rezervací
- [ ] Refaktoring server.py

## Přihlašovací údaje
- Admin heslo: `SeknuTo2025!`
