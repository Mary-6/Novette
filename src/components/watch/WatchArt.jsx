import { useId } from 'react';

const materials = {
  steel: { base: '#c9ccd2', dark: '#8f939c', light: '#eef0f3', ring: '#aeb2ba' },
  gold: { base: '#d4af37', dark: '#9c7a14', light: '#f0d98c', ring: '#c9a227' },
  rosegold: { base: '#c98d6b', dark: '#9c6142', light: '#e8bda2', ring: '#b87f5c' },
  black: { base: '#3a3b40', dark: '#17181c', light: '#565860', ring: '#2b2b2e' },
  titanium: { base: '#9fa3ab', dark: '#6e727a', light: '#c3c7cd', ring: '#8a8f98' },
};

const strapPalettes = {
  bracelet: null, // uses case material
  leatherDefault: '#4a2f22',
  rubberDefault: '#17181c',
};

function strapColorFor(art, mat) {
  if (art.strap === 'bracelet') return { base: mat.base, dark: mat.dark, light: mat.light };
  const c =
    art.strapColor ||
    (art.strap === 'leather' ? strapPalettes.leatherDefault : strapPalettes.rubberDefault);
  return { base: c, dark: c, light: c };
}

const ROMAN = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

function CasePath({ shape, cx, cy, r, fill, stroke }) {
  if (shape === 'octagon') {
    const pts = [];
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i + Math.PI / 8;
      pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
    }
    return <polygon points={pts.join(' ')} fill={fill} stroke={stroke} strokeWidth="1" />;
  }
  if (shape === 'tonneau') {
    const rx = r * 0.92;
    const ry = r * 1.12;
    const d = `M ${cx - rx * 0.6} ${cy - ry}
      Q ${cx} ${cy - ry * 1.18} ${cx + rx * 0.6} ${cy - ry}
      Q ${cx + rx * 1.15} ${cy - ry * 0.55} ${cx + rx * 1.05} ${cy}
      Q ${cx + rx * 1.15} ${cy + ry * 0.55} ${cx + rx * 0.6} ${cy + ry}
      Q ${cx} ${cy + ry * 1.18} ${cx - rx * 0.6} ${cy + ry}
      Q ${cx - rx * 1.15} ${cy + ry * 0.55} ${cx - rx * 1.05} ${cy}
      Q ${cx - rx * 1.15} ${cy - ry * 0.55} ${cx - rx * 0.6} ${cy - ry} Z`;
    return <path d={d} fill={fill} stroke={stroke} strokeWidth="1" />;
  }
  if (shape === 'cushion') {
    const s = r * 1.02;
    const d = `M ${cx - s} ${cy - s * 0.25}
      Q ${cx - s * 1.06} ${cy - s * 0.85} ${cx - s * 0.3} ${cy - s}
      Q ${cx} ${cy - s * 1.06} ${cx + s * 0.3} ${cy - s}
      Q ${cx + s * 1.06} ${cy - s * 0.85} ${cx + s} ${cy - s * 0.25}
      Q ${cx + s * 1.06} ${cy} ${cx + s} ${cy + s * 0.25}
      Q ${cx + s * 1.06} ${cy + s * 0.85} ${cx + s * 0.3} ${cy + s}
      Q ${cx} ${cy + s * 1.06} ${cx - s * 0.3} ${cy + s}
      Q ${cx - s * 1.06} ${cy + s * 0.85} ${cx - s} ${cy + s * 0.25}
      Q ${cx - s * 1.06} ${cy} ${cx - s} ${cy - s * 0.25} Z`;
    return <path d={d} fill={fill} stroke={stroke} strokeWidth="1" />;
  }
  return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth="1" />;
}

function InnerPath({ shape, cx, cy, r, fill }) {
  return <CasePath shape={shape} cx={cx} cy={cy} r={r} fill={fill} stroke="none" />;
}

