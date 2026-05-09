"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { useState } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body style={{ margin: 0 }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>

          {/* ===== MOBILE TOPBAR ===== */}
          <div className="mobileTopbar">
            <button
              onClick={() => setOpen(!open)}
              className="menuButton"
            >
              ☰
            </button>

            <span>Ai Laundry</span>
          </div>

          {/* ===== SIDEBAR ===== */}
          <div className={`sidebar ${open ? "showSidebar" : ""}`}>
            <h2 style={{ marginBottom: 20 }}>Ai Laundry</h2>

            <Menu href="/" label="Dashboard" />
            <Menu href="/transaksi" label="Transaksi" />
            <Menu href="/riwayat" label="Riwayat" />
            <Menu href="/layanan" label="Layanan" />
            <Menu href="/pelanggan" label="Pelanggan" />
            <Menu href="/laporan" label="Laporan" />
          </div>

          {/* ===== CONTENT ===== */}
          <div className="content">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

/* ===== MENU ===== */
function Menu({ href, label }: any) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div className="menuItem">
        {label}
      </div>
    </Link>
  );
}