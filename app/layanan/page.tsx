"use client";
import { useState, useEffect } from "react";

/* ===== TYPES ===== */
type TipeHarga = "kg" | "item";

type Layanan = {
  id: number;
  nama: string;
  harga: number;
  tipe: TipeHarga;
  estimasiHari: number;
};

export default function LayananPage() {
  const [data, setData] = useState<Layanan[]>([]);

  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState(0);
  const [tipe, setTipe] = useState<TipeHarga>("kg");
  const [estimasiHari, setEstimasiHari] = useState(1);

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("layanan") || "[]");
    setData(saved);
  }, []);

  /* ===== SIMPAN ===== */
  const simpan = () => {
    if (!nama || harga <= 0 || estimasiHari <= 0) {
      alert("Semua data wajib diisi dengan benar");
      return;
    }

    const newData: Layanan = {
      id: Date.now(),
      nama,
      harga,
      tipe,
      estimasiHari,
    };

    const updated = [...data, newData];
    setData(updated);
    localStorage.setItem("layanan", JSON.stringify(updated));

    /* RESET FORM */
    setNama("");
    setHarga(0);
    setEstimasiHari(1);
  };

  /* ===== HAPUS ===== */
  const hapus = (id: number) => {
    const updated = data.filter((x) => x.id !== id);
    setData(updated);
    localStorage.setItem("layanan", JSON.stringify(updated));
  };

  const formatRp = (n: number) => n.toLocaleString("id-ID");

  /* ===== UI ===== */
  return (
    <div style={{ padding: 20, background: "#f4f6f8", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: 900,
          margin: "auto",
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <h2>🧺 Manajemen Layanan Laundry</h2>

        {/* ===== FORM ===== */}
        <div
          style={{
            display: "grid",
            gap: 16,
            marginTop: 20,
            marginBottom: 25,
            padding: 15,
            border: "1px solid #ddd",
            borderRadius: 10,
            background: "#fafafa",
          }}
        >
          <h3>➕ Tambah Layanan</h3>

          {/* NAMA */}
          <div>
            <label style={{ fontWeight: "bold" }}>Nama Layanan</label>
            <input
              style={{ width: "100%", padding: 8, marginTop: 5 }}
              placeholder="Contoh: Cuci Setrika"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>

          {/* TIPE */}
          <div>
            <label style={{ fontWeight: "bold" }}>Tipe Harga</label>
            <select
              style={{ width: "100%", padding: 8, marginTop: 5 }}
              value={tipe}
              onChange={(e) => setTipe(e.target.value as TipeHarga)}
            >
              <option value="kg">Per Kg</option>
              <option value="item">Per Item</option>
            </select>
          </div>

          {/* HARGA */}
          <div>
            <label style={{ fontWeight: "bold" }}>Harga (Rp)</label>
            <input
              type="number"
              style={{ width: "100%", padding: 8, marginTop: 5 }}
              placeholder="Contoh: 7000"
              value={harga}
              onChange={(e) => setHarga(Number(e.target.value))}
            />
          </div>

          {/* ESTIMASI */}
          <div>
            <label style={{ fontWeight: "bold" }}>
              Estimasi Selesai (Hari)
            </label>
            <input
              type="number"
              style={{ width: "100%", padding: 8, marginTop: 5 }}
              placeholder="Contoh: 3"
              value={estimasiHari}
              onChange={(e) => setEstimasiHari(Number(e.target.value))}
            />
          </div>

          <button
            style={{
              padding: 10,
              background: "#27ae60",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={simpan}
          >
            💾 Simpan Layanan
          </button>
        </div>

        {/* ===== TABEL ===== */}
        <table width="100%" cellPadding={10}>
          <thead style={{ background: "#2c3e50", color: "white" }}>
            <tr>
              <th>Nama Layanan</th>
              <th>Tipe</th>
              <th>Harga</th>
              <th>Estimasi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((l) => (
              <tr key={l.id} style={{ borderBottom: "1px solid #eee" }}>
                <td>{l.nama}</td>
                <td>{l.tipe === "kg" ? "Per Kg" : "Per Item"}</td>
                <td>Rp {formatRp(l.harga)}</td>
                <td>{l.estimasiHari} Hari</td>
                <td>
                  <button
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: 5,
                      cursor: "pointer",
                    }}
                    onClick={() => hapus(l.id)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}