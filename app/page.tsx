"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>

          {/* ===== SIDEBAR ===== */}
          <div style={{
            width: 220,
            background: "#2c3e50",
            color: "white",
            padding: 20,
            position: "sticky",
            top: 0,
            height: "100vh",
          }}>
            <h2 style={{ marginBottom: 20 }}>Laundry POS</h2>

            <Menu href="/" label="Dashboard" active={pathname === "/"} />
            <Menu href="/transaksi" label="Transaksi" active={pathname === "/transaksi"} />
            <Menu href="/riwayat" label="Riwayat" active={pathname === "/riwayat"} />
            <Menu href="/layanan" label="Layanan" active={pathname === "/layanan"} />
            <Menu href="/pelanggan" label="Pelanggan" active={pathname === "/pelanggan"} />
          </div>

          {/* ===== CONTENT ===== */}
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

/* ===== MENU COMPONENT ===== */
function Menu({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        padding: "10px",
        borderRadius: 6,
        marginBottom: 10,
        cursor: "pointer",
        background: active ? "#1abc9c" : "#34495e",
        transition: "0.2s"
      }}>
        {label}
      </div>
    </Link>
  );
}