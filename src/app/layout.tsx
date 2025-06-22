import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import Navbar from "~/app/components/Navbar";
import ThemeProvider from "~/app/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Blog | Ruan - Dev & Tech",
  description: "Blog pessoal sobre desenvolvimento, tecnologia e inovação por Ruan Bueno",
  icons: [{ rel: "icon", url: "/logo.png" }],
  keywords: ["blog", "desenvolvimento", "tecnologia", "programação", "web development"],
  authors: [{ name: "Ruan Bueno" }],
  openGraph: {
    title: "Blog | Ruan - Dev. & Tech",
    description: "Blog pessoal sobre desenvolvimento, tecnologia e inovação",
    type: "website",
    locale: "pt_BR"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 text-dark-800 dark:text-slate-100 transition-all duration-300 antialiased">
        <TRPCReactProvider>
          <ThemeProvider>
            {/* Background pattern overlay */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary-400/20 to-secondary-400/20 blur-3xl animate-pulse-slow"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-accent-400/20 to-primary-400/20 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>
            
            <Navbar />
            
            <main className="min-h-screen relative">
              <div className="relative z-10">
                {children}
              </div>
            </main>
            
            {/* Footer */}
            <footer className="relative z-10 mt-20 border-t border-slate-200/20 dark:border-dark-700/20">
              <div className="glass-card mx-auto max-w-7xl px-6 py-8">
                <div className="text-center">
                  <p className="text-slate-600 dark:text-slate-400">
                    © {new Date().getFullYear()} Ruan Bueno. Feito com ☕ e Next.js
                  </p>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
