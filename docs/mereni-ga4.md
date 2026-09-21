# Měření konverzí – GA4 + Google Ads

Značka Google se na webu načítá **z Reactu** (`src/components/GoogleAnalytics.jsx`),
ne natvrdo z `index.html`. ID se bere z proměnné prostředí `REACT_APP_GA_ID`.

> ⚠️ **Zkontroluj jako první:** když `REACT_APP_GA_ID` není nastavené ve Vercelu,
> gtag se vůbec nenačte a neměří se nic. V repozitáři tato proměnná není (a být
> nemá) – musí existovat v nastavení projektu na Vercelu.

Veškeré měření jde přes `src/lib/analytics.js`. Ten modul zajišťuje tři věci:
bez gtag se nic nerozbije, v dev módu se události logují do konzole a **osobní
údaje se do GA nikdy neodešlou** (filtr na jméno, telefon, e-mail, adresu i
poznámku – je na to unit test).

## Události

| Event | Kdy přesně | Parametry |
|---|---|---|
| `form_start` | první skutečná interakce s formulářem, **jen 1× za návštěvu** | `form_id` |
| `form_step` | přechod na další krok | `form_id`, `step_number`, `step_name` |
| `generate_lead` | **až po úspěšné odpovědi serveru** – ne na klik | `form_id`, `service_type`, `preferred_channel` |
| `form_error` | selhání validace nebo odeslání | `form_id`, `error_type` |
| `click_phone` | klik na jakýkoli `tel:` odkaz | `link_location` |
| `click_whatsapp` | klik na WhatsApp odkaz | `link_location` |
| `click_email` | klik na `mailto:` | `link_location` |

`link_location` se bere z atributu `data-track-location` na nejbližším rodiči.
Dnes používané hodnoty: `hero`, `sticky`, `float`, `rezervace-chyba`.

Kliky na kontakty hlídá **jeden delegovaný listener** na dokumentu, takže
fungují i pro odkazy, které na stránce vzniknou až později.

## Co je potřeba nastavit ručně

### 1. GA4 – označit klíčové události
Administrátor → **Události** → u těchto tří přepnout „Označit jako klíčovou událost":
- `generate_lead` ← hlavní konverze
- `click_phone`
- `click_whatsapp`

Události se v seznamu objeví až poté, co je web aspoň jednou odešle. Po nasazení
tedy nejdřív projdi formulář nanečisto.

### 2. Google Ads – import konverzí
Cíle → Konverze → **Nová akce pro konverzi** → Import → Google Analytics 4 → Web.
Naimportuj všechny tři. Jako **primární** nech `generate_lead`; `click_phone` a
`click_whatsapp` nastav jako **sekundární**, ať ti neředí optimalizaci – jeden
člověk může kliknout na telefon několikrát.

### 3. Ověření po nasazení
- GA4 → Administrátor → **DebugView** (v prohlížeči si zapni rozšíření Tag Assistant),
- projdi formulář a sleduj pořadí: `form_start` → `form_step` → `generate_lead`,
- zkontroluj, že `generate_lead` dorazí **jen jednou** a **až po odeslání**.

## Souhlas s cookies – otevřené riziko

Web **nemá cookie lištu ani Consent Mode v2**. V ČR/EU vyžadují analytické
a reklamní cookies souhlas návštěvníka. Vlastní řešení jsem záměrně
neimplementoval – je to rozhodnutí, které má dopad na měřená data i na právní
compliance.

Možnosti:
1. **Consent Mode v2 se lištou** – měření běží dál i bez souhlasu, jen
   v anonymizovaném režimu (modelovaná data). Doporučený postup pro Ads.
2. **Klasická lišta bez Consent Mode** – bez souhlasu se neměří nic, čísla
   v Ads spadnou.

Než se to vyřeší, je měření v šedé zóně. Dej vědět, kterou cestou jít.

## Kvalita značky Google („1 issue")

Prověřeno v kódu: značka **není vložená dvakrát** (v `index.html` žádný gtag
není) a `page_view` se při změně routy posílá jednou, protože `config` běží
s `send_page_view: false`. Hlášení tedy nejspíš míří na chybějící souhlas
(viz výše) nebo na stránky, kam se návštěvník dostane mimo SPA. Zbytek je
v administraci Googlu, ne v kódu.
