import { createDivIcon } from '../createDivIcon';

export const mosqueDivIcon = createDivIcon(`
  <div class="
    w-10 h-10
    bg-[var(--color-royal)]
    rounded-full
    flex items-center justify-center
    shadow-lg
    ring-4 ring-purple-200
  ">
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <!-- Dome -->
      <path
        d="
          M5 13
          C5 8.8 8.8 6 12 6
          C15.2 6 19 8.8 19 13
          Z
        "
        fill="white"
      />

      <!-- Vertical finial / tiang -->
      <rect
        x="11.4"
        y="3"
        width="1.2"
        height="3"
        rx="0.6"
        fill="white"
      />
    </svg>
  </div>
`);
