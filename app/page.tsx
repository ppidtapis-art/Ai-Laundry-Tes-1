"use client";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>

          {/* ===== SIDEBAR GLOBAL ===== */}
          <div style={{
            width: 220,
            background: "#2c3e50",
            color: "white",
            padding: 20,
            position: "sticky",
            top: 0,
            height: "100vh",
            zIndex: 10
          }}>
            <h2 style={{ marginBottom: 20 }}>Laundry POS</h2>

            <Menu href="/" label="Dashboard" />
            <Menu href="/transaksi" label="Transaksi" />
            <Menu href="/riwayat" label="Riwayat" />
            <Menu href="/layanan" label="Layanan" />
            <Menu href="/pelanggan" label="Pelanggan" />
          </div>

          {/* ===== CONTENT DINAMIS ===== */}
          <div style={{
            flex: 1,
            background: "#ecf0f1",
            padding: 20
          }}>
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
      <div style={{
        padding: "10px",
        borderRadius: 6,
        marginBottom: 10,
        cursor: "pointer",
        background: "#34495e"
      }}>
        {label}
      </div>
    </Link>
  );
}