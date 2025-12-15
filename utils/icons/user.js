import { createDivIcon } from '../createDivIcon';

export const userDivIcon = createDivIcon(
  `
  <div class="relative w-6 h-6">
    <span class="
      absolute inset-0
      rounded-full
      bg-purple-400
      opacity-30
      animate-ping
    "></span>

    <span class="
      absolute inset-1
      rounded-full
      bg-purple-600
      border-2 border-white
      shadow-md
    "></span>
  </div>
`,
  [24, 24]
);
