import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Laundry POS",
  description: "Aplikasi Kasir Laundry",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body style={{ margin: 0 }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>

          {/* ===== SIDEBAR ===== */}
          <div
            style={{
              width: 220,
              background: "#2c3e50",
              color: "white",
              padding: 20,
              height: "100vh",
            }}
          >
            <h2 style={{ marginBottom: 20 }}>Laundry POS</h2>

            <Menu href="/" label="Dashboard" />
            <Menu href="/transaksi" label="Transaksi" />
            <Menu href="/riwayat" label="Riwayat" />
            <Menu href="/layanan" label="Layanan" />
            <Menu href="/pelanggan" label="Pelanggan" />
            <Menu href="/laporan" label="Laporan" />
          </div>

          {/* ===== CONTENT ===== */}
          <div
            style={{
              flex: 1,
              background: "#ecf0f1",
              padding: 20,
            }}
          >
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

/* ===== MENU COMPONENT ===== */
function Menu({ href, label }: any) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        style={{
          padding: "10px",
          marginBottom: 10,
          borderRadius: 6,
          background: "#34495e",
          cursor: "pointer",
          color: "white",
        }}
      >
        {label}
      </div>
    </Link>
  );
}