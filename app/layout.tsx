import type { Metadata } from "next";
import { Titillium_Web } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const bigShouldersDisplay = Titillium_Web({
  subsets: ["latin-ext"],
  weight: ["300", "400", "700"],
  style: "normal",
});

export const metadata: Metadata = {
  title: "SwiftXR 3D Viewer",
  description: "3D Viewer for SwiftXR - Design and Develop in 3D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bigShouldersDisplay.className} antialiased overflow-hidden`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
