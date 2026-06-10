import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-reveal animace – prvek se plynule objeví při najetí do viewportu.
 * Základ pro animovanější styl webu; respektuje prefers-reduced-motion.
 *
 * Použití:
 *   <Reveal>...</Reveal>
 *   <Reveal delay={120} variant="reveal-scale">...</Reveal>
 *   <Reveal as="section" className="py-12">...</Reveal>
 */
const Reveal = ({ children, delay = 0, variant = '', className = '', as: Tag = 'div', ...rest }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${variant} ${visible ? 'reveal-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
