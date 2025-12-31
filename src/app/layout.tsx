import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import { TRPCProvider } from "@/lib/trpc/Provider";
import { ToastProvider } from "@/components/ui/ToastContext";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    default: "PinStar - Save and Organize Your Ideas",
    template: "%s | PinStar"
  },
  description: "Discover, save, and organize beautiful ideas. Create boards to keep your pins organized and share your inspiration with the world.",
  keywords: ["pinstar", "pinterest", "ideas", "inspiration", "boards", "pins", "organize", "save"],
  authors: [{ name: "PinStar Team" }],
  creator: "PinStar",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pinstar.app",
    title: "PinStar - Save and Organize Your Ideas",
    description: "Discover, save, and organize beautiful ideas. Create boards to keep your pins organized and share your inspiration with the world.",
    siteName: "PinStar",
  },
  twitter: {
    card: "summary_large_image",
    title: "PinStar - Save and Organize Your Ideas",
    description: "Discover, save, and organize beautiful ideas. Create boards to keep your pins organized.",
    creator: "@pinstar",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body className="bg-white antialiased pb-safe">
        <TRPCProvider>
          <ToastProvider>
            <Header />
            <main className="page-transition">{children}</main>
            <MobileNav user={user} />
          </ToastProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
