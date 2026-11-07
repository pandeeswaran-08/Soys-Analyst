import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { RBACProvider } from "@/lib/rbac";
import { ThemeProvider } from "@/lib/theme";
import { isClerkConfigured } from "@/lib/clerk-config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SoyDecision Desk | Soybean Crush & Hedging Terminal",
  description: "Enterprise decision support system for soybean processing, board crush margins, basis pricing, and autonomous quantitative hedging strategies.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

const themeInitScript = `
  (function() {
    try {
      var stored = localStorage.getItem('desk-theme');
      var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkActive = isClerkConfigured();

  const content = (
    <ThemeProvider>
      <RBACProvider>
        {children}
      </RBACProvider>
    </ThemeProvider>
  );

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body 
        className="font-sans antialiased selection:bg-[#10A37F] selection:text-white min-h-screen"
        suppressHydrationWarning
      >
        {clerkActive ? <ClerkProvider>{content}</ClerkProvider> : content}
      </body>
    </html>
  );
}
