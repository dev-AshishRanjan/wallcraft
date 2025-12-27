import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "WallCraft | Automated Wallpapers",
  description: "Daily 4K wallpapers generated with Nord, Dracula, and Gruvbox themes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="flex flex-col min-h-screen bg-nord-0 font-sans selection:bg-nord-8 selection:text-nord-0">
        <Navbar />
        {/* Add padding top to account for fixed navbar */}
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}