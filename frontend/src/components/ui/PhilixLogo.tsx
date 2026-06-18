interface Props {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  onDark?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm:  { full: { h: 36,  iconW: 32,  iconH: 32  }, icon: { w: 32,  h: 32  } },
  md:  { full: { h: 44,  iconW: 40,  iconH: 40  }, icon: { w: 40,  h: 40  } },
  lg:  { full: { h: 56,  iconW: 50,  iconH: 50  }, icon: { w: 56,  h: 56  } },
  xl:  { full: { h: 64,  iconW: 60,  iconH: 60  }, icon: { w: 72,  h: 72  } },
};

function SwooshIcon({ w, h, id }: { w: number; h: number; id: string }) {
  return (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`gold-${id}`} cx="60%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFD166" />
          <stop offset="100%" stopColor="#E8940A" />
        </radialGradient>
        <radialGradient id={`silver-${id}`} cx="40%" cy="65%" r="65%">
          <stop offset="0%" stopColor="#C8C8C8" />
          <stop offset="100%" stopColor="#7A7A7A" />
        </radialGradient>
      </defs>

      {/* Golden swoosh — upper right, arcs outward */}
      <path
        d="M33 5 C48 5 60 17 60 32 C60 42 55 50 47 54
           C43 56 39 56 36 54 C32 52 30 48 31 43
           C32 38 36 33 38 27 C40 20 39 11 33 5 Z"
        fill={`url(#gold-${id})`}
      />

      {/* Silver swoosh — lower left, arcs outward */}
      <path
        d="M31 59 C16 59 4 47 4 32 C4 22 9 14 17 10
           C21 8 25 8 28 10 C32 12 34 16 33 21
           C32 26 28 31 26 37 C24 44 25 53 31 59 Z"
        fill={`url(#silver-${id})`}
      />
    </svg>
  );
}

export default function PhilixLogo({ variant = "full", size = "md", onDark = false, className = "" }: Props) {
  const s = SIZE_MAP[size];

  if (variant === "icon") {
    const { w, h } = s.icon;
    return (
      <span className={className} style={{ display: "inline-flex" }}>
        <SwooshIcon w={w} h={h} id={`icon-${size}`} />
      </span>
    );
  }

  // Full lockup: swoosh icon + wordmark
  const { h, iconW, iconH } = s.full;
  const gap = 10;
  const textAreaW = 110;
  const totalW = iconW + gap + textAreaW;
  const philixSize = h * 0.44;
  const financeSize = h * 0.26;
  const textX = iconW + gap;
  const philixY = h * 0.5;
  const financeY = h * 0.84;
  const wordmarkColor = onDark ? "#FFFFFF" : "#0F172A";
  const subColor = onDark ? "rgba(255,255,255,0.55)" : "#64748B";

  return (
    <svg
      width={totalW}
      height={h}
      viewBox={`0 0 ${totalW} ${h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id={`gold-full-${size}`} cx="60%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFD166" />
          <stop offset="100%" stopColor="#E8940A" />
        </radialGradient>
        <radialGradient id={`silver-full-${size}`} cx="40%" cy="65%" r="65%">
          <stop offset="0%" stopColor="#C8C8C8" />
          <stop offset="100%" stopColor="#7A7A7A" />
        </radialGradient>
      </defs>

      {/* Golden swoosh */}
      <g transform={`scale(${iconW / 64} ${iconH / 64})`}>
        <path
          d="M33 5 C48 5 60 17 60 32 C60 42 55 50 47 54
             C43 56 39 56 36 54 C32 52 30 48 31 43
             C32 38 36 33 38 27 C40 20 39 11 33 5 Z"
          fill={`url(#gold-full-${size})`}
        />
        <path
          d="M31 59 C16 59 4 47 4 32 C4 22 9 14 17 10
             C21 8 25 8 28 10 C32 12 34 16 33 21
             C32 26 28 31 26 37 C24 44 25 53 31 59 Z"
          fill={`url(#silver-full-${size})`}
        />
      </g>

      {/* PHILIX wordmark */}
      <text
        x={textX}
        y={philixY}
        fontFamily="'Inter', 'Segoe UI', system-ui, sans-serif"
        fontWeight="800"
        fontSize={philixSize}
        fill={wordmarkColor}
        letterSpacing="-0.5"
        dominantBaseline="middle"
      >
        PHILIX
      </text>

      {/* FINANCE sub-text */}
      <text
        x={textX}
        y={financeY}
        fontFamily="'Inter', 'Segoe UI', system-ui, sans-serif"
        fontWeight="500"
        fontSize={financeSize}
        fill={subColor}
        letterSpacing="2.5"
      >
        FINANCE
      </text>
    </svg>
  );
}
