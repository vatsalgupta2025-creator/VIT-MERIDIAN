import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VitGroww — Smart Campus OS",
  description:
    "The Smart Campus OS for VIT students. 27+ modules unifying timetables, attendance, PYQs, AI mock interviews, roommate matching, lost & found, budget tracking, and more — powered by Gemini AI.",
  keywords: [
    "vitgroww",
    "VIT",
    "campus OS",
    "student portal",
    "attendance tracker",
    "timetable",
    "AI assistant",
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
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Figtree:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body
        className="antialiased text-[var(--text-primary)]"
        style={{
          fontFamily: "'Figtree', system-ui, -apple-system, sans-serif",
          backgroundColor: "var(--surface-base)",
        }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

