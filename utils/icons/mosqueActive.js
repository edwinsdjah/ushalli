import { createDivIcon } from '../createDivIcon';

export const mosqueActiveDivIcon = createDivIcon(
  `
  <div class="
    relative
    w-11 h-11
    rounded-full
    bg-[var(--color-royal)]
    flex items-center justify-center
    shadow-xl
  ">
    <!-- Pulse ring -->
    <span class="
      absolute inset-0
      rounded-full
      bg-[#F5C97A]
      opacity-30
      animate-ping
    "></span>

    <!-- Outer gold ring -->
    <span class="
      absolute inset-0
      rounded-full
      ring-2 ring-[#F5C97A]
    "></span>

    <!-- Dome -->
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      class="relative z-10"
    >
      <path
        d="
          M5 13
          C5 8.8 8.8 6 12 6
          C15.2 6 19 8.8 19 13
          Z
        "
        fill="#F5C97A"
      />
      <rect
        x="11.4"
        y="3"
        width="1.2"
        height="3"
        rx="0.6"
        fill="#F5C97A"
      />
    </svg>
  </div>
`,
  [44, 44]
);
