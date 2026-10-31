import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#4a2c11",
};

export const metadata: Metadata = {
  title: "Home Barista",
  description:
    "Live barista queue and mobile coffee ordering for small gatherings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased">
        <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pt-4 pb-12">
          {children}
        </div>
      </body>
    </html>
  );
}
