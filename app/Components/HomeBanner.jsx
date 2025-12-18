import React from 'react'
import Image from 'next/image'

const HomeBanner = () => {
  return (
    <>
        <Image className='rounded-xl text-center mx-auto max-h-[250px]' src={'/home_bnr.png'} width={500} height={80}/>
    </>
  )
}

export default HomeBanner