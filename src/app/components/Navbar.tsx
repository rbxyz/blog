"use client";

import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  const { user } = useUser();
  const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ALLOWED_EMAIL;

  return (
    <nav className="flex items-center justify-between bg-gray-800 px-4 py-3 text-white">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-xl font-bold">
          Ruan | D3v
        </Link>
        <Link href="/" className="hover:underline">
          Home
        </Link>

        {/* 🔹 Só exibe "Admin" se for o usuário correto */}
        {user?.primaryEmailAddress?.emailAddress === ALLOWED_EMAIL && (
          <Link href="/admin" className="hover:underline">
            Admin
          </Link>
        )}
      </div>

      <div>
        <SignedOut>
          <SignInButton
            mode="modal"
            className="rounded bg-blue-500 px-4 py-2 text-white"
          />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}
