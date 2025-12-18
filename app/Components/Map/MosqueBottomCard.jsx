export default function MosqueBottomCard({
  mosque,
  routeInfo,
  onRoute,
  onCancel,
}) {
  const isOpen = !!mosque;
  const isRouting = !!routeInfo;

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-[1000]
        transition-all duration-300 ease-out
        ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        pointer-events-${isOpen ? 'auto' : 'none'}
      `}
    >
      <div
        className='
          bg-white rounded-3xl shadow-2xl
          px-5 py-4 md:max-w-[80%] w-[98%] mb-2
          mx-auto
        '
      >
        <div className='flex justify-between items-center gap-4'>
          {/* INFO */}
          <div className='flex-1'>
            <h3 className='text-base font-semibold text-gray-900 leading-tight'>
              {mosque?.name}
            </h3>

            {!isRouting && (
              <p className='mt-1 text-sm text-gray-500 leading-snug'>
                {mosque?.address}
              </p>
            )}
            
            {isRouting && routeInfo && (
              <div className='mt-3 text-sm text-gray-700 space-y-1'>
                <div className='flex items-center gap-2'>
                  <span className='text-gray-500'>Jarak:</span>
                  <span className='font-medium'>{routeInfo.distance} m</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-gray-500'>Estimasi:</span>
                  <span className='font-medium'>{routeInfo.time} menit</span>
                </div>
              </div>
            )}
          </div>

          {/* ACTION */}
          <div className='flex flex-col gap-2'>
            {!isRouting && (
              <button
                onClick={() => onRoute(mosque.position, 'bicycle')}
                className='
                  px-4 py-2 rounded-xl text-sm font-medium
                  bg-blue-600 text-white
                  hover:bg-blue-700 transition
                  cursor-pointer
                '
              >
                Pilih Rute
              </button>
            )}

            <button
              onClick={onCancel}
              className='
                px-4 py-2 rounded-xl text-sm font-medium
                border text-white hover:bg-red-800
                bg-red-700 transition
                cursor-pointer
              '
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
