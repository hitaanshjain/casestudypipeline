// One drawn icon system (finish-review M2): every glyph at the same 16-box,
// 1.6 stroke, currentColor, replacing the Unicode characters that stood in
// for icons. Keep new icons in this stroke and weight.

type IconProps = { size?: number };

function frame(size: number) {
  return { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true } as const;
}

export function DownloadIcon({ size = 15 }: IconProps) {
  return (
    <svg {...frame(size)}>
      <path
        d="M8 2.5v7.6m0 0 3.2-3.2M8 10.1 4.8 6.9M3 13h10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon({ size = 15 }: IconProps) {
  return (
    <svg {...frame(size)}>
      <path
        d="m3.2 8.6 3.1 3.1 6.5-7.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BangIcon({ size = 15 }: IconProps) {
  return (
    <svg {...frame(size)}>
      <path d="M8 2.8v6.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8" cy="12.6" r="1.15" fill="currentColor" />
    </svg>
  );
}

export function DashIcon({ size = 15 }: IconProps) {
  return (
    <svg {...frame(size)}>
      <path d="M4 8h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function TargetIcon({ size = 15 }: IconProps) {
  return (
    <svg {...frame(size)}>
      <circle cx="8" cy="8" r="5.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8" cy="8" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function SparkIcon({ size = 15 }: IconProps) {
  return (
    <svg {...frame(size)}>
      <path
        d="M8 1.8 9.5 6.5 14.2 8 9.5 9.5 8 14.2 6.5 9.5 1.8 8 6.5 6.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function RefreshIcon({ size = 15 }: IconProps) {
  return (
    <svg {...frame(size)}>
      <path
        d="M12.8 8A4.8 4.8 0 1 1 10 3.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M10.2 1.6 10 3.9l2.3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GridIcon({ size = 15 }: IconProps) {
  return (
    <svg {...frame(size)}>
      <path
        d="M2.7 2.7h4.1v4.1H2.7zM9.2 2.7h4.1v4.1H9.2zM2.7 9.2h4.1v4.1H2.7zM9.2 9.2h4.1v4.1H9.2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SkipToEndIcon({ size = 15 }: IconProps) {
  return (
    <svg {...frame(size)}>
      <path
        d="M2.5 8h7.6m0 0L7 4.9M10.1 8 7 11.1M13 4v8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
