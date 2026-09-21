import { isValidCzPhone, isValidEmail, serviceFromParam } from './validation';

describe('isValidCzPhone', () => {
  test.each([
    '730588372',
    '730 588 372',
    '+420730588372',
    '+420 730 588 372',
    '00420730588372',
    '603 289 190',
    '(730) 588-372',
  ])('přijme běžně psané číslo: %s', (v) => {
    expect(isValidCzPhone(v)).toBe(true);
  });

  test.each([
    ['', 'prázdné'],
    ['123', 'příliš krátké'],
    ['73058837', 'o číslici méně'],
    ['7305883721', 'o číslici víc'],
    ['230588372', 'pevná linka, ne mobil'],
    ['abcdefghi', 'písmena'],
    [null, 'null'],
    [undefined, 'undefined'],
  ])('odmítne %s (%s)', (v) => {
    expect(isValidCzPhone(v)).toBe(false);
  });
});

describe('isValidEmail', () => {
  test('prázdný e-mail je v pořádku – pole je nepovinné', () => {
    expect(isValidEmail('')).toBe(true);
    expect(isValidEmail('   ')).toBe(true);
    expect(isValidEmail(undefined)).toBe(true);
  });

  test('vyplněný e-mail musí dávat smysl', () => {
    expect(isValidEmail('jan@email.cz')).toBe(true);
    expect(isValidEmail('neplatny')).toBe(false);
    expect(isValidEmail('bez@tecky')).toBe(false);
    expect(isValidEmail('a b@email.cz')).toBe(false);
  });
});

describe('serviceFromParam (?sluzba=)', () => {
  test('mapuje kampaňové parametry na službu', () => {
    expect(serviceFromParam('listi')).toBe('overgrown');
    expect(serviceFromParam('sekani')).toBe('lawn_mowing');
    expect(serviceFromParam('pozemek')).toBe('land_clearing');
    expect(serviceFromParam('kaceni')).toBe('tree_shrub_care');
  });

  test('nezáleží na velikosti písmen', () => {
    expect(serviceFromParam('LISTI')).toBe('overgrown');
  });

  test('neznámý nebo chybějící parametr nic nepředvybere', () => {
    expect(serviceFromParam('neexistuje')).toBeNull();
    expect(serviceFromParam('')).toBeNull();
    expect(serviceFromParam(undefined)).toBeNull();
  });
});
