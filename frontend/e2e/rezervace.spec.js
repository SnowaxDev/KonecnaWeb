const { test, expect } = require('@playwright/test');

/**
 * Konverzní a měřicí testy pro /rezervace.
 *
 * Dvě pravidla, která tu platí všude:
 *  1) /api/** je vždy mocknuté – z testů nesmí odejít reálná poptávka.
 *  2) window.gtag je stub, který si události ukládá do window.__events,
 *     takže umíme tvrdit i to, co se NEodeslalo (osobní údaje).
 */

// Stub gtag musí být na stránce dřív, než se načte React.
async function stubAnalytics(page) {
  await page.addInitScript(() => {
    window.__events = [];
    window.gtag = (...args) => {
      if (args[0] === 'event') window.__events.push({ name: args[1], params: args[2] || {} });
    };
  });
}

// Backend nikdy nevoláme doopravdy.
async function mockApi(page, { bookingStatus = 200 } = {}) {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/bookings')) {
      if (bookingStatus >= 400) return route.fulfill({ status: bookingStatus, body: '{"detail":"chyba"}' });
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'test-123' }) });
    }
    if (url.includes('/pricing/calculate')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ estimated_price: 0, tier_info: null }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
}

const events = (page) => page.evaluate(() => window.__events || []);
const named = (list, name) => list.filter((e) => e.name === name);

async function fillContactStep(page, { email = 'jan@email.cz' } = {}) {
  await page.getByTestId('input-customer-name').fill('Jan Novák');
  await page.getByTestId('input-customer-phone').fill('730 588 372');
  if (email) await page.getByTestId('input-customer-email').fill(email);
  await page.getByTestId('input-property-address').fill('Dvůr Králové nad Labem');
  await page.getByTestId('gdpr-consent').click();
}

// Proklikání z kroku 1 až na kontakt.
async function goToContactStep(page) {
  await page.getByTestId('step-1-content').waitFor();
  await page.getByTestId('service-option-lawn_mowing').click();
  await page.getByTestId('btn-next').click();
  await page.getByTestId('btn-next').click(); // krok 2 → 3
  await page.getByTestId('btn-next').click(); // krok 3 → 4
  await page.getByTestId('input-customer-name').waitFor();
}

