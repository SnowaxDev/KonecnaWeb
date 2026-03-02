# SeknuTo.cz – Průvodce nasazením (Deploy Guide)

## Architektura produkčního nasazení

```
Vercel (Frontend React)  →  Render (Backend FastAPI)  →  MongoDB Atlas (DB)
        ↓
   seknuto.cz
```

---

## Krok 1: MongoDB Atlas (databáze)

1. Přejděte na [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Vytvořte bezplatný účet a cluster (free tier – M0)
3. V **Network Access** přidejte `0.0.0.0/0` (allow all) nebo IP Renderu
4. V **Database Access** vytvořte uživatele s heslem
5. Klikněte **Connect → Drivers** a zkopírujte connection string:
   ```
   mongodb+srv://USER:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority
   ```

---

## Krok 2: Render (Backend FastAPI)

### 2a. Připojení repozitáře
1. Přejděte na [render.com](https://render.com) a přihlaste se
2. **New → Web Service**
3. Připojte GitHub repozitář
4. Nastavení:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free (nebo Starter pro lepší výkon)

### 2b. Environment Variables na Render
Přidejte všechny tyto proměnné v **Environment** sekci:

| Proměnná | Hodnota |
|----------|---------|
| `MONGO_URL` | `mongodb+srv://...` (z Atlas) |
| `DB_NAME` | `seknuto_production` |
| `CORS_ORIGINS` | `https://seknuto.cz,https://www.seknuto.cz,https://your-app.vercel.app` |
| `RESEND_API_KEY` | Váš Resend API klíč |
| `SENDER_EMAIL` | `info@seknuto.cz` |
| `ADMIN_EMAIL` | `dusanmachacek.v@gmail.com` |
| `RESEND_AUDIENCE_ID` | Váš Resend audience ID |
| `GOOGLE_CLIENT_ID` | Váš Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Váš Google OAuth Client Secret |
| `GOOGLE_REDIRECT_URI` | `https://seknuto-backend.onrender.com/api/auth/google/callback` |
| `STRIPE_API_KEY` | `sk_live_...` (produkční) nebo `sk_test_...` (testovací) |
| `ADMIN_PASSWORD` | Silné heslo (změňte!) |

### 2c. Po deployi
- Backend URL bude: `https://seknuto-backend.onrender.com`
- Ověřte: `https://seknuto-backend.onrender.com/api/health` → `{"status": "ok"}`

> ⚠️ **Free tier Render** uspí aplikaci po 15 min neaktivity. Pro ostrý provoz doporučujeme Starter plan (~$7/měsíc).

---

## Krok 3: Vercel (Frontend React)

### 3a. Importování projektu
1. Přejděte na [vercel.com](https://vercel.com) a přihlaste se
2. **Add New → Project**
3. Importujte GitHub repozitář
4. Nastavení:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `yarn build`
   - **Output Directory:** `build`

### 3b. Environment Variables na Vercel
V **Settings → Environment Variables** přidejte:

| Proměnná | Hodnota |
|----------|---------|
| `REACT_APP_BACKEND_URL` | `https://seknuto-backend.onrender.com` |

### 3c. Vlastní doména
1. V Vercel → **Settings → Domains**
2. Přidejte `seknuto.cz` a `www.seknuto.cz`
3. Nastavte DNS záznamy u svého registrátora:
   ```
   A     @      76.76.21.21
   CNAME www    cname.vercel-dns.com
   ```

---

## Krok 4: Google Calendar – autorizace

Po deployi backendu:
1. Navštivte: `https://seknuto-backend.onrender.com/api/google/auth/url`
2. Zkopírujte vrácenou URL a otevřete ji v prohlížeči
3. Přihlaste se svým Google účtem a povolte přístup ke Kalendáři
4. Budete přesměrováni zpět – autorizace je dokončena

---

## Krok 5: Resend – ověření domény

1. Přihlaste se na [resend.com](https://resend.com)
2. **Domains → Add Domain** → zadejte `seknuto.cz`
3. Přidejte DNS záznamy které Resend zobrazí (TXT, MX záznamy)
4. Počkejte na ověření (5-30 minut)
5. Po ověření budou fungovat e-maily zákazníkům

---

## Krok 6: Stripe – produkční klíče

1. Přihlaste se na [stripe.com](https://stripe.com)
2. Přepněte z **Test mode** do **Live mode**
3. Zkopírujte **Secret key** (`sk_live_...`)
4. Aktualizujte `STRIPE_API_KEY` na Renderu
5. V **Webhooks** přidejte endpoint: `https://seknuto-backend.onrender.com/api/webhook/stripe`

---

## Checklist před spuštěním

- [ ] MongoDB Atlas cluster běží a connection string funguje
- [ ] Render backend je online (`/api/health` vrací OK)
- [ ] Vercel frontend je online a používá správný backend URL
- [ ] Resend doména ověřena → zákaznické e-maily fungují
- [ ] Google Calendar autorizován
- [ ] Stripe live klíče nastaveny
- [ ] Admin heslo změněno na silné heslo
- [ ] CORS_ORIGINS obsahuje produkční Vercel URL
- [ ] Doménové záznamy DNS propagovány

---

## Lokální vývoj (pro reference)

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend
cd frontend
yarn install
yarn start
```

---

## Kontakt & podpora
Web: SeknuTo.cz
E-mail: dusanmachacek.v@gmail.com
