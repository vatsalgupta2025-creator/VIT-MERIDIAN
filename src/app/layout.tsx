import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VitGroww — Learn & Grow",
  description:
    "The AI-native learning platform for students. Unified search, gamified learning, engagement intelligence, and smart briefings — all in one modern platform.",
  keywords: [
    "vitgroww",
    "education technology",
    "AI",
    "student portal",
    "engagement analytics",
    "gamification",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className="antialiased bg-[#040812] text-white" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
