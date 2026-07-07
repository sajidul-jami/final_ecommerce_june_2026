
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import Navber from "@/app/components/Navber.js"
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";
import { CartProvider } from "@/app/context/CartContext";
import { UserProvider } from './context/UserContext';
import { getSiteSettings, resolveSiteImage, siteUrl } from './lib/siteSettings';

const stripScriptTags = (value = '') =>
  String(value)
    .replace(/<script[^>]*>/gi, '')
    .replace(/<\/script>/gi, '')
    .trim();

function TrackingScripts({ settings }) {
  const ga = String(settings.google_analytics || '').trim();
  const gtm = String(settings.google_tag_manager || '').trim();
  const pixel = String(settings.facebook_pixel || '').trim();
  const gaId = /^G-[A-Z0-9-]+$/i.test(ga) ? ga : '';
  const gtmId = /^GTM-[A-Z0-9-]+$/i.test(gtm) ? gtm : '';
  const pixelId = /^[0-9]{5,}$/.test(pixel) ? pixel : '';

  return (
    <>
      {gaId && <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />}
      {gaId && (
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
        </Script>
      )}
      {ga && !gaId && <Script id="google-analytics-custom" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: stripScriptTags(ga) }} />}
      {gtmId && (
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}
      {gtm && !gtmId && <Script id="google-tag-manager-custom" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: stripScriptTags(gtm) }} />}
      {pixelId && (
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
        </Script>
      )}
      {pixel && !pixelId && <Script id="facebook-pixel-custom" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: stripScriptTags(pixel) }} />}
    </>
  );
}

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const title = settings.meta_title || settings.website_name;
  const description = settings.meta_description || settings.website_description;
  const keywords = String(settings.meta_keywords || '')
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);
  const favicon = resolveSiteImage(settings.favicon);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${settings.website_name}`,
    },
    description,
    keywords,
    icons: favicon ? { icon: favicon, shortcut: favicon, apple: favicon } : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: settings.website_name,
      images: resolveSiteImage(settings.website_logo) ? [resolveSiteImage(settings.website_logo)] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({ children }) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" data-scroll-behavior="smooth">

      <body suppressHydrationWarning>
        <UserProvider>
          <CartProvider>
            <Suspense fallback={null}>
              <Navber settings={settings} />
            </Suspense>
            {children}
            <Footer settings={settings} />
            <MobileBottomNav />
          </CartProvider>
        </UserProvider>
        <TrackingScripts settings={settings} />
      </body>
    </html>
  );
}