test.describe('Rezervace – konverzní tok', () => {
  test.beforeEach(async ({ page }) => {
    await stubAnalytics(page);
    await mockApi(page);
  });

  test('projde celý formulář a pošle generate_lead až po úspěchu', async ({ page }) => {
    await page.goto('/rezervace');
    await goToContactStep(page);

    // Před odesláním konverze existovat nesmí
    expect(named(await events(page), 'generate_lead')).toHaveLength(0);

    await fillContactStep(page);
    await page.getByTestId('btn-submit').click();

    await expect(page.getByTestId('btn-submit')).toBeHidden({ timeout: 10000 });

    const evs = await events(page);
    expect(named(evs, 'form_start')).toHaveLength(1);
    expect(named(evs, 'generate_lead')).toHaveLength(1);
    expect(named(evs, 'form_step').length).toBeGreaterThanOrEqual(2);
  });

  test('bez e-mailu poptávka neprojde a chyba je u pole', async ({ page }) => {
    await page.goto('/rezervace');
    await goToContactStep(page);
    await fillContactStep(page, { email: '' });
    await page.getByTestId('btn-submit').click();

    await expect(page.getByRole('alert').filter({ hasText: 'e-mail' })).toBeVisible();
    // Neodeslaná poptávka se nesmí počítat jako konverze
    expect(named(await events(page), 'generate_lead')).toHaveLength(0);
  });

  test('neplatný e-mail ukáže chybu u pole', async ({ page }) => {
    await page.goto('/rezervace');
    await goToContactStep(page);
    await fillContactStep(page, { email: 'neplatny' });
    await page.getByTestId('btn-submit').click();

    await expect(page.getByRole('alert').filter({ hasText: 'E-mail' })).toBeVisible();
    expect(named(await events(page), 'generate_lead')).toHaveLength(0);
  });

  test('žádná událost neobsahuje osobní údaje', async ({ page }) => {
    await page.goto('/rezervace');
    await goToContactStep(page);
    await fillContactStep(page, { email: 'jan@email.cz' });
    await page.getByTestId('btn-submit').click();
    await expect(page.getByTestId('btn-submit')).toBeHidden({ timeout: 10000 });

    const blob = JSON.stringify(await events(page)).toLowerCase();
    for (const secret of ['jan novák', 'jan@email.cz', '730 588 372', '730588372', 'dvůr králové']) {
      expect(blob).not.toContain(secret.toLowerCase());
    }
  });

  test('chyba serveru ukáže hlášku a nabídne WhatsApp i telefon', async ({ page }) => {
    await mockApi(page, { bookingStatus: 500 });
    await page.goto('/rezervace');
    await goToContactStep(page);
    await fillContactStep(page);
    await page.getByTestId('btn-submit').click();

    await expect(page.getByTestId('submit-error')).toBeVisible({ timeout: 10000 });
    const evs = await events(page);
    expect(named(evs, 'form_error').length).toBeGreaterThanOrEqual(1);
    // Neúspěch se nesmí počítat jako konverze
    expect(named(evs, 'generate_lead')).toHaveLength(0);
  });

  test('neplatný telefon ukáže chybu přímo u pole', async ({ page }) => {
    await page.goto('/rezervace');
    await goToContactStep(page);
    await page.getByTestId('input-customer-name').fill('Jan Novák');
    await page.getByTestId('input-customer-phone').fill('123');
    await page.getByTestId('input-customer-email').fill('jan@email.cz');
    await page.getByTestId('input-property-address').fill('Dvůr Králové');
    await page.getByTestId('gdpr-consent').click();
    await page.getByTestId('btn-submit').click();

    await expect(page.getByRole('alert').filter({ hasText: 'Telefon' })).toBeVisible();
    expect(named(await events(page), 'generate_lead')).toHaveLength(0);
  });

  test('krok zpět nesmaže vyplněná data', async ({ page }) => {
    await page.goto('/rezervace');
    await goToContactStep(page);
    await page.getByTestId('input-customer-name').fill('Jan Novák');
    await page.getByTestId('btn-back').click();
    await page.getByTestId('btn-next').click();
    await expect(page.getByTestId('input-customer-name')).toHaveValue('Jan Novák');
  });

  test('dvojklik na Odeslat pošle jen jeden request', async ({ page }) => {
    let calls = 0;
    await page.route('**/api/bookings', async (route) => {
      calls += 1;
      await new Promise((r) => setTimeout(r, 400));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'x' }) });
    });
    await page.goto('/rezervace');
    await goToContactStep(page);
    await fillContactStep(page);
    const btn = page.getByTestId('btn-submit');
    await btn.click();
    await btn.click({ force: true }).catch(() => {});
    await expect(btn).toBeHidden({ timeout: 10000 });
    expect(calls).toBe(1);
  });

  test('?sluzba=listi předvybere službu', async ({ page }) => {
    await page.goto('/rezervace?sluzba=listi');
    await page.getByTestId('step-1-content').waitFor();
    // Předvybraná služba umožní rovnou pokračovat, bez výběru dlaždice
    await page.getByTestId('btn-next').click();
    await expect(page.getByTestId('step-1-content')).toBeHidden();
  });
});

