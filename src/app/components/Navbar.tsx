"use client";

import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider"; // 🔹 Importando o hook do tema

export default function Navbar() {
  const { user } = useUser();
  const { darkMode, toggleTheme } = useTheme();
  const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ALLOWED_EMAIL;

  return (
    <nav className="flex items-center justify-between bg-gray-900 px-6 py-4 text-white dark:bg-gray-700">
      <div className="flex items-center space-x-6">
        <Link
          href="/"
          className="text-2xl font-bold transition-opacity hover:opacity-80"
        >
          D3v | Ruan
        </Link>

        {user?.primaryEmailAddress?.emailAddress === ALLOWED_EMAIL && (
          <Link href="/admin" className="hover:underline">
            Admin
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="rounded bg-gray-700 p-2 transition hover:bg-gray-600"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <SignedOut>
          <div className="rounded bg-blue-500 px-4 py-2 text-white">
            <SignInButton mode="modal" />
          </div>
        </SignedOut>

        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 rounded-full border-2 border-white",
              },
            }}
          />
        </SignedIn>
      </div>
    </nav>
  );
}
