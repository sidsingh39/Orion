import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";

// Primary sans font
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Monospace font
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Global metadata
export const metadata: Metadata = {
  title: "ORION",
  description: "Premium AI Knowledge Assistant",
};

// Root layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          antialiased
          bg-background
          text-foreground
          selection:bg-[rgba(182,140,36,0.22)]
          selection:text-foreground
        `}
      >
        {/* Theme System */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}

          {/* Global Toast System */}
          <Toaster
            position="top-center"
            toastOptions={{
              className:
                "bg-[rgba(255,250,240,0.95)] dark:bg-[rgba(26,29,34,0.96)] border border-[rgba(182,140,36,0.16)] text-[#2a2118] dark:text-[#f5efe2]",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}