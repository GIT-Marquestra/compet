import toast, { Toaster } from 'react-hot-toast';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme-provider"
import { SessionProvider } from "next-auth/react";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
      
        <SessionProviderWrapper>
        <header className="absolute w-full"><Navbar/></header>
        <main className="w-full flex justify-center min-h-screen overflow-hidden">
          {/* <SessionProvider> */}
          <div className="w-[95%] max-w-7xl h-screen overflow-hidden">
            
              {children}
        <Toaster/>
          </div>
          {/* </SessionProvider> */}
        </main>
        </SessionProviderWrapper>
      <footer></footer>
      </ThemeProvider>
      </body>
      
    </html>

  );
}
