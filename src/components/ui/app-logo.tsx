"use client";

export function AppLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="512" height="512" rx="112" fill="#1d1d20" />
      {/* Folder shadow */}
      <path
        d="M80 200C80 178.9 97 162 118 162H230L278 200H394C415.1 200 432 217 432 238V384C432 405.1 415.1 422 394 422H118C97 422 80 405.1 80 384V200Z"
        fill="#c64600"
      />
      {/* Folder back */}
      <path
        d="M80 184C80 162.9 97 146 118 146H230L278 184H394C415.1 184 432 201 432 222V368C432 389.1 415.1 406 394 406H118C97 406 80 389.1 80 368V184Z"
        fill="#e66100"
      />
      {/* Folder front */}
      <path
        d="M80 232C80 214.3 94.3 200 112 200H400C417.7 200 432 214.3 432 232V368C432 389.1 415.1 406 394 406H118C97 406 80 389.1 80 368V232Z"
        fill="#ff7800"
      />
      {/* Folder highlight */}
      <path
        d="M112 200H400C417.7 200 432 214.3 432 232V248H80V232C80 214.3 94.3 200 112 200Z"
        fill="#ffa348"
        opacity="0.4"
      />
      {/* GD text */}
      <text
        x="256"
        y="338"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
        fontWeight="700"
        fontSize="100"
        fill="white"
        letterSpacing="-2"
      >
        GD
      </text>
    </svg>
  );
}

export function AppLogoMinimal({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Folder shadow */}
      <path
        d="M6 22C6 18.6863 8.68629 16 12 16H26L32 22H52C55.3137 22 58 24.6863 58 28V48C58 51.3137 55.3137 54 52 54H12C8.68629 54 6 51.3137 6 48V22Z"
        fill="#c64600"
      />
      {/* Folder back */}
      <path
        d="M6 20C6 16.6863 8.68629 14 12 14H26L32 20H52C55.3137 20 58 22.6863 58 26V46C58 49.3137 55.3137 52 52 52H12C8.68629 52 6 49.3137 6 46V20Z"
        fill="#e66100"
      />
      {/* Folder front */}
      <path
        d="M6 28C6 25.7909 7.79086 24 10 24H54C56.2091 24 58 25.7909 58 28V46C58 49.3137 55.3137 52 52 52H12C8.68629 52 6 49.3137 6 46V28Z"
        fill="#ff7800"
      />
      {/* Folder highlight */}
      <path
        d="M10 24H54C56.2091 24 58 25.7909 58 28V30H6V28C6 25.7909 7.79086 24 10 24Z"
        fill="#ffa348"
        opacity="0.4"
      />
    </svg>
  );
}
