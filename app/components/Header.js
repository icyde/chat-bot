import React from 'react';
import Image from "next/image";

const Header = () => {
  return <div className="flex w-full h-16 bg-[#2755A3] gap-3 p-3 rounded-t-lg">
    <Image src="/logo.png" width={40} height={40} className='my-auto'></Image>
    <h1 className='text-4xl text-white'>OYIKA</h1>
  </div>;
}

export default Header;
