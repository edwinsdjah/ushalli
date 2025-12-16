"use client";

import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <nav className="flex items-center h-14 px-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"      // ganti sesuai file logo kamu
            alt="Ushalli Logo"
            width={85}
            height={85}
            priority
          />
        </Link>
      </nav>
    </header>
  );
}
