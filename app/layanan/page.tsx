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

  const [editId, setEditId] = useState<number | null>(null);

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("layanan") || "[]");
    setData(saved);
  }, []);

  /* ===== SIMPAN / UPDATE ===== */
  const simpan = () => {
    if (!nama || harga <= 0 || estimasiHari <= 0) {
      alert("Semua data wajib diisi dengan benar");
      return;
    }

    // MODE EDIT
    if (editId !== null) {
      const updated = data.map((item) =>
        item.id === editId
          ? { ...item, nama, harga, tipe, estimasiHari }
          : item
      );

      setData(updated);
      localStorage.setItem("layanan", JSON.stringify(updated));

      resetForm();
      return;
    }

    // MODE TAMBAH
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

    resetForm();
  };

  /* ===== EDIT ===== */
  const edit = (item: Layanan) => {
    setEditId(item.id);
    setNama(item.nama);
    setHarga(item.harga);
    setTipe(item.tipe);
    setEstimasiHari(item.estimasiHari);
  };

  /* ===== HAPUS ===== */
  const hapus = (id: number) => {
    const updated = data.filter((x) => x.id !== id);
    setData(updated);
    localStorage.setItem("layanan", JSON.stringify(updated));
  };

  /* ===== RESET ===== */
  const resetForm = () => {
    setEditId(null);
    setNama("");
    setHarga(0);
    setTipe("kg");
    setEstimasiHari(1);
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
          <h3>
            {editId ? "✏️ Edit Layanan" : "➕ Tambah Layanan"}
          </h3>

          {/* NAMA */}
          <div>
            <label><b>Nama Layanan</b></label>
            <input
              style={{ width: "100%", padding: 8, marginTop: 5 }}
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>

          {/* TIPE */}
          <div>
            <label><b>Tipe Harga</b></label>
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
            <label><b>Harga</b></label>
            <input
              type="number"
              style={{ width: "100%", padding: 8, marginTop: 5 }}
              value={harga}
              onChange={(e) => setHarga(Number(e.target.value))}
            />
          </div>

          {/* ESTIMASI */}
          <div>
            <label><b>Estimasi (Hari)</b></label>
            <input
              type="number"
              style={{ width: "100%", padding: 8, marginTop: 5 }}
              value={estimasiHari}
              onChange={(e) => setEstimasiHari(Number(e.target.value))}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={simpan}
              style={{
                padding: 10,
                background: editId ? "#f39c12" : "#27ae60",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {editId ? "Update" : "Simpan"}
            </button>

            {editId && (
              <button
                onClick={resetForm}
                style={{
                  padding: 10,
                  background: "#7f8c8d",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                }}
              >
                Batal
              </button>
            )}
          </div>
        </div>

        {/* ===== TABEL ===== */}
        <table width="100%" cellPadding={10}>
          <thead style={{ background: "#2c3e50", color: "white" }}>
            <tr>
              <th>Nama</th>
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
                <td style={{ display: "flex", gap: 5 }}>
                  <button
                    onClick={() => edit(l)}
                    style={{
                      background: "#3498db",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: 5,
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => hapus(l.id)}
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: 5,
                      cursor: "pointer",
                    }}
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