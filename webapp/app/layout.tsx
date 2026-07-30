import type { Metadata } from "next";
import "./globals.css";
import MathJaxProvider from "@/components/MathJaxProvider";

export const metadata: Metadata = {
  title: "MathGPT Case Study Pipeline",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MathJaxProvider>{children}</MathJaxProvider>
      </body>
    </html>
  );
}
