import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import RouteTracker from "@/app/components/RouteTracker";

export const metadata = {
  title: "Community Directory",
  description: "UCSC Community Directory",
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
          href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <RouteTracker />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
