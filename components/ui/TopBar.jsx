import { PersonStanding, Bike, Car } from 'lucide-react';

const ROUTE_MODES = [
  { key: 'walk', icon: PersonStanding },
  { key: 'bicycle', icon: Bike },
  { key: 'drive', icon: Car },
];

export default function TopBar({
  address,
  radius,
  setRadius,
  routeInfo,
  onChangeMode,
  onClearRoute,
}) {
  return (
    <div className='absolute top-0 z-[1000] w-full'>
      <div className='backdrop-blur p-3 shadow-sm'>
        {/* ADDRESS */}
        <div className='bg-gray-100 rounded-2xl px-4 py-2'>
          <div className='text-[11px] text-gray-500'>Lokasi Anda</div>
          <div className='text-sm font-medium text-gray-800 truncate'>
            {address}
          </div>
        </div>

        {/* RADIUS */}
        <div className='mt-2'>
          <div className='flex justify-between text-[11px] text-gray-500 mb-1'>
            <span>Radius</span>
            <span>{radius} m</span>
          </div>

          <input
            type='range'
            min={500}
            max={5000}
            step={100}
            value={radius}
            onChange={e => setRadius(Number(e.target.value))}
            className='
            w-full h-1
            bg-transparent
            accent-royal
            cursor-pointer
          '
            style={{
              accentColor: 'var(--color-royal)',
            }}
          />
        </div>
      </div>

      {/* ROUTE MODE ICONS */}
      {routeInfo && (
        <div className='flex gap-3 mt-2 items-center px-3'>
          {ROUTE_MODES.map(m => {
            const active = routeInfo.mode === m.key;
            const Icon = m.icon;

            return (
              <button
                key={m.key}
                onClick={() => onChangeMode(m.key)}
                title={m.key} // tooltip sederhana
                className={`
                  flex items-center justify-center
                  w-11 h-11 rounded-xl border transition
                  cursor-pointer
                  ${
                    active
                      ? 'bg-[var(--color-royal)] text-white shadow'
                      : 'bg-white text-gray-700'
                  }
                `}
              >
                <Icon size={22} strokeWidth={2.5} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
