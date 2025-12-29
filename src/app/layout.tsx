import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { getAppConfig } from "@/lib/server-utils";
import { getAssetPath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "WallCraft | Automated Wallpapers",
  description: "Daily 4K wallpapers generated with professional developer themes.",
  manifest: getAssetPath("/manifest.json"),
  icons: {
    icon: getAssetPath("/logo.png"),
    shortcut: getAssetPath("/logo.png"),
    apple: getAssetPath("/logo.png"),
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WallCraft",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#121212", // Default theme color for browser bar
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Feels more 'native' app-like
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { themes, categories } = getAppConfig();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-background font-sans">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="nord"
          enableSystem={false}
          themes={["nord", "midnight", "daylight", "latte"]}
        >
          <Navbar themes={themes} categories={categories} />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}