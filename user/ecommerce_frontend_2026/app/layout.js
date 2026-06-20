
import { Suspense } from "react";
import "./globals.css";
import Navber from "@/app/components/Navber.js"
import Footer from "./components/Footer";
import { CartProvider } from "@/app/context/CartContext";
import { UserProvider } from './context/UserContext';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"),
  title: {
    default: "TechTrends BD - Quality Tech Products in Bangladesh",
    template: "%s | TechTrends BD",
  },
  description: "Quality tech products in Bangladesh with fast checkout and cash on delivery.",
  keywords: ["tech products Bangladesh", "laptops", "mobile phones", "tablets", "gaming PC", "TechTrends BD"],
  openGraph: {
    title: "TechTrends BD - Quality Tech Products in Bangladesh",
    description: "Shop quality tech products in Bangladesh with fast checkout and cash on delivery.",
    type: "website",
    siteName: "TechTrends BD",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">

      <body>
        <UserProvider>
          <CartProvider>
            <Suspense fallback={null}>
              <Navber />
            </Suspense>
            {children}
            <Footer />
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
