import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Vercel Swag Store",
    template: "%s | Vercel Swag Store",
  },
  description:
    "Premium swag for developers who build with Vercel. From tees to tech gear, represent the tools you love.",
  openGraph: {
    title: "Vercel Swag Store",
    description:
      "Premium swag for developers who build with Vercel. From tees to tech gear, represent the tools you love.",
    type: "website",
    siteName: "Vercel Swag Store",
  },
  other: {
    generator: "vswag-cert-v3",
  },
};

export const viewport: Viewport = {
  themeColor: "#171719",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
