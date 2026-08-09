import { Component } from 'react';

// Zachytí runtime chyby i selhání načtení JS/CSS částí (typicky stará cache po
// novém nasazení). Místo prázdné bílé stránky buď jednou automaticky obnoví
// (aby stáhl aktuální soubory), nebo ukáže srozumitelnou hlášku s tlačítky.
const CHUNK_ERROR = /ChunkLoadError|Loading chunk|Loading CSS chunk|dynamically imported module|Importing a module script failed|Failed to fetch dynamically imported/i;

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    const msg = String(error?.message || error || '');
    // Stará cache odkazuje na neexistující soubory → jednou obnovit pro čerstvé assety.
    if (CHUNK_ERROR.test(msg)) {
      try {
        if (!sessionStorage.getItem('sk_chunk_reloaded')) {
          sessionStorage.setItem('sk_chunk_reloaded', '1');
          window.location.reload();
          return;
        }
      } catch { /* sessionStorage může být blokované */ }
    }
    // eslint-disable-next-line no-console
    console.error('App error boundary:', error, info);
  }

  handleReload = () => {
    try { sessionStorage.removeItem('sk_chunk_reloaded'); } catch { /* noop */ }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: '24px',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: '#F0FDF4',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 16,
        }}>🌿</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1B4332', margin: '0 0 8px' }}>
          Stránku se nepodařilo načíst
        </h1>
        <p style={{ color: '#4b5563', margin: '0 0 22px', maxWidth: 440, lineHeight: 1.6 }}>
          Zkuste stránku obnovit. Pokud problém přetrvává, klidně nám rovnou zavolejte – rádi pomůžeme.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={this.handleReload} style={{
            background: '#3FA34D', color: '#fff', border: 'none', borderRadius: 999,
            padding: '12px 26px', fontWeight: 600, fontSize: 15, cursor: 'pointer',
          }}>Obnovit stránku</button>
          <a href="tel:+420730588372" style={{
            border: '2px solid #3FA34D', color: '#1B4332', borderRadius: 999,
            padding: '10px 26px', fontWeight: 600, fontSize: 15, textDecoration: 'none',
          }}>Zavolat 730 588 372</a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
