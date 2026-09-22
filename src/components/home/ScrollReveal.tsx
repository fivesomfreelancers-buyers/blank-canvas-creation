import React, { CSSProperties, ElementType, ReactNode, useEffect, useRef, useState } from 'react';

type RevealFrom = 'up' | 'left' | 'right' | 'depth';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  from?: RevealFrom;
  as?: ElementType;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  from = 'up',
  as: Tag = 'div',
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.unobserve(node);
      },
      { rootMargin: '0px 0px -9% 0px', threshold: 0.12 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const style = { '--reveal-delay': `${delay}ms` } as CSSProperties;

  return (
    <Tag
      ref={ref}
      style={style}
      data-reveal={from}
      data-visible={visible ? 'true' : 'false'}
      className={`home-reveal ${className}`}
    >
      {children}
    </Tag>
  );
};

export default ScrollReveal;