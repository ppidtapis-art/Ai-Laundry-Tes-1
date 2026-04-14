"use client";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* ===== SIDEBAR ===== */}
      <div style={{
        width: 220,
        background: "#2c3e50",
        color: "white",
        padding: 20
      }}>
        <h2 style={{ marginBottom: 20 }}>Laundry POS</h2>

        <MenuItem href="/" label="Dashboard" />
        <MenuItem href="/transaksi" label="Transaksi" />
        <MenuItem href="/riwayat" label="Riwayat" />
        <MenuItem href="/layanan" label="Layanan" />
        <MenuItem href="/pelanggan" label="Pelanggan" />
      </div>

      {/* ===== CONTENT ===== */}
      <div style={{ flex: 1, padding: 20, background: "#ecf0f1" }}>
        <h2>Dashboard</h2>
        <p>Ringkasan usaha hari ini</p>

        {/* CARD */}
        <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
          <Card title="Omzet Hari Ini" value="Rp 0" color="#2ecc71" />
          <Card title="Transaksi Hari Ini" value="0" />
          <Card title="Sedang Diproses" value="0" />
          <Card title="Siap Diambil" value="0" />
          <Card title="Sudah Diambil" value="0" />
        </div>

        {/* BUTTON */}
        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <Link href="/transaksi">
            <button style={btnStyle}>➕ Transaksi Baru</button>
          </Link>
          <Link href="/riwayat">
            <button style={btnStyle}>📋 Lihat Riwayat</button>
          </Link>
          <Link href="/riwayat">
            <button style={btnStyle}>🧾 Cetak Nota</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ===== COMPONENT MENU ===== */
function MenuItem({ href, label }: { href: string; label: string }) {
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

/* ===== COMPONENT CARD ===== */
function Card({ title, value, color }: any) {
  return (
    <div style={{
      background: color || "#fff",
      padding: 15,
      borderRadius: 10,
      minWidth: 180,
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    }}>
      <div>{title}</div>
      <h3>{value}</h3>
    </div>
  );
}

/* ===== STYLE ===== */
const btnStyle = {
  padding: "10px 15px",
  background: "#3498db",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};