function Indices({ type, cx, cy, r, color }) {
  const items = [];
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI / 6) * i - Math.PI / 2;
    const x1 = cx + (r - 10) * Math.cos(a);
    const y1 = cy + (r - 10) * Math.sin(a);
    if (type === 'roman') {
      const x = cx + (r - 16) * Math.cos(a);
      const y = cy + (r - 16) * Math.sin(a);
      items.push(
        <text
          key={i}
          x={x}
          y={y + 4}
          textAnchor="middle"
          fontSize="11"
          fontFamily="Georgia, serif"
          fill={color}
        >
          {ROMAN[i]}
        </text>
      );
    } else if (type === 'arabic') {
      const x = cx + (r - 16) * Math.cos(a);
      const y = cy + (r - 16) * Math.sin(a);
      items.push(
        <text
          key={i}
          x={x}
          y={y + 5}
          textAnchor="middle"
          fontSize="13"
          fontFamily="Inter, sans-serif"
          fontWeight="500"
          fill={color}
        >
          {i === 0 ? '12' : i}
        </text>
      );
    } else if (type === 'dots') {
      if (i % 3 === 0) {
        items.push(
          <rect
            key={i}
            x={x1 - 3.5}
            y={y1 - 6}
            width="7"
            height="12"
            rx="2"
            fill={color}
            transform={`rotate(${i * 30} ${x1} ${y1})`}
          />
        );
      } else {
        items.push(<circle key={i} cx={x1} cy={y1} r="4.2" fill={color} />);
      }
    } else {
      items.push(
        <rect
          key={i}
          x={x1 - (i % 3 === 0 ? 3 : 2)}
          y={y1 - (i % 3 === 0 ? 8 : 6)}
          width={i % 3 === 0 ? 6 : 4}
          height={i % 3 === 0 ? 14 : 10}
          rx="1"
          fill={color}
          transform={`rotate(${i * 30} ${x1} ${y1})`}
        />
      );
    }
  }
  return <g>{items}</g>;
}

export default function WatchArt({
  art = {},
  view = 'front',
  engraving = 'STERLING MERIDIAN',
  className = '',
}) {
  const uid = useId().replace(/:/g, '');
  const mat = materials[art.material] || materials.steel;
  const strap = strapColorFor(art, mat);
  const cx = 150;
  const cy = 200;
  const R = 92;
  const dialR = 66;
  const isLight = (c) => {
    const n = parseInt(c.slice(1), 16);
    return ((n >> 16) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) / 255 > 0.6;
  };
  const dialColor = art.dial || '#101418';
  const handColor = isLight(dialColor) ? '#1a1a1c' : '#f0ede6';
  const indexColor = handColor;
  const bezel = art.bezel || 'smooth';

  const bezelDecor = [];
  if (bezel === 'fluted') {
    for (let i = 0; i < 60; i++) {
      const a = (Math.PI / 30) * i;
      bezelDecor.push(
        <line
          key={i}
          x1={cx + (R - 3) * Math.cos(a)}
          y1={cy + (R - 3) * Math.sin(a)}
          x2={cx + (R - 10) * Math.cos(a)}
          y2={cy + (R - 10) * Math.sin(a)}
          stroke={mat.dark}
          strokeWidth="1.4"
        />
      );
    }
  } else if (bezel === 'dive' || bezel === 'tachymeter') {
    const n = bezel === 'dive' ? 60 : 48;
    for (let i = 0; i < n; i++) {
      const a = (2 * Math.PI * i) / n;
      const major = i % 5 === 0;
      bezelDecor.push(
        <line
          key={i}
          x1={cx + (R - 4) * Math.cos(a)}
          y1={cy + (R - 4) * Math.sin(a)}
          x2={cx + (R - (major ? 13 : 8)) * Math.cos(a)}
          y2={cy + (R - (major ? 13 : 8)) * Math.sin(a)}
          stroke={bezel === 'dive' ? '#e8e6e0' : '#c9ccd2'}
          strokeWidth={major ? 2 : 1}
        />
      );
    }
    if (bezel === 'dive') {
      bezelDecor.push(<circle key="pip" cx={cx} cy={cy - (R - 8)} r="4" fill="#e8e6e0" />);
    }
  }

  const subdials = [210, 330, 90].map((deg, k) => {
    const a = (deg * Math.PI) / 180 - Math.PI / 2;
    const x = cx + 34 * Math.cos(a);
    const y = cy + 34 * Math.sin(a);
    return (
      <g key={k}>
        <circle cx={x} cy={y} r="15" fill={dialColor} stroke={handColor} strokeOpacity="0.35" />
        {[0, 1, 2, 3].map((t) => {
          const ta = (Math.PI / 2) * t;
          return (
            <line
              key={t}
              x1={x + 11 * Math.cos(ta)}
              y1={y + 11 * Math.sin(ta)}
              x2={x + 14 * Math.cos(ta)}
              y2={y + 14 * Math.sin(ta)}
              stroke={handColor}
              strokeOpacity="0.6"
            />
          );
        })}
        <line x1={x} y1={y} x2={x + 8} y2={y - 4} stroke={handColor} strokeWidth="1.4" />
      </g>
    );
  });

  const caseback = view === 'caseback';
  const front = !caseback;
  const watch = (
    <g>
      {/* strap */}
      <path
        d={`M ${cx - 52} ${cy - R + 2} L ${cx - 62} ${cy - R - 78} L ${cx + 62} ${cy - R - 78} L ${cx + 52} ${cy - R + 2} Z`}
        fill={`url(#s${uid})`}
      />
      <path
        d={`M ${cx - 52} ${cy + R - 2} L ${cx - 62} ${cy + R + 78} L ${cx + 62} ${cy + R + 78} L ${cx + 52} ${cy + R - 2} Z`}
        fill={`url(#s${uid})`}
      />
      {art.strap === 'bracelet' &&
        [-64, -38, 34, 60].map((off, i) => (
          <line
            key={i}
            x1={cx - 60}
            y1={cy + off + (off < 0 ? -R + 8 : R - 8)}
            x2={cx + 60}
            y2={cy + off + (off < 0 ? -R + 8 : R - 8)}
            stroke={strap.dark}
            strokeWidth="2"
            opacity="0.5"
          />
        ))}
      {/* crown */}
      <rect x={cx + R - 2} y={cy - 8} width="16" height="16" rx="3" fill={mat.ring} />
      {/* case */}
      <CasePath shape={art.shape} cx={cx} cy={cy} r={R} fill={`url(#c${uid})`} stroke={mat.dark} />
      <CasePath shape={art.shape} cx={cx} cy={cy} r={R - 14} fill={dialColor} stroke={mat.ring} />
      {front && (
        <g>
          {bezelDecor}
          {art.chrono && subdials}
          <Indices type={art.indices || 'baton'} cx={cx} cy={cy} r={dialR} color={indexColor} />
          {art.date && (
            <g>
              <rect
                x={cx + 40}
                y={cy - 9}
                width="20"
                height="18"
                rx="2"
                fill={isLight(dialColor) ? '#f7f5f0' : '#e8e6e0'}
              />
              <text
                x={cx + 50}
                y={cy + 5}
                textAnchor="middle"
                fontSize="13"
                fontFamily="Inter, sans-serif"
                fill="#1a1a1c"
              >
                28
              </text>
            </g>
          )}
          {/* hands at 10:08 */}
          <line
            x1={cx}
            y1={cy}
            x2={cx - 34}
            y2={cy - 24}
            stroke={handColor}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <line
            x1={cx}
            y1={cy}
            x2={cx + 12}
            y2={cy - 52}
            stroke={handColor}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1={cx}
            y1={cy}
            x2={cx + 4}
            y2={cy + 44}
            stroke="#c9a227"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r="5" fill={handColor} />
          {/* crystal glint */}
          <ellipse
            cx={cx - 26}
            cy={cy - 34}
            rx="40"
            ry="18"
            fill="white"
            opacity="0.08"
            transform={`rotate(-35 ${cx - 26} ${cy - 34})`}
          />
        </g>
      )}
      {caseback && (
        <g>
          <InnerPath shape={art.shape} cx={cx} cy={cy} r={R - 14} fill={mat.base} />
          {[150, 165, 180].map((r0, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r0 * 0.32}
              fill="none"
              stroke={mat.dark}
              strokeWidth="0.8"
              opacity="0.6"
            />
          ))}
          <path
            id={`t${uid}`}
            d={`M ${cx - 44} ${cy} A 44 44 0 1 1 ${cx + 44} ${cy} A 44 44 0 1 1 ${cx - 44} ${cy}`}
            fill="none"
          />
          <text fontSize="8.5" fontFamily="Georgia, serif" letterSpacing="3" fill={mat.dark}>
            <textPath href={`#t${uid}`}>
              {engraving} · {engraving}
            </textPath>
          </text>
          <text
            x={cx}
            y={cy + 4}
            textAnchor="middle"
            fontSize="12"
            fontFamily="Georgia, serif"
            fill={mat.dark}
          >
            EST. 1987
          </text>
        </g>
      )}
    </g>
  );

  const viewBox = view === 'detail' ? '70 120 160 160' : '0 0 300 420';
  const transform = view === 'angle' ? `rotate(-8 150 210) skewX(-6) translate(-12 0)` : undefined;

  return (
    <svg viewBox={viewBox} className={className} role="img" aria-label="Watch illustration">
      <defs>
        <radialGradient id={`b${uid}`} cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#f7f5f0" />
          <stop offset="100%" stopColor="#ede8df" />
        </radialGradient>
        <linearGradient id={`c${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={mat.light} />
          <stop offset="55%" stopColor={mat.base} />
          <stop offset="100%" stopColor={mat.dark} />
        </linearGradient>
        <linearGradient id={`s${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={strap.dark} />
          <stop offset="50%" stopColor={strap.light} />
          <stop offset="100%" stopColor={strap.dark} />
        </linearGradient>
        <filter id={`d${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#0b0b0c" floodOpacity="0.18" />
        </filter>
      </defs>
      {view !== 'detail' && <rect width="300" height="420" fill={`url(#b${uid})`} />}
      <g filter={`url(#d${uid})`} transform={transform}>
        {watch}
      </g>
    </svg>
  );
}
