import { useEffect, useRef, useState } from 'react';

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/**
 * Animované počítadlo – hodnota najede od 0 při scrollu do viewportu.
 * Umí hodnoty s předponou/příponou: "50+", "98%", "24h", "5★", "4.9".
 * Respektuje prefers-reduced-motion (zobrazí rovnou cílovou hodnotu).
 *
 * Použití: <CountUp value="98%" /> nebo <CountUp value={50} suffix="+" />
 */
const CountUp = ({ value, suffix = '', duration = 1600, className = '', ...rest }) => {
  const text = `${value}${suffix}`;
  const match = String(text).match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);
  const ref = useRef(null);
  const startedRef = useRef(false);
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const el = ref.current;
    if (!el || !match) return;

    const prefix = match[1];
    const target = parseFloat(match[2].replace(',', '.'));
    const rest = match[3];
    const decimals = (match[2].split(/[.,]/)[1] || '').length;
    const decimalSep = match[2].includes(',') ? ',' : '.';
    const format = (v) => {
      const s = decimals ? v.toFixed(decimals) : String(Math.round(v));
      return `${prefix}${decimalSep === ',' ? s.replace('.', ',') : s}${rest}`;
    };

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      setDisplay(text);
      return;
    }

    setDisplay(format(0));
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        observer.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          setDisplay(format(target * easeOutCubic(progress)));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, duration]);

  return (
    <span ref={ref} className={className} {...rest}>
      {display}
    </span>
  );
};

export default CountUp;
