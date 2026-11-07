import { useId } from "react";

interface TechEcommerceBackgroundBannerProps {
  className?: string;
  opacity?: number;
}

export function TechEcommerceBackgroundBanner({
  className = "",
  opacity = 0.1,
}: TechEcommerceBackgroundBannerProps) {
  const patternId = `tech-ecommerce-pattern-${useId().replace(/:/g, "")}`;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden text-[#0284c7] ${className}`}
      style={{ opacity }}
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 360 240"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={patternId}
            width="360"
            height="240"
            patternUnits="userSpaceOnUse"
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <g transform="translate(24 28)">
                <path d="M3 5h4l4 19h22l4-14H10" />
                <circle cx="15" cy="30" r="2" />
                <circle cx="31" cy="30" r="2" />
                <path d="M16 12h13M22.5 7v10" />
              </g>
              <g transform="translate(132 20)">
                <rect x="1" y="2" width="46" height="30" rx="3" />
                <path d="M7 8h34v18H7zM19 32l-3 6h16l-3-6" />
                <path d="M9 22h9m4 0h8" />
              </g>
              <g transform="translate(270 26)">
                <rect x="2" y="1" width="18" height="38" rx="2" />
                <circle cx="11" cy="9" r="2" />
                <circle cx="11" cy="19" r="5" />
                <circle cx="11" cy="32" r="2" />
                <path d="M27 7h25v24H27zM32 12h15" />
              </g>
              <g transform="translate(64 116)">
                <path d="M2 21V18a20 20 0 0 1 40 0v3" />
                <rect x="1" y="18" width="9" height="17" rx="4" />
                <rect x="34" y="18" width="9" height="17" rx="4" />
                <path d="M38 35c-2 5-7 7-14 7h-4" />
                <circle cx="17" cy="42" r="2" />
              </g>
              <g transform="translate(174 120)">
                <rect x="1" y="5" width="54" height="30" rx="4" />
                <path d="M8 12h40v16H8z" />
                <circle cx="20" cy="20" r="5" />
                <circle cx="37" cy="20" r="5" />
                <path d="M20 16v8m-4-4h8m13-4v8m-4-4h8" />
              </g>
              <g transform="translate(294 128)">
                <rect x="1" y="3" width="49" height="29" rx="4" />
                <path d="M8 10h35v15H8z" />
                <circle cx="18" cy="17.5" r="4" />
                <circle cx="33" cy="17.5" r="4" />
              </g>
              <g transform="translate(16 192)">
                <rect x="1" y="1" width="48" height="29" rx="4" />
                <path d="M7 7h36v17H7zM12 13h9m5 0h11" />
                <circle cx="37" cy="18" r="2" />
              </g>
              <g transform="translate(128 190)">
                <circle cx="18" cy="17" r="16" />
                <path d="M23 9c-1-2-3-3-6-3-4 0-6 2-6 5 0 8 14 4 14 12 0 3-3 6-7 6-3 0-6-1-8-4m8-22v26" />
              </g>
              <g transform="translate(236 188)">
                <path d="M1 9h38v22H1zM6 9V5h28v4m-20 6h13m-13 6h18" />
                <circle cx="46" cy="20" r="10" />
                <path d="M49 16c-1-1-2-2-4-2-2 0-4 1-4 3 0 5 9 3 9 7 0 2-2 3-5 3-2 0-4-1-5-2" />
              </g>
            </g>
            <g
              fill="currentColor"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontSize="15"
              fontWeight="700"
            >
              <text x="82" y="48">$</text>
              <text x="196" y="77">US$</text>
              <text x="73" y="204">+</text>
              <text x="326" y="95">$</text>
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
