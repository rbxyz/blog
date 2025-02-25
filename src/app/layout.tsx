import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "~/trpc/react";
import Navbar from "~/app/components/Navbar";
import ThemeProvider from "~/app/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Blog | Ruan",
  description: "Blog do Ruan",
  icons: [{ rel: "icon", url: "/logoAllpines.svg" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="bg-gray-100 text-gray-900 transition-colors duration-300 dark:bg-gray-900 dark:text-white">
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
          <TRPCReactProvider>
            <ThemeProvider>
              <Navbar />
              <main className="min-h-screen">{children}</main>
            </ThemeProvider>
          </TRPCReactProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
