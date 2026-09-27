import { useId } from 'react';

const materials = {
  steel: { base: '#c9ccd2', dark: '#8f939c', light: '#eef0f3', ring: '#aeb2ba' },
  gold: { base: '#d4af37', dark: '#9c7a14', light: '#f0d98c', ring: '#c9a227' },
  rosegold: { base: '#c98d6b', dark: '#9c6142', light: '#e8bda2', ring: '#b87f5c' },
  black: { base: '#3a3b40', dark: '#17181c', light: '#565860', ring: '#2b2b2e' },
  titanium: { base: '#9fa3ab', dark: '#6e727a', light: '#c3c7cd', ring: '#8a8f98' },
};

const ROMAN = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + amt)));
  return `#${((f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).padStart(6, '0')}`;
}
const isLight = (c) => {
  const n = parseInt(c.slice(1), 16);
  return ((n >> 16) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) / 255 > 0.6;
};

function CasePath({ shape, cx, cy, r, fill, stroke, sw = 1 }) {
  if (shape === 'octagon') {
    const pts = [];
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i + Math.PI / 8;
      pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
    }
    return <polygon points={pts.join(' ')} fill={fill} stroke={stroke} strokeWidth={sw} />;
  }
  if (shape === 'tonneau') {
    const rx = r * 0.92;
    const ry = r * 1.12;
    const d = `M ${cx - rx * 0.6} ${cy - ry} Q ${cx} ${cy - ry * 1.18} ${cx + rx * 0.6} ${cy - ry}
      Q ${cx + rx * 1.15} ${cy - ry * 0.55} ${cx + rx * 1.05} ${cy}
      Q ${cx + rx * 1.15} ${cy + ry * 0.55} ${cx + rx * 0.6} ${cy + ry}
      Q ${cx} ${cy + ry * 1.18} ${cx - rx * 0.6} ${cy + ry}
      Q ${cx - rx * 1.15} ${cy + ry * 0.55} ${cx - rx * 1.05} ${cy}
      Q ${cx - rx * 1.15} ${cy - ry * 0.55} ${cx - rx * 0.6} ${cy - ry} Z`;
    return <path d={d} fill={fill} stroke={stroke} strokeWidth={sw} />;
  }
  if (shape === 'cushion') {
    const s = r * 1.02;
    const d = `M ${cx - s} ${cy - s * 0.25} Q ${cx - s * 1.06} ${cy - s * 0.85} ${cx - s * 0.3} ${cy - s}
      Q ${cx} ${cy - s * 1.06} ${cx + s * 0.3} ${cy - s}
      Q ${cx + s * 1.06} ${cy - s * 0.85} ${cx + s} ${cy - s * 0.25}
      Q ${cx + s * 1.06} ${cy} ${cx + s} ${cy + s * 0.25}
      Q ${cx + s * 1.06} ${cy + s * 0.85} ${cx + s * 0.3} ${cy + s}
      Q ${cx} ${cy + s * 1.06} ${cx - s * 0.3} ${cy + s}
      Q ${cx - s * 1.06} ${cy + s * 0.85} ${cx - s} ${cy + s * 0.25}
      Q ${cx - s * 1.06} ${cy} ${cx - s} ${cy - s * 0.25} Z`;
    return <path d={d} fill={fill} stroke={stroke} strokeWidth={sw} />;
  }
  return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={sw} />;
}

function CaseRect({ shape, cx, cy, r }) {
  const pad =
    shape === 'octagon'
      ? r * 0.72
      : shape === 'tonneau'
        ? r * 0.78
        : shape === 'cushion'
          ? r * 0.74
          : r * 0.72;
  return { x0: cx - pad, x1: cx + pad, top: cy - r, bot: cy + r, pad };
}

// --- straps -------------------------------------------------------------

function Bracelet({ cx, cy, R, mat }) {
  const links = [];
  const gap = 2;
  const n = 6;
  const seg = 34;
  for (let dir = -1; dir <= 1; dir += 2) {
    for (let i = 0; i < n; i++) {
      const y = cy + dir * (R - 2 + i * (seg + gap));
      const w = 108 - i * 6;
      const yTop = dir < 0 ? y - seg : y;
      links.push(
        <g key={`${dir}${i}`}>
          <rect
            x={cx - w / 2}
            y={yTop}
            width={w}
            height={seg}
            rx="2"
            fill={i % 2 ? mat.base : shade(mat.base, -14)}
            stroke={mat.dark}
            strokeWidth="0.5"
          />
          <rect
            x={cx - w * 0.18}
            y={yTop}
            width={w * 0.36}
            height={seg}
            fill={mat.light}
            opacity="0.55"
          />
          <line
            x1={cx - w / 2}
            y1={yTop}
            x2={cx + w / 2}
            y2={yTop}
            stroke={mat.light}
            strokeWidth="1"
            opacity="0.8"
          />
        </g>
      );
    }
  }
  return <g>{links}</g>;
}

