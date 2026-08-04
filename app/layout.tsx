import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../components/sidebar";

export const metadata: Metadata = {
  title: "UAMC Admin Panel",
  description: "Content management for the UAMC website",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Sidebar />
        <div className="ml-64 min-h-screen bg-gray-50">{children}</div>
      </body>
    </html>
  );
}