# SeknuTo.cz – Kompletní průvodce nasazením do produkce

> **Cílová architektura:**
> `Vercel (Frontend)` → `Render (Backend API)` → `MongoDB Atlas (Databáze)`
> Doménový název: `seknuto.cz`

---

## Obsah

1. [Přehled architektury](#1-přehled-architektury)
2. [Předpoklady a potřebné účty](#2-předpoklady-a-potřebné-účty)
3. [Krok 1 – MongoDB Atlas (databáze)](#krok-1--mongodb-atlas-databáze)
4. [Krok 2 – Render (backend FastAPI)](#krok-2--render-backend-fastapi)
5. [Krok 3 – Vercel (frontend React)](#krok-3--vercel-frontend-react)
6. [Krok 4 – Vlastní doména seknuto.cz](#krok-4--vlastní-doména-seknuto-cz)
7. [Krok 5 – Resend (e-maily)](#krok-5--resend-e-maily)
8. [Krok 6 – Google Calendar (autorizace)](#krok-6--google-calendar-autorizace)
9. [Krok 7 – Ověření celého systému](#krok-7--ověření-celého-systému)
10. [Referenční tabulka proměnných prostředí](#referenční-tabulka-proměnných-prostředí)
11. [Produkční checklist](#produkční-checklist)
12. [Řešení problémů (Troubleshooting)](#řešení-problémů-troubleshooting)
13. [Náklady a doporučené plány](#náklady-a-doporučené-plány)
14. [Lokální vývoj](#lokální-vývoj)

---

## 1. Přehled architektury

```
┌──────────────────────────────────────────────────────────┐
│                    INTERNET / UŽIVATEL                    │
└───────────────────────┬──────────────────────────────────┘
                        │ HTTPS
                        ▼
┌──────────────────────────────────────────────────────────┐
│              VERCEL  (seknuto.cz)                         │
│         React 18 SPA – statické soubory                  │
│  Stránky: /, /sluzby, /cenik, /rezervace, /blog,         │
│           /galerie, /o-nas, /kontakt, /admin, /poukaz/*  │
└───────────────────────┬──────────────────────────────────┘
                        │ HTTPS /api/*
                        ▼
┌──────────────────────────────────────────────────────────┐
│           RENDER  (api.seknuto.cz nebo                   │
│           seknuto-backend.onrender.com)                  │
│         FastAPI  –  Python 3.11                          │
│  Endpointy: /api/bookings, /api/admin/*, /api/vouchers,  │
│             /api/pricing/calculate, /api/health, ...     │
└──────┬──────────────────────┬────────────────────────────┘
       │                      │
       ▼                      ▼
┌─────────────┐    ┌────────────────────────────────────┐
│ MongoDB     │    │  Externí služby                    │
│ Atlas       │    │  • Resend (e-maily)                │
│ (M10+)      │    │  • Google Calendar API             │
└─────────────┘    └────────────────────────────────────┘
```

**Proč tato architektura?**
- **Vercel** – bezplatný CDN, automatický SSL, globální edge network, ideální pro React SPA
- **Render** – jednoduché nasazení Python/FastAPI, automatické buildy z GitHubu
- **MongoDB Atlas** – spravovaná MongoDB, automatické zálohy, free tier pro start

---

## 2. Předpoklady a potřebné účty

Než začnete, připravte si tyto účty (vše má free tier):

| Služba | Odkaz | Proč? |
|--------|-------|-------|
| GitHub | github.com | Hosting kódu, CI/CD trigger |
| MongoDB Atlas | mongodb.com/atlas | Produkční databáze |
| Render | render.com | Hostování Python backendu |
| Vercel | vercel.com | Hostování React frontendu |
| Resend | resend.com | Transakční e-maily |

**Potřebné klíče (máte je v `.env`):**
- `RESEND_API_KEY` – z Resend dashboardu
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` – z Google Cloud Console
- `ADMIN_PASSWORD` – vaše heslo do administrace

> **Bezpečnostní upozornění:** Před nasazením na produkci **rotujte** svůj Resend API klíč
> a Google Client Secret v příslušných dashboardech a nastavte nové hodnoty.
> Nikdy nenahrávejte soubor `.env` s reálnými klíči na GitHub.

---

## Krok 1 – MongoDB Atlas (databáze)

### 1.1 Vytvoření clusteru

1. Přejděte na [cloud.mongodb.com](https://cloud.mongodb.com) a vytvořte účet
2. Klikněte **Create** → vyberte **M0 Free** (nebo M10 pro produkci)
3. Zvolte poskytovatele: **AWS**, region: **Frankfurt (eu-central-1)**
4. Pojmenujte cluster: `seknuto-production`
5. Klikněte **Create Deployment**

### 1.2 Vytvoření databázového uživatele

1. V levém menu: **Database Access → Add New Database User**
2. Authentication: **Password**
3. Username: `seknuto_app`
4. Password: vygenerujte silné heslo (uložte si ho!)
5. Database User Privileges: **Read and write to any database**
6. Klikněte **Add User**

### 1.3 Nastavení síťového přístupu

1. V levém menu: **Network Access → Add IP Address**
2. Pro začátek: klikněte **Allow Access from Anywhere** (`0.0.0.0/0`)

   > Po nasazení na Render můžete zpřísnit na konkrétní IP adresy Renderu.
   > Render IP adresy najdete v: [render.com/docs/static-outbound-ip-addresses](https://render.com/docs/static-outbound-ip-addresses)

3. Klikněte **Confirm**

### 1.4 Získání connection stringu

1. Na stránce clusteru klikněte **Connect**
2. Vyberte **Drivers**
3. Driver: **Python**, Version: **3.12 or later**
4. Zkopírujte connection string, vypadá takto:
   ```
   mongodb+srv://seknuto_app:<password>@seknuto-production.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=seknuto-production
   ```
5. Nahraďte `<password>` heslem z kroku 1.2
6. Tento string uložte – použijete ho jako `MONGO_URL` na Renderu

### 1.5 Vytvoření databáze

Databáze se vytvoří automaticky při prvním zápisu. Název nastavíte v `DB_NAME`.

---

## Krok 2 – Render (backend FastAPI)

### 2.1 Nahrání kódu na GitHub

Pokud kód ještě není na GitHubu:

1. Vytvořte nový repozitář na github.com (např. `seknuto-app`)
2. V Emergent platformě použijte funkci **"Save to GitHub"** v chat inputu
3. Ověřte, že `.env` soubory **nejsou** v commitu (jsou v `.gitignore`)

### 2.2 Vytvoření Web Service na Render

1. Přejděte na [render.com](https://render.com) → **New → Web Service**
2. Klikněte **Connect a GitHub repository** a vyberte svůj repozitář
3. Vyplňte nastavení:

   | Pole | Hodnota |
   |------|---------|
   | Name | `seknuto-backend` |
   | Region | `Frankfurt (EU Central)` |
   | Branch | `main` |
   | Root Directory | `backend` |
   | Runtime | `Python 3` |
   | Build Command | `pip install -r requirements.txt` |
   | Start Command | `uvicorn server:app --host 0.0.0.0 --port $PORT` |
   | Plan | `Starter` ($7/měs.) nebo `Free` (pro testování) |

   > **Důležité:** Free plan uspí aplikaci po 15 minutách neaktivity.
   > Pro ostré použití vyberte **Starter** ($7/měs.) – aplikace bude vždy dostupná.

4. Zatím **neklikejte Deploy** – nejprve nastavte proměnné prostředí.

### 2.3 Nastavení proměnných prostředí na Render

V sekci **Environment Variables** přidejte tyto proměnné:

| Proměnná | Hodnota | Popis |
|----------|---------|-------|
| `MONGO_URL` | `mongodb+srv://seknuto_app:HESLO@...` | Connection string z Atlas |
| `DB_NAME` | `seknuto_production` | Název databáze |
| `CORS_ORIGINS` | `https://seknuto.cz,https://www.seknuto.cz,https://seknuto.vercel.app` | Povolené origins (upravte!) |
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxxxxx` | Váš Resend API klíč |
| `SENDER_EMAIL` | `info@seknuto.cz` | Odesílatel e-mailů (musí být ověřená doména) |
| `ADMIN_EMAIL` | `vas@email.cz` | E-mail pro admin notifikace |
| `RESEND_AUDIENCE_ID` | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | ID audience v Resend |
| `GOOGLE_CLIENT_ID` | `xxxxx.apps.googleusercontent.com` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxxxxxxxxxxxxxx` | Google OAuth Client Secret |
| `GOOGLE_REDIRECT_URI` | `https://seknuto-backend.onrender.com/api/auth/google/callback` | Musí přesně odpovídat nastavení v Google Cloud! |
| `ADMIN_PASSWORD` | `VašeNovéSilnéHeslo2025!` | Heslo do admin panelu |

> **Kde najdu `RESEND_AUDIENCE_ID`?**
> Resend dashboard → **Audiences** → klikněte na vaši audience → ID je v URL nebo v detailu.

### 2.4 Spuštění deploye

1. Klikněte **Create Web Service**
2. Render stáhne kód z GitHubu, nainstaluje závislosti a spustí server
3. Sledujte logy v záložce **Logs** – hledejte:
   ```
   INFO:     Uvicorn running on http://0.0.0.0:10000
   INFO:     MongoDB indexes created successfully
   ```
4. Ověřte nasazení:
   ```bash
   curl https://seknuto-backend.onrender.com/api/health
   # Odpověď: {"status": "ok", "service": "SeknuTo.cz API", "version": "1.0.0"}
   ```

### 2.5 Nastavení vlastní backendové domény (volitelné)

Pokud chcete mít backend na `api.seknuto.cz`:

1. Render → **Settings → Custom Domains**
2. Přidejte `api.seknuto.cz`
3. U registrátora přidejte CNAME záznam:
   ```
   CNAME  api  seknuto-backend.onrender.com.
   ```
4. Aktualizujte `GOOGLE_REDIRECT_URI` a `CORS_ORIGINS` s novou doménou

---

## Krok 3 – Vercel (frontend React)

### 3.1 Import projektu

1. Přejděte na [vercel.com](https://vercel.com) → **Add New → Project**
2. Importujte GitHub repozitář
3. Vercel automaticky detekuje Create React App

### 3.2 Nastavení buildu

| Pole | Hodnota |
|------|---------|
| Framework Preset | `Create React App` |
| Root Directory | `frontend` |
| Build Command | `yarn build` |
| Output Directory | `build` |
| Install Command | `yarn install` |

### 3.3 Proměnné prostředí na Vercel

V sekci **Environment Variables** přidejte:

| Proměnná | Hodnota | Environment |
|----------|---------|-------------|
| `REACT_APP_BACKEND_URL` | `https://seknuto-backend.onrender.com` | Production, Preview, Development |

> **Poznámka:** Pokud máte backend na vlastní doméně (`api.seknuto.cz`),
> použijte tu místo `.onrender.com` URL.

### 3.4 Spuštění deploye

1. Klikněte **Deploy**
2. Sledujte logy buildu – build trvá 2-5 minut
3. Po dokončení Vercel zobrazí preview URL (např. `seknuto.vercel.app`)
4. Otevřete URL a ověřte, že se aplikace načte

### 3.5 Ověření Vercel konfigurace (vercel.json)

Soubor `/app/frontend/vercel.json` je již připraven a obsahuje:
```json
{
  "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]
}
```
To zajistí správné fungování React Router při přímém přístupu na URL (např. `/rezervace`).

---

## Krok 4 – Vlastní doména seknuto.cz

### 4.1 Přidání domény do Vercel

1. Vercel → váš projekt → **Settings → Domains**
2. Zadejte `seknuto.cz` a klikněte **Add**
3. Přidejte i `www.seknuto.cz` (Vercel automaticky přesměruje www → apex nebo naopak)

### 4.2 Nastavení DNS záznamů

U svého doménového registrátora (např. Wedos, Active24, Forpsi) přidejte:

```
Typ    Název   Hodnota                    TTL
────────────────────────────────────────────────
A      @       76.76.21.21                3600
CNAME  www     cname.vercel-dns.com.      3600
```

> **Propagace DNS** trvá 15 minut až 48 hodin. Průměrně ~30 minut.
> Kontrola: `nslookup seknuto.cz` nebo [dnschecker.org](https://dnschecker.org)

### 4.3 SSL certifikát

Vercel automaticky vydá Let's Encrypt SSL certifikát do 5 minut po ověření DNS.
Stránka bude dostupná přes `https://seknuto.cz`.

### 4.4 Aktualizace CORS na Render

Po nastavení domény aktualizujte proměnnou `CORS_ORIGINS` na Render:
```
CORS_ORIGINS=https://seknuto.cz,https://www.seknuto.cz
```

---

## Krok 5 – Resend (e-maily)

### 5.1 Ověření domény v Resend

Bez ověřené domény budou e-maily zákazníkům **odmítnuty**. Toto je nutný krok.

1. Přihlaste se na [app.resend.com](https://app.resend.com)
2. V levém menu: **Domains → Add Domain**
3. Zadejte `seknuto.cz` a klikněte **Add**
4. Resend zobrazí DNS záznamy k přidání – vypadají přibližně takto:

```
Typ    Název                           Hodnota
──────────────────────────────────────────────────────────────
TXT    resend._domainkey.seknuto.cz   v=DKIM1; k=rsa; p=XXXX...
MX     send.seknuto.cz                feedback-smtp.us-east-1.amazonses.com
TXT    send.seknuto.cz                v=spf1 include:amazonses.com ~all
```

5. Přidejte tyto záznamy u svého doménového registrátora
6. Vraťte se do Resend a klikněte **Verify DNS Records**
7. Stav se změní na **Verified** (zelená ikona)

### 5.2 Ověření odesílatele

Po ověření domény se ujistěte, že `SENDER_EMAIL` je nastaven na adresu v ověřené doméně:
```
SENDER_EMAIL=info@seknuto.cz
```

### 5.3 Nastavení Audience pro newsletter

1. Resend → **Audiences → Create Audience**
2. Pojmenujte ji `SeknuTo Newsletter`
3. Zkopírujte Audience ID (UUID formát)
4. Nastavte na Render: `RESEND_AUDIENCE_ID=xxxx-xxxx-xxxx-xxxx`

### 5.4 Test odeslání e-mailu

Po ověření domény otestujte odesílání nové rezervace:
```bash
curl -X POST https://seknuto-backend.onrender.com/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "service": "lawn_mowing",
    "property_size": 100,
    "condition": "normal",
    "preferred_date": "2025-06-01",
    "preferred_time": "morning",
    "customer_name": "Test Zákazník",
    "customer_phone": "+420123456789",
    "customer_email": "vas@email.cz",
    "property_address": "Testovací 1, Praha",
    "estimated_price": 300,
    "gdpr_consent": true
  }'
```
Zkontrolujte doručení e-mailu na `customer_email` i `ADMIN_EMAIL`.

---

## Krok 6 – Google Calendar (autorizace)

### 6.1 Nastavení Redirect URI v Google Cloud Console

Před autorizací musíte přidat produkční Redirect URI:

1. Přejděte na [console.cloud.google.com](https://console.cloud.google.com)
2. Váš projekt → **APIs & Services → Credentials**
3. Klikněte na váš OAuth 2.0 Client ID
4. V sekci **Authorized redirect URIs** přidejte:
   ```
   https://seknuto-backend.onrender.com/api/auth/google/callback
   ```
5. Klikněte **Save**

### 6.2 Autorizace aplikace

1. Otevřete v prohlížeči:
   ```
   https://seknuto-backend.onrender.com/api/google/auth/url
   ```
2. Backend vrátí JSON s `auth_url` – zkopírujte URL
3. Otevřete URL v prohlížeči (použijte Google účet majitele kalendáře)
4. Klikněte **Pokračovat** a povolte přístup ke Google Kalendáři
5. Budete přesměrováni zpět na backend – zobrazí se:
   ```json
   {"message": "Google Calendar authorized successfully"}
   ```

### 6.3 Ověření synchronizace

Po autorizaci vytvořte testovací rezervaci a ověřte:
- Zda se událost objevila v Google Kalendáři
- Logy na Render: `Successfully added booking to Google Calendar`

---

## Krok 7 – Ověření celého systému

Po dokončení všech kroků proveďte kompletní test:

### 7.1 API health check
```bash
curl https://seknuto-backend.onrender.com/api/health
# Očekávaná odpověď:
# {"status": "ok", "service": "SeknuTo.cz API", "version": "1.0.0"}
```

### 7.2 Frontend načtení
Otevřete `https://seknuto.cz` a ověřte:
- [ ] Domovská stránka se načte bez chyb
- [ ] Navigace funguje (Služby, Ceník, Rezervace, Blog, Galerie)
- [ ] Rezervační formulář jde dokončit
- [ ] Admin panel (`/admin`) je dostupný a vyžaduje heslo

### 7.3 Kompletní rezervační flow
1. Přejděte na `https://seknuto.cz/rezervace`
2. Vyberte službu → nastavte plochu → vyberte termín
3. Vyplňte kontaktní údaje a odešlete
4. Ověřte:
   - [ ] Rezervace se zobrazí v admin panelu (`/admin` → Objednávky)
   - [ ] Admin dostane notifikační e-mail
   - [ ] (Pokud Resend ověřen) Zákazník dostane potvrzovací e-mail
   - [ ] (Pokud Google Calendar ověřen) Událost se objeví v kalendáři

### 7.4 Admin panel
1. Přejděte na `https://seknuto.cz/admin`
2. Přihlaste se heslem z `ADMIN_PASSWORD`
3. Ověřte:
   - [ ] Záložka Objednávky zobrazí testovací rezervace
   - [ ] Lze měnit status rezervace
   - [ ] Záložka Vouchery funguje (vytvoření, smazání)
   - [ ] Záložka Blog – lze přidat/upravit příspěvek
   - [ ] Záložka Galerie – lze přidat projekt

### 7.5 Voucher flow
1. Vytvořte testovací voucher v admin panelu
2. Otevřete `https://seknuto.cz/poukaz/KÓD-VOUCHERU`
3. Ověřte zobrazení popup stránky s voucherem
4. Klikněte na odkaz rezervace a ověřte, že se sleva aplikuje

---

## Referenční tabulka proměnných prostředí

### Backend (Render)

| Proměnná | Povinná | Příklad hodnoty | Popis |
|----------|---------|-----------------|-------|
| `MONGO_URL` | ✅ | `mongodb+srv://user:pass@cluster.mongodb.net/...` | MongoDB Atlas connection string |
| `DB_NAME` | ✅ | `seknuto_production` | Název produkční databáze |
| `CORS_ORIGINS` | ✅ | `https://seknuto.cz,https://www.seknuto.cz` | Povolené frontend origins |
| `RESEND_API_KEY` | ✅ | `re_AbCdEfGhIj...` | Klíč z Resend dashboardu |
| `SENDER_EMAIL` | ✅ | `info@seknuto.cz` | Musí být z ověřené domény |
| `ADMIN_EMAIL` | ✅ | `vas@email.cz` | Příjemce admin notifikací |
| `RESEND_AUDIENCE_ID` | ✅ | `xxxxxxxx-xxxx-xxxx-xxxx` | ID newsletter audience |
| `GOOGLE_CLIENT_ID` | ✅ | `xxxxx.apps.googleusercontent.com` | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | ✅ | `GOCSPX-xxxxxxxxxx` | Google OAuth |
| `GOOGLE_REDIRECT_URI` | ✅ | `https://seknuto-backend.onrender.com/api/auth/google/callback` | Musí odpovídat Google Console |
| `ADMIN_PASSWORD` | ✅ | `SilnéHeslo2025!` | Heslo do admin panelu |

### Frontend (Vercel)

| Proměnná | Povinná | Příklad hodnoty | Popis |
|----------|---------|-----------------|-------|
| `REACT_APP_BACKEND_URL` | ✅ | `https://seknuto-backend.onrender.com` | URL backendu bez lomítka na konci |

---

## Produkční checklist

### Infrastruktura
- [ ] GitHub repozitář vytvořen a kód nahrán
- [ ] `.env` soubory nejsou v repozitáři (ověřte `git log --all -- "*.env"`)
- [ ] MongoDB Atlas cluster běží (M10+ pro produkci)
- [ ] Render Web Service je online
- [ ] Vercel projekt je nasazen

### Konfigurace
- [ ] Všechny env proměnné na Renderu jsou vyplněny
- [ ] `CORS_ORIGINS` obsahuje finální produkční URL
- [ ] `GOOGLE_REDIRECT_URI` odpovídá záznamu v Google Cloud Console
- [ ] Admin heslo změněno na silné (ne výchozí `SeknuTo2025!`)

### Integrace
- [ ] `/api/health` vrací `{"status": "ok"}`
- [ ] Resend doména `seknuto.cz` je ověřena (zelená)
- [ ] Google Calendar autorizován (otevřít `/api/google/auth/url`)
- [ ] Testovací e-mail zákazníkovi doručen
- [ ] Testovací rezervace se objevila v Google Kalendáři

### Doména a SSL
- [ ] DNS záznamy pro `seknuto.cz` přidány u registrátora
- [ ] DNS propagace dokončena (`nslookup seknuto.cz` vrátí `76.76.21.21`)
- [ ] `https://seknuto.cz` se načte s platným SSL certifikátem (zámek v prohlížeči)
- [ ] `https://www.seknuto.cz` přesměruje na `https://seknuto.cz`

### Funkční test
- [ ] Rezervace vytvořena a doručena do adminu
- [ ] Admin notifikační e-mail doručen
- [ ] Zákaznický potvrzovací e-mail doručen
- [ ] Voucher stránka (`/poukaz/TEST`) funguje
- [ ] Admin panel plně funkční (objednávky, vouchery, blog, galerie)

---

## Řešení problémů (Troubleshooting)

### Backend se nespustí na Render
```
Kontrola logů: Render Dashboard → Logs
```
- **`ModuleNotFoundError`** → spusťte: `pip install -r requirements.txt` ověřte, že requirements.txt je aktuální
- **`Connection refused` k MongoDB** → ověřte MONGO_URL, whitelist IP adresy v Atlas Network Access
- **`CORS error` v konzoli prohlížeče** → zkontrolujte `CORS_ORIGINS` na Render – musí obsahovat URL vašeho frontendu

### E-maily se neposílají
- **`403 Forbidden` od Resend** → doména není ověřena, zkontrolujte DNS záznamy
- **`Domain not verified`** → počkejte 30 minut po přidání DNS záznamů, pak klikněte Verify znovu
- **Zákazník nedostává e-mail** → zkontrolujte spam složku; použijte Resend Logs pro diagnostiku

### Google Calendar nefunguje
- **`redirect_uri_mismatch`** → `GOOGLE_REDIRECT_URI` v `.env` musí přesně odpovídat URI v Google Cloud Console (včetně http/https a lomítek)
- **`Token expired`** → opakujte autorizaci přes `/api/google/auth/url`
- **Událost se nevytvoří** → zkontrolujte logy na Render: `grep "Google Calendar" logs`

### Frontend zobrazuje prázdnou stránku
- Zkontrolujte `REACT_APP_BACKEND_URL` na Vercel – URL nesmí končit lomítkem
- Otevřete DevTools → Console a podívejte se na CORS/Network chyby
- Ověřte, že `vercel.json` s rewrite pravidlem existuje v `/frontend/`

### Render aplikace je pomalá (free tier)
- Free tier se uspí po 15 minutách neaktivity
- **Řešení:** Upgradujte na Starter ($7/měs.) nebo nastavte UptimeRobot ping každých 5 minut:
  - UptimeRobot → New Monitor → HTTP(s) → `https://seknuto-backend.onrender.com/api/health` → interval 5 min

### Zapomenuté admin heslo
```bash
# Připojte se k MongoDB Atlas přes Atlas Data Explorer nebo mongosh:
# Smazat všechny admin sessions (odhlásí uživatele)
db.admin_sessions.deleteMany({})
# Poté změňte ADMIN_PASSWORD na Render a restartujte service
```

---

## Náklady a doporučené plány

| Služba | Free Tier | Doporučený plán | Cena |
|--------|-----------|-----------------|------|
| Vercel | 100 GB bandwidth, neomezené deploye | Pro ($20/měs.) – pro vlastní domény s více projekty | Zdarma pro 1 projekt |
| Render | Uspí po 15 min neaktivity | **Starter** – vždy online | ~$7/měs. |
| MongoDB Atlas | M0 – 512 MB, sdílený cluster | **M10 Dedicated** – pro produkci s daty | ~$57/měs. nebo M2 ~$9/měs. |
| Resend | 3 000 e-mailů/měs. zdarma | Pro – 50 000/měs. | Zdarma pro start |
| **Celkem (start)** | | | **~$7-16/měs.** |

> **Tip pro začátek:** MongoDB M0 (free) + Render Starter ($7) = **$7/měs.** celkem.
> Přejděte na M10 teprve až budete mít 1000+ rezervací v databázi.

---

## Lokální vývoj

```bash
# Klonování repozitáře
git clone https://github.com/vas-repozitar/seknuto-app.git
cd seknuto-app

# Backend
cd backend
cp .env.example .env
# Vyplňte .env hodnotami pro lokální prostředí
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend (nové okno terminálu)
cd frontend
cp .env.example .env
# Nastavte: REACT_APP_BACKEND_URL=http://localhost:8001
yarn install
yarn start
# Aplikace běží na http://localhost:3000
```

### Testovací data
```bash
# Zdravotní stav backendu
curl http://localhost:8001/api/health

# Test admin přihlášení
curl -X POST http://localhost:8001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password": "SeknuTo2025!"}'
```

---

## Kontakt a podpora

**Projekt:** SeknuTo.cz  
**Majitel:** Dušan Macháček  
**E-mail:** dusanmachacek.v@gmail.com  
**Technická podpora:** Viz README.md pro popis architektury  

---

*Dokument aktualizován: Prosinec 2025 | Verze: 2.0*
