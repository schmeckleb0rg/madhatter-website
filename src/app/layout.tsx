import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mad Hatter Comedy Club | Chicago",
  description:
    "Chicago's premier comedy club. Live stand-up, improv, and more in the heart of the city.",
  keywords: "comedy club, Chicago, stand-up, improv, live comedy, Mad Hatter",
  openGraph: {
    title: "Mad Hatter Comedy Club | Chicago",
    description: "Chicago's premier comedy club.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
