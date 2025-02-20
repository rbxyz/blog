"use client"; // Adicione esta linha no topo do arquivo

import { UserButton } from "@clerk/clerk-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-gray-800 px-4 py-3 text-white">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-xl font-bold">
          Blog do Ruan
        </Link>
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link href="/admin">Admin</Link>
      </div>
      <div>
        <UserButton />
      </div>
    </nav>
  );
}
