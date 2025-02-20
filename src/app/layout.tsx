import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";

import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Blog | Ruan",
  description: "Blog do Ruan",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
          <TRPCReactProvider>
            <SignedOut>
              <div className="flex min-h-screen items-center justify-center">
                <SignInButton mode="modal" />
              </div>
            </SignedOut>
            <SignedIn>{children}</SignedIn>
          </TRPCReactProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
