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

function EmblemIcon({ w, h, id }: { w: number; h: number; id: string }) {
  return (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`gold-${id}`} x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#F5C842" />
          <stop offset="50%" stopColor="#D4920A" />
          <stop offset="100%" stopColor="#B87408" />
        </linearGradient>
        <linearGradient id={`silver-${id}`} x1="90%" y1="90%" x2="10%" y2="10%">
          <stop offset="0%" stopColor="#D8D8D8" />
          <stop offset="50%" stopColor="#A8A8A8" />
          <stop offset="100%" stopColor="#707070" />
        </linearGradient>
      </defs>

      {/* Gold crescent — right / upper portion */}
      <path
        d="M32 3
           C49 3, 61 15, 61 32
           C61 49, 49 61, 32 61
           C36 52, 38 44, 37 36
           C36 28, 32 22, 32 14
           C32 9, 32 6, 32 3 Z"
        fill={`url(#gold-${id})`}
      />

      {/* Silver crescent — left / lower portion */}
      <path
        d="M32 61
           C15 61, 3 49, 3 32
           C3 15, 15 3, 32 3
           C28 12, 26 20, 27 28
           C28 36, 32 42, 32 50
           C32 55, 32 58, 32 61 Z"
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
        <EmblemIcon w={w} h={h} id={`icon-${size}`} />
      </span>
    );
  }

  // Full lockup: emblem icon + wordmark
  const { h, iconW, iconH } = s.full;
  const gap = 10;
  const textAreaW = 115;
  const totalW = iconW + gap + textAreaW;
  const philixSize = h * 0.44;
  const financeSize = h * 0.26;
  const textX = iconW + gap;
  const philixY = h * 0.48;
  const financeY = h * 0.82;
  const wordmarkColor = onDark ? "#FFFFFF" : "#0B1F3A";
  const subColor = onDark ? "rgba(255,255,255,0.6)" : "#C9A227";

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
        <linearGradient id={`gold-full-${size}`} x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#F5C842" />
          <stop offset="50%" stopColor="#D4920A" />
          <stop offset="100%" stopColor="#B87408" />
        </linearGradient>
        <linearGradient id={`silver-full-${size}`} x1="90%" y1="90%" x2="10%" y2="10%">
          <stop offset="0%" stopColor="#D8D8D8" />
          <stop offset="50%" stopColor="#A8A8A8" />
          <stop offset="100%" stopColor="#707070" />
        </linearGradient>
      </defs>

      {/* Emblem scaled to iconW × iconH */}
      <g transform={`scale(${iconW / 64} ${iconH / 64})`}>
        <path
          d="M32 3 C49 3, 61 15, 61 32 C61 49, 49 61, 32 61
             C36 52, 38 44, 37 36 C36 28, 32 22, 32 14
             C32 9, 32 6, 32 3 Z"
          fill={`url(#gold-full-${size})`}
        />
        <path
          d="M32 61 C15 61, 3 49, 3 32 C3 15, 15 3, 32 3
             C28 12, 26 20, 27 28 C28 36, 32 42, 32 50
             C32 55, 32 58, 32 61 Z"
          fill={`url(#silver-full-${size})`}
        />
      </g>

      {/* PHILIX wordmark */}
      <text
        x={textX}
        y={philixY}
        fontFamily="'Clash Grotesk', 'Inter', 'Segoe UI', system-ui, sans-serif"
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
        fontFamily="'Clash Grotesk', 'Inter', 'Segoe UI', system-ui, sans-serif"
        fontWeight="600"
        fontSize={financeSize}
        fill={subColor}
        letterSpacing="2.5"
      >
        FINANCE
      </text>
    </svg>
  );
}
