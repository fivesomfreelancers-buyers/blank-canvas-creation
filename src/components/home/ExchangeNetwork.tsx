const LEFT_PATHS = [
  'M70 70 Q170 110 260 180',
  'M50 180 L260 180',
  'M70 290 Q170 250 260 180',
];

const RIGHT_PATHS = [
  'M260 180 Q350 110 450 70',
  'M260 180 L470 180',
  'M260 180 Q350 250 450 290',
];

const FREELANCERS = [
  { x: 70, y: 70, label: 'Freelancer' },
  { x: 50, y: 180, label: 'Freelancer' },
  { x: 70, y: 290, label: 'Freelancer' },
];

const BUYERS = [
  { x: 450, y: 70, label: 'Buyer' },
  { x: 470, y: 180, label: 'Buyer' },
  { x: 450, y: 290, label: 'Buyer' },
];

/**
 * Visual explanation of the two sides of the marketplace: blue dots are African
 * freelancers sending work, red dots are worldwide buyers sending payment.
 * Decorative only — the surrounding section carries the readable text.
 */
const ExchangeNetwork = () => (
  <div className="exchange-network">
    <svg viewBox="0 0 520 360" role="presentation" aria-hidden="true" className="w-full">
      <g className="xnet-links">
        {[...LEFT_PATHS, ...RIGHT_PATHS].map((d) => (
          <path key={d} d={d} fill="none" />
        ))}
      </g>

      {FREELANCERS.map((node, i) => (
        <g key={`f-${i}`} className="xnet-node xnet-node-talent">
          <circle cx={node.x} cy={node.y} r="9" />
          <circle cx={node.x} cy={node.y} r="18" className="xnet-halo" />
        </g>
      ))}

      {BUYERS.map((node, i) => (
        <g key={`b-${i}`} className="xnet-node xnet-node-buyer">
          <circle cx={node.x} cy={node.y} r="9" />
          <circle cx={node.x} cy={node.y} r="18" className="xnet-halo" />
        </g>
      ))}

      <g className="xnet-hub">
        <circle cx="260" cy="180" r="52" />
        <circle cx="260" cy="180" r="70" className="xnet-halo" />
        <text x="260" y="185" textAnchor="middle">FIVESOM</text>
      </g>

      {LEFT_PATHS.map((d, i) => (
        <circle
          key={`dt-${i}`}
          r="5"
          className="xnet-dot xnet-dot-talent"
          style={{ offsetPath: `path("${d}")`, animationDelay: `${i * 0.7}s` }}
        />
      ))}

      {RIGHT_PATHS.map((d, i) => (
        <circle
          key={`db-${i}`}
          r="5"
          className="xnet-dot xnet-dot-buyer"
          style={{ offsetPath: `path("${d}")`, animationDelay: `${i * 0.7 + 0.35}s`, animationDirection: 'reverse' }}
        />
      ))}
    </svg>

    <ul className="exchange-legend">
      <li><span className="exchange-swatch exchange-swatch-talent" aria-hidden /> Blue dots: African freelancers delivering work</li>
      <li><span className="exchange-swatch exchange-swatch-buyer" aria-hidden /> Red dots: worldwide buyers sending secure payment</li>
    </ul>
  </div>
);

export default ExchangeNetwork;
