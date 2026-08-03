import type { Metadata } from "next";
import { Source_Serif_4, Public_Sans } from "next/font/google";
import "./globals.css";
import MathJaxProvider from "@/components/MathJaxProvider";

const serif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600", "700"],
  variable: "--font-serif",
});

const sans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "MathGPT Case Study Pipeline",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      {/* Browser extensions (Grammarly is the common one) inject attributes such as
          data-gr-ext-installed onto <body> before React hydrates, which React reports
          as a hydration mismatch even though nothing in this app rendered differently.
          suppressHydrationWarning is React's sanctioned answer for exactly that, and it
          is scoped to this element's own attributes, so real mismatches in the tree
          below are still reported. */}
      <body suppressHydrationWarning>
        <MathJaxProvider>{children}</MathJaxProvider>
      </body>
    </html>
  );
}
