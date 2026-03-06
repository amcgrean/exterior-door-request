import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beisser Lumber — Exterior Door Quote",
  description: "Get a personalized exterior door quote from Beisser Lumber",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
