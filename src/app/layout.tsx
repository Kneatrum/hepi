import type { Metadata } from "next";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import localFont from "next/font/local"
import "./globals.css";
import { SessionProvider } from "./context/SessionContext";
import { SongsProvider } from "./context/SongsContext";

const outfit = localFont({
  src: "./fonts/Outfit-VariableFont_wght.ttf",
  variable: "--font-outfit"
});


export const metadata: Metadata = {
  title: "Hepi Music",
  description: "Kenyan Music web app",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable}`}>
        <SessionProvider>
          <SongsProvider>
            <AppRouterCacheProvider>
              {children}
            </AppRouterCacheProvider>
          </SongsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
