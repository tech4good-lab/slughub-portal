import "./globals.css";

export const metadata = {
  title: "Club Portal",
  description: "Club directory + leader portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
