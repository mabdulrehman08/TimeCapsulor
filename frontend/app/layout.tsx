import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TimeCapsulor",
  description: "Record and revisit conversations with Vapi."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
