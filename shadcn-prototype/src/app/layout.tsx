import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Planner — shadcn/ui Prototype",
  description: "PAUMEN-UI comparison prototype built with shadcn/ui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