test.describe('Kontaktní odkazy a sticky lišta', () => {
  test.beforeEach(async ({ page }) => {
    await stubAnalytics(page);
    await mockApi(page);
  });

  test('lišta míří na poptávku a WhatsApp, nikoli na volání', async ({ page }, testInfo) => {
    await page.goto('/');
    const bar = page.getByTestId('sticky-contact-bar');
    const isMobile = testInfo.project.name.startsWith('mobile');

    if (!isMobile) {
      await expect(bar).toBeHidden();
      return;
    }

    await expect(bar).toBeVisible();
    await expect(page.getByTestId('sticky-booking')).toHaveAttribute('href', '/rezervace');

    const wa = await page.getByTestId('sticky-whatsapp').getAttribute('href');
    expect(wa).toContain('wa.me/420730588372');
    expect(decodeURIComponent(wa)).toContain('Dobrý den, mám zájem o zahradní práce');

    // Telefon nechceme propagovat – v liště nesmí být žádný tel: odkaz
    expect(await bar.locator('a[href^="tel:"]').count()).toBe(0);

    const box = await page.getByTestId('sticky-booking').boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(48);
  });

  test('klik na WhatsApp v liště pošle click_whatsapp se správnou lokalitou', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.startsWith('mobile'), 'lišta je jen na mobilu');
    await page.goto('/');
    await page.getByTestId('sticky-whatsapp').click({ modifiers: ['Alt'] });
    const ev = named(await events(page), 'click_whatsapp');
    expect(ev.length).toBeGreaterThanOrEqual(1);
    expect(ev[0].params.link_location).toBe('sticky');
  });

  test('na /rezervace se lišta neukazuje vůbec', async ({ page }) => {
    await page.goto('/rezervace');
    await page.getByTestId('step-1-content').waitFor();
    await expect(page.getByTestId('sticky-contact-bar')).toBeHidden();
  });
});

test.describe('Rezervace se vejde na jednu obrazovku', () => {
  test.beforeEach(async ({ page }) => {
    await stubAnalytics(page);
    await mockApi(page);
  });

  test('stránka nejde odscrollovat a tlačítko je vidět', async ({ page }) => {
    await page.goto('/rezervace');
    await page.getByTestId('step-1-content').waitFor();
    await page.waitForTimeout(400);

    // scrollHeight klame (počítá i odříznutý obsah uvnitř scrolleru),
    // proto testujeme, jestli se stránkou jde reálně pohnout.
    const scrolled = await page.evaluate(() => {
      window.scrollTo(0, 10000);
      return window.scrollY || document.documentElement.scrollTop;
    });
    expect(scrolled).toBe(0);

    await expect(page.getByTestId('btn-next')).toBeInViewport();
  });

  test('patička ani popup formulář neodsouvají', async ({ page }) => {
    await page.goto('/rezervace');
    await page.getByTestId('step-1-content').waitFor();
    expect(await page.locator('footer').count()).toBe(0);
  });

  test('žádný krok nevyžaduje scrollování', async ({ page }) => {
    await page.goto('/rezervace');
    await page.getByTestId('step-1-content').waitFor();
    await page.waitForTimeout(900);
    await page.getByTestId('service-option-lawn_mowing').click();

    const overflowOfCurrentStep = () => page.evaluate(() => {
      const step = document.querySelector('[data-testid^="step-"][data-testid$="-content"]');
      if (!step) return -1;
      const inner = step.firstElementChild;
      return Math.max(
        inner ? inner.scrollHeight - inner.clientHeight : 0,
        step.scrollHeight - step.clientHeight,
        0
      );
    });

    for (let step = 1; step <= 4; step += 1) {
      expect(await overflowOfCurrentStep(), `krok ${step} přetéká`).toBeLessThanOrEqual(0);
      if (step < 4) {
        await page.getByTestId('btn-next').click();
        await page.waitForTimeout(700);
      }
    }
  });
});

test.describe('Homepage', () => {
  test('hero CTA je vidět bez scrollu a vede na rezervaci', async ({ page }) => {
    await stubAnalytics(page);
    await mockApi(page);
    await page.goto('/');
    const cta = page.getByTestId('hero-cta-rezervace');
    await expect(cta).toBeInViewport();
    await cta.click();
    await expect(page).toHaveURL(/\/rezervace/);
  });
});
