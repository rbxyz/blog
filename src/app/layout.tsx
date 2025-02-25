import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Blog | Ruan D3v",
  description:
    "Este é um blog sobre projetos, desenvolvimento web, conquistas pessoais e muito mais de um desenvolvedor, de um gestor de tráfego, de um auxiliar administrativo, de um designer e de um CEO.",
  icons: [{ rel: "icon", url: "/logoAllpines.svg" }],
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
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
