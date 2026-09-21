import {
  track, trackFormStart, trackLead, resetFormTracking,
} from './analytics';

describe('analytics.track', () => {
  beforeEach(() => {
    delete window.gtag;
    resetFormTracking();
  });

  test('bez gtag nespadne a tiše nic neudělá', () => {
    expect(() => track('form_start', { form_id: 'rezervace' })).not.toThrow();
  });

  test('když gtag selže, chybu spolkne', () => {
    window.gtag = () => { throw new Error('adblock'); };
    expect(() => track('form_step', { step_number: 2 })).not.toThrow();
  });

  test('předá event i parametry do gtag', () => {
    const calls = [];
    window.gtag = (...args) => calls.push(args);
    track('form_step', { form_id: 'rezervace', step_number: 2, step_name: 'Do kdy' });
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe('event');
    expect(calls[0][1]).toBe('form_step');
    expect(calls[0][2]).toMatchObject({ step_number: 2, step_name: 'Do kdy' });
  });

  test('osobní údaje se do GA nikdy nedostanou', () => {
    const calls = [];
    window.gtag = (...args) => calls.push(args);
    track('generate_lead', {
      form_id: 'rezervace',
      service_type: 'lawn_mowing',
      customer_name: 'Jan Novák',
      customer_phone: '730588372',
      customer_email: 'jan@email.cz',
      property_address: 'Dvůr Králové',
      notes: 'za domem',
    });
    const params = calls[0][2];
    expect(params).toEqual({ form_id: 'rezervace', service_type: 'lawn_mowing' });
    const blob = JSON.stringify(params);
    ['Jan', '730588372', 'jan@email.cz', 'Dvůr', 'za domem'].forEach((pii) => {
      expect(blob).not.toContain(pii);
    });
  });

  test('prázdné hodnoty se neposílají', () => {
    const calls = [];
    window.gtag = (...args) => calls.push(args);
    track('click_phone', { link_location: 'sticky', prazdne: '', nic: null });
    expect(calls[0][2]).toEqual({ link_location: 'sticky' });
  });
});

describe('form_start', () => {
  beforeEach(() => { resetFormTracking(); });

  test('odešle se jen jednou, i při opakovaném volání', () => {
    const calls = [];
    window.gtag = (...args) => calls.push(args);
    trackFormStart();
    trackFormStart();
    trackFormStart();
    expect(calls.filter((c) => c[1] === 'form_start')).toHaveLength(1);
  });

  test('po resetu (nová poptávka) se pošle znovu', () => {
    const calls = [];
    window.gtag = (...args) => calls.push(args);
    trackFormStart();
    resetFormTracking();
    trackFormStart();
    expect(calls.filter((c) => c[1] === 'form_start')).toHaveLength(2);
  });
});

describe('generate_lead', () => {
  test('nese typ služby a kanál, nic osobního', () => {
    const calls = [];
    window.gtag = (...args) => calls.push(args);
    trackLead({ serviceType: 'overgrown', preferredChannel: 'whatsapp' });
    expect(calls[0][2]).toEqual({
      form_id: 'rezervace', service_type: 'overgrown', preferred_channel: 'whatsapp',
    });
  });

  test('chybějící údaje nahradí zástupnou hodnotou', () => {
    const calls = [];
    window.gtag = (...args) => calls.push(args);
    trackLead({});
    expect(calls[0][2].service_type).toBe('neuvedeno');
  });
});
