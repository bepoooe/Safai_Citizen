import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Safai Citizen - Make Your City Clean",
  description: "Report cleanliness issues in your city with photos and videos",
  keywords: "cleanliness, city, report, photos, videos, citizen, environment",
  authors: [{ name: "Safai Citizen Team" }],
  creator: "Safai Citizen",
  publisher: "Safai Citizen",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <LanguageProvider>
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