function Leather({ cx, cy, R, color, uid }) {
  const dark = shade(color, -30);
  const light = shade(color, 22);
  const wTop = 96;
  const wEnd = 72;
  const len = 218;
  const side = (dir) => {
    const y0 = cy + dir * (R - 4);
    const y1 = cy + dir * (R + len);
    const d = `M ${cx - wTop / 2} ${y0}
      Q ${cx - (wTop / 2 + 3)} ${cy + dir * (R + len / 2)} ${cx - wEnd / 2} ${y1}
      L ${cx + wEnd / 2} ${y1}
      Q ${cx + (wTop / 2 + 3)} ${cy + dir * (R + len / 2)} ${cx + wTop / 2} ${y0} Z`;
    const stitch = `M ${cx - (wTop / 2 - 5)} ${y0 + dir * 8}
      Q ${cx - (wTop / 2 + 1)} ${cy + dir * (R + len / 2)} ${cx - (wEnd / 2 - 5)} ${y1 - dir * 10}
      M ${cx + (wTop / 2 - 5)} ${y0 + dir * 8}
      Q ${cx + (wTop / 2 + 1)} ${cy + dir * (R + len / 2)} ${cx + (wEnd / 2 - 5)} ${y1 - dir * 10}`;
    return (
      <g key={dir}>
        <path d={d} fill={`url(#lg${uid})`} stroke={dark} strokeWidth="0.8" />
        <path
          d={stitch}
          fill="none"
          stroke={light}
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.9"
        />
        {dir < 0 && (
          <rect
            x={cx - wTop / 2 + 2}
            y={y0 - 26}
            width={wTop - 4}
            height={12}
            rx="3"
            fill={color}
            stroke={dark}
            strokeWidth="0.7"
          />
        )}
      </g>
    );
  };
  return (
    <g>
      <linearGradient id={`lg${uid}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={dark} />
        <stop offset="30%" stopColor={light} />
        <stop offset="55%" stopColor={color} />
        <stop offset="80%" stopColor={light} />
        <stop offset="100%" stopColor={dark} />
      </linearGradient>
      {[-1, 1].map(side)}
      {/* grain speckle */}
      {[...Array(26)].map((_, i) => {
        const t = (i * 37) % 97;
        const yy = cy - R - 200 + (t / 97) * 2 * (R + 190);
        const xx = cx - 30 + (((i * 53) % 61) - 0);
        return <circle key={i} cx={xx} cy={yy} r="0.8" fill={dark} opacity="0.25" />;
      })}
    </g>
  );
}

function Rubber({ cx, cy, R, color, uid }) {
  const wTop = 92;
  const wEnd = 66;
  const len = 218;
  const rib = shade(color, 26);
  const pieces = [-1, 1].map((dir) => {
    const y0 = cy + dir * (R - 4);
    const y1 = cy + dir * (R + len);
    const d = `M ${cx - wTop / 2} ${y0} L ${cx - wEnd / 2} ${y1}
      L ${cx + wEnd / 2} ${y1} L ${cx + wTop / 2} ${y0} Z`;
    const ribs = [];
    const cnt = Math.floor(len / 8);
    for (let i = 1; i < cnt; i++) {
      const t = i / cnt;
      const yy = y0 + dir * t * len;
      const w = wTop + (wEnd - wTop) * t;
      ribs.push(
        <line
          key={i}
          x1={cx - w / 2 + 2}
          y1={yy}
          x2={cx + w / 2 - 2}
          y2={yy}
          stroke={rib}
          strokeWidth="1"
          opacity="0.35"
        />
      );
    }
    return (
      <g key={dir}>
        <path d={d} fill={`url(#rg${uid})`} stroke={shade(color, -18)} strokeWidth="0.8" />
        {ribs}
      </g>
    );
  });
  return (
    <g>
      <linearGradient id={`rg${uid}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={shade(color, -18)} />
        <stop offset="50%" stopColor={shade(color, 12)} />
        <stop offset="100%" stopColor={shade(color, -18)} />
      </linearGradient>
      {pieces}
    </g>
  );
}

function Indices({ type, cx, cy, r, color, bezel }) {
  const lume = bezel === 'dive';
  const items = [];
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI / 6) * i - Math.PI / 2;
    const x1 = cx + (r - 11) * Math.cos(a);
    const y1 = cy + (r - 11) * Math.sin(a);
    if (type === 'roman') {
      const x = cx + (r - 17) * Math.cos(a);
      const y = cy + (r - 17) * Math.sin(a);
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
      const x = cx + (r - 17) * Math.cos(a);
      const y = cy + (r - 17) * Math.sin(a);
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
          <g key={i}>
            <rect
              x={x1 - 3.5}
              y={y1 - 6}
              width="7"
              height="12"
              rx="2"
              fill={shade('#000000', 0)}
              opacity="0.35"
              transform={`rotate(${i * 30} ${x1} ${y1})`}
            />
            <rect
              x={x1 - 3}
              y={y1 - 5.5}
              width="6"
              height="11"
              rx="2"
              fill={color}
              transform={`rotate(${i * 30} ${x1} ${y1})`}
            />
          </g>
        );
      } else {
        items.push(
          <g key={i}>
            <circle cx={x1 + 0.6} cy={y1 + 0.6} r="4.4" fill="#000" opacity="0.35" />
            <circle cx={x1} cy={y1} r="4.2" fill={lume ? '#e9f0e4' : color} />
          </g>
        );
      }
    } else {
      const big = i % 3 === 0;
      items.push(
        <g key={i}>
          <rect
            x={x1 - (big ? 3.4 : 2.3)}
            y={y1 - (big ? 8.4 : 6.4)}
            width={big ? 6.8 : 4.6}
            height={big ? 14.8 : 10.8}
            rx="1"
            fill="#000"
            opacity="0.4"
            transform={`rotate(${i * 30} ${x1} ${y1})`}
          />
          <rect
            x={x1 - (big ? 3 : 2)}
            y={y1 - (big ? 8 : 6)}
            width={big ? 6 : 4}
            height={big ? 14 : 10}
            rx="1"
            fill={color}
            transform={`rotate(${i * 30} ${x1} ${y1})`}
          />
        </g>
      );
    }
  }
  return <g>{items}</g>;
}

// --- main ---------------------------------------------------------------

export default function WatchArt({
  art = {},
  view = 'front',
  engraving = 'AVELOR',
  className = '',
  label = 'Watch illustration',
}) {
  const uid = useId().replace(/:/g, '');
  const mat = materials[art.material] || materials.steel;
  const cx = 150;
  const cy = 208;
  const R = 92;
  const dialR = 66;
  const dialColor = art.dial || '#101418';
  const light = isLight(dialColor);
  const handColor = light ? '#1a1a1c' : '#f0ede6';
  const indexColor = handColor;
  const bezel = art.bezel || 'smooth';
  const strapType = art.strap || 'bracelet';
  const strapColor =
    art.strapColor ||
    (strapType === 'leather' ? '#4a2f22' : strapType === 'rubber' ? '#17181c' : mat.base);
  const rect = CaseRect({ shape: art.shape, cx, cy, r: R });
  const isSporty = bezel === 'dive' || bezel === 'tachymeter' || art.chrono;

  const bezelDecor = [];
  if (bezel === 'dive' || bezel === 'tachymeter') {
    const insert = bezel === 'dive' ? '#14181c' : '#232628';
    bezelDecor.push(
      <CasePath
        key="insert"
        shape={art.shape}
        cx={cx}
        cy={cy}
        r={R - 2}
        fill="none"
        stroke={insert}
        sw={11}
      />
    );
  }
  if (bezel === 'fluted') {
    for (let i = 0; i < 60; i++) {
      const a = (Math.PI / 30) * i;
      bezelDecor.push(
        <line
          key={i}
          x1={cx + (R - 2) * Math.cos(a)}
          y1={cy + (R - 2) * Math.sin(a)}
          x2={cx + (R - 11) * Math.cos(a)}
          y2={cy + (R - 11) * Math.sin(a)}
          stroke={i % 2 ? mat.dark : mat.light}
          strokeWidth="1.6"
        />
      );
    }
  } else if (bezel === 'dive' || bezel === 'tachymeter') {
    const n = bezel === 'dive' ? 60 : 48;
    const tc = bezel === 'dive' ? '#e8e6e0' : '#c9ccd2';
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
          stroke={tc}
          strokeWidth={major ? 1.8 : 0.9}
        />
      );
    }
    if (bezel === 'dive')
      bezelDecor.push(<circle key="pip" cx={cx} cy={cy - (R - 8)} r="4" fill="#e8e6e0" />);
    if (bezel === 'tachymeter')
      bezelDecor.push(
        <text
          key="t"
          x={cx}
          y={cy - R + 16}
          textAnchor="middle"
          fontSize="7"
          fontFamily="Inter, sans-serif"
          fill={tc}
          letterSpacing="2"
        >
          TACHYMETRE
        </text>
      );
  }

  const subdials = [210, 330, 90].map((deg, k) => {
    const a = (deg * Math.PI) / 180 - Math.PI / 2;
    const x = cx + 34 * Math.cos(a);
    const y = cy + 34 * Math.sin(a);
    return (
      <g key={k}>
        <circle
          cx={x}
          cy={y}
          r="15"
          fill={light ? shade(dialColor, -12) : shade(dialColor, 10)}
          stroke={handColor}
          strokeOpacity="0.35"
        />
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

  const lugs = [-1, 1].map((dir) => (
    <g key={dir}>
      {[rect.x0 + 8, rect.x1 - 26].map((x, i) => (
        <path
          key={i}
          d={`M ${x} ${cy + dir * (R - 14)}
             L ${x - 5} ${cy + dir * (R + 26)}
             L ${x + 22} ${cy + dir * (R + 26)}
             L ${x + 17} ${cy + dir * (R - 14)} Z`}
          fill={mat.base}
          stroke={mat.dark}
          strokeWidth="0.8"
        />
      ))}
      {/* spring bar hint */}
      <line
        x1={rect.x0 + 6}
        y1={cy + dir * (R + 24)}
        x2={rect.x1 - 6}
        y2={cy + dir * (R + 24)}
        stroke={mat.light}
        strokeWidth="1.2"
        opacity="0.7"
      />
    </g>
  ));

  const watch = (
    <g>
      {/* strap under case */}
      {strapType === 'bracelet' && <Bracelet cx={cx} cy={cy} R={R + 20} mat={mat} />}
      {strapType === 'leather' && (
        <Leather cx={cx} cy={cy} R={R + 20} color={strapColor} uid={uid} />
      )}
      {strapType === 'rubber' && <Rubber cx={cx} cy={cy} R={R + 20} color={strapColor} uid={uid} />}
      {lugs}
      {/* crown + guards */}
      {isSporty && (
        <path
          d={`M ${cx + R - 8} ${cy - 16} L ${cx + R + 14} ${cy - 9} L ${cx + R + 14} ${cy + 9} L ${cx + R - 8} ${cy + 16} Z`}
          fill={mat.base}
          stroke={mat.dark}
          strokeWidth="0.7"
        />
      )}
      <rect
        x={cx + R + (isSporty ? 10 : -2)}
        y={cy - 8}
        width="15"
        height="16"
        rx="4"
        fill={mat.ring}
        stroke={mat.dark}
        strokeWidth="0.7"
      />
      {[-4, 0, 4].map((o) => (
        <line
          key={o}
          x1={cx + R + (isSporty ? 10 : -2) + 7.5 + o}
          y1={cy - 7}
          x2={cx + R + (isSporty ? 10 : -2) + 7.5 + o}
          y2={cy + 7}
          stroke={mat.dark}
          strokeWidth="0.9"
        />
      ))}
      {/* case body */}
      <CasePath shape={art.shape} cx={cx} cy={cy} r={R} fill={`url(#c${uid})`} stroke={mat.dark} />
      {/* polished bevel ring */}
      <CasePath
        shape={art.shape}
        cx={cx}
        cy={cy}
        r={R - 7}
        fill="none"
        stroke={mat.light}
        sw={1.6}
      />
      {/* dial */}
      <CasePath
        shape={art.shape}
        cx={cx}
        cy={cy}
        r={R - 14}
        fill={`url(#dl${uid})`}
        stroke={mat.ring}
      />
      {!caseback && (
        <g>
          {/* chapter ring / minute track */}
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (Math.PI / 30) * i;
            const major = i % 5 === 0;
            return (
              <line
                key={i}
                x1={cx + (dialR - 2) * Math.cos(a)}
                y1={cy + (dialR - 2) * Math.sin(a)}
                x2={cx + (dialR - (major ? 7 : 4.5)) * Math.cos(a)}
                y2={cy + (dialR - (major ? 7 : 4.5)) * Math.sin(a)}
                stroke={indexColor}
                strokeWidth={major ? 1.3 : 0.7}
                opacity={major ? 0.9 : 0.55}
              />
            );
          })}
          {bezelDecor}
          {art.chrono && subdials}
          <Indices
            type={art.indices || 'baton'}
            cx={cx}
            cy={cy}
            r={dialR}
            color={indexColor}
            bezel={bezel}
          />
          {/* neutral brand lines under 12 */}
          <line
            x1={cx - 14}
            y1={cy - 38}
            x2={cx + 14}
            y2={cy - 38}
            stroke={indexColor}
            strokeWidth="2"
            opacity="0.8"
          />
          <line
            x1={cx - 9}
            y1={cy - 33}
            x2={cx + 9}
            y2={cy - 33}
            stroke={indexColor}
            strokeWidth="1.2"
            opacity="0.55"
          />
          {art.date && (
            <g>
              <rect
                x={cx + 40}
                y={cy - 9}
                width="20"
                height="18"
                rx="2"
                fill={light ? '#f7f5f0' : '#e8e6e0'}
                stroke="#00000022"
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
          {/* hands at 10:08 — drop edge then body */}
          <g strokeLinecap="round">
            <line
              x1={cx + 1}
              y1={cy + 1}
              x2={cx - 33}
              y2={cy - 23}
              stroke="#000"
              strokeWidth="6.6"
              opacity="0.35"
            />
            <line x1={cx} y1={cy} x2={cx - 34} y2={cy - 24} stroke={handColor} strokeWidth="5.6" />
            <line
              x1={cx + 1}
              y1={cy + 1}
              x2={cx + 13}
              y2={cy - 51}
              stroke="#000"
              strokeWidth="4.6"
              opacity="0.35"
            />
            <line x1={cx} y1={cy} x2={cx + 12} y2={cy - 52} stroke={handColor} strokeWidth="3.8" />
            <line x1={cx} y1={cy} x2={cx + 4} y2={cy + 44} stroke="#c9a227" strokeWidth="1.6" />
            <circle cx={cx} cy={cy} r="5.4" fill="#000" opacity="0.3" />
            <circle cx={cx} cy={cy} r="4.6" fill={handColor} />
            <circle cx={cx} cy={cy} r="1.6" fill={dialColor} />
          </g>
          {/* glass reflection */}
          <ellipse
            cx={cx - 24}
            cy={cy - 36}
            rx="42"
            ry="17"
            fill="white"
            opacity="0.12"
            transform={`rotate(-35 ${cx - 24} ${cy - 36})`}
          />
        </g>
      )}
      {caseback && (
        <g>
          <CasePath shape={art.shape} cx={cx} cy={cy} r={R - 14} fill={mat.base} stroke="none" />
          {[48, 58, 68].map((r0, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r0}
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

  const viewBox = view === 'detail' ? '70 118 160 160' : '0 0 300 430';
  const transform = view === 'angle' ? 'rotate(-8 150 215) skewX(-6) translate(-12 0)' : undefined;

  return (
    <svg viewBox={viewBox} className={className} role="img" aria-label={label}>
      <defs>
        <radialGradient id={`b${uid}`} cx="50%" cy="42%" r="72%">
          <stop offset="0%" stopColor="#fbf9f5" />
          <stop offset="70%" stopColor="#ede8df" />
          <stop offset="100%" stopColor="#ded7ca" />
        </radialGradient>
        <linearGradient id={`c${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={mat.light} />
          <stop offset="55%" stopColor={mat.base} />
          <stop offset="100%" stopColor={mat.dark} />
        </linearGradient>
        <radialGradient id={`dl${uid}`} cx="38%" cy="32%" r="85%">
          <stop offset="0%" stopColor={light ? shade(dialColor, 18) : shade(dialColor, 26)} />
          <stop offset="100%" stopColor={dialColor} />
        </radialGradient>
        <filter id={`d${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      {view !== 'detail' && <rect width="300" height="430" fill={`url(#b${uid})`} />}
      {view !== 'detail' && (
        <ellipse
          cx={cx}
          cy={cy + R + 122}
          rx="88"
          ry="14"
          fill="#0b0b0c"
          opacity="0.16"
          filter={`url(#d${uid})`}
        />
      )}
      <g transform={transform}>{watch}</g>
    </svg>
  );
}
