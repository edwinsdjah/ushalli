import dynamic from 'next/dynamic';

const MosqueMap = dynamic(() => import('./MosqueMap.client'), {
  ssr: false,
  loading: () => (
    <div className='flex h-full items-center justify-center'>
      Memuat peta...
    </div>
  ),
});

export default MosqueMap;
