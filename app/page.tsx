"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const menu = [
    { nama: "Transaksi", path: "/transaksi", warna: "#27ae60", icon: "💰" },
    { nama: "Riwayat", path: "/riwayat", warna: "#2980b9", icon: "📋" },
    { nama: "Layanan", path: "/layanan", warna: "#f39c12", icon: "🧺" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f6fa",
        padding: "15px",
        fontFamily: "sans-serif",
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <h2 style={{ margin: 0 }}>APLIKASI LAUNDRY</h2>
        <p style={{ margin: 0, color: "#555" }}>Siap Digunakan di HP Kasir</p>
      </div>

      {/* MENU UTAMA */}
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {menu.map((item, index) => (
          <button
            key={index}
            onClick={() => router.push(item.path)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              padding: "18px",
              backgroundColor: item.warna,
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            <span style={{ fontSize: "22px" }}>{item.icon}</span>
            {item.nama}
          </button>
        ))}
      </div>
    </div>
  );
}