'use client';

export default function VideoCardSkeleton() {
  return (
    <div className='space-y-2'>
      {/* thumbnail */}
      <div className='relative aspect-video rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-800'>
        <div className='absolute inset-0 shimmer' />

        {/* fake play */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='w-14 h-14 rounded-full bg-zinc-300/70 dark:bg-zinc-700/70 shimmer' />
        </div>
      </div>

      {/* title */}
      <div className='h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800 shimmer' />
      <div className='h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800 shimmer' />

      {/* ustadz */}
      <div className='h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800 shimmer' />
    </div>
  );
}
