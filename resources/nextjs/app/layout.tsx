import type { Metadata } from "next";
import localFont from "next/font/local";
import { Fraunces, Montserrat, Inria_Serif } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import { GoogleTagManager } from "@next/third-parties/google";
import { Initializer } from "./initializer";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-fraunces",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-montserrat",
});
const inria_serif = Inria_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-inria-serif",
});

const inter = localFont({
  src: [
    {
      path: "./fonts/Inter.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-inter",
});

// Neue Montreal fonts
const neueMontreal = localFont({
  src: [
    {
      path: "./fonts/NeueMontreal/NeueMontreal-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/NeueMontreal/NeueMontreal-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/NeueMontreal/NeueMontreal-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/NeueMontreal/NeueMontreal-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/NeueMontreal/NeueMontreal-Italic.otf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-neue-montreal",
});

// Satoshi fonts
const satoshi = localFont({
  src: [
    {
      path: "./fonts/Satoshi/Satoshi-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Satoshi/Satoshi-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Satoshi/Satoshi-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/Satoshi/Satoshi-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Satoshi/Satoshi-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
});

// Switzer fonts
const switzer = localFont({
  src: [
    {
      path: "./fonts/Switzer/Switzer-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Switzer/Switzer-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Switzer/Switzer-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/Switzer/Switzer-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Switzer/Switzer-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-switzer",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://presenton.ai"),
  title: "Presenton.ai - AI Presentation Maker for Data Storytelling",
  description:
    "Turn complex data into stunning, interactive presentations with Presenton.ai. Create professional slides from reports and analytics in minutes. Try now!",
  keywords: [
    "AI presentation maker",
    "data storytelling",
    "data visualization tool",
    "AI data presentation",
    "presentation generator",
    "data to presentation",
    "interactive presentations",
    "professional slides",
  ],
  openGraph: {
    title: "Presenton.ai - AI-Powered Data Presentations",
    description:
      "Transform data into engaging presentations effortlessly with Presenton.ai, your go-to AI tool for stunning slides and data storytelling.",
    url: "https://presenton.ai",
    siteName: "Presenton.ai",
    images: [
      {
        url: "https://presenton.ai/presenton-feature-graphics.png",
        width: 1200,
        height: 630,
        alt: "Presenton.ai Logo",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://presenton.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "Presenton.ai - AI Presentation Maker for Data Storytelling",
    description:
      "Create stunning presentations from data with Presenton.ai. Simplify reports and analytics into interactive slides fast!",
    images: ["https://presenton.ai/presenton-feature-graphics.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`$ ${neueMontreal.variable} ${satoshi.variable} ${switzer.variable} ${inter.variable} ${fraunces.variable} ${montserrat.variable} ${inria_serif.variable} antialiased`}
      >
        <GoogleTagManager gtmId="GTM-53K6PVCF" />
        <Initializer />
        <Providers>{children}</Providers>
        <Toaster />
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "p3n3njx00v");
          `}
        </Script>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-11502098697"
        ></Script>
        <Script>
          {`
              window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'AW-11502098697');
            `}
        </Script>

        {/* <Script id="tawk-script" strategy="afterInteractive">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/674c9e8a4304e3196aeb2229/1ie1kmk1o';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script> */}
      </body>
    </html>
  );
}
