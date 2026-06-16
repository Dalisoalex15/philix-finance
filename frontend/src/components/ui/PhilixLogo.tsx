interface Props {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  /** Use on dark/navy backgrounds — renders white wordmark */
  onDark?: boolean;
  className?: string;
}

const sizes = {
  sm:  { icon: "w-8 h-8",   full: "h-9"  },
  md:  { icon: "w-10 h-10", full: "h-11" },
  lg:  { icon: "w-14 h-14", full: "h-14" },
  xl:  { icon: "w-20 h-20", full: "h-16" },
};

export default function PhilixLogo({ variant = "full", size = "md", onDark = false, className = "" }: Props) {
  const s = sizes[size];

  if (variant === "icon") {
    return (
      <img
        src="/logo-icon.svg"
        alt="Philix Finance"
        className={`${s.icon} object-contain ${className}`}
        draggable={false}
      />
    );
  }

  return (
    <img
      src={onDark ? "/logo-light.svg" : "/logo.svg"}
      alt="Philix Finance"
      className={`${s.full} w-auto object-contain ${className}`}
      draggable={false}
    />
  );
}
