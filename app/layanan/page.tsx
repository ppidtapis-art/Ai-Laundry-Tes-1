"use client";
import { useState, useEffect } from "react";

/* ================= TYPES ================= */
type TipeHarga = "kg" | "item";

type Kategori = "reguler" | "express" | "kilat";

type Layanan = {
  id: number;
  nama: string;
  harga: number;
  tipe: TipeHarga;
  estimasiHari: number;
  kategori: Kategori;
  diskon: number; // %
  aktif: boolean;
};

/* ================= COMPONENT ================= */
export default function LayananPage() {
  const [data, setData] = useState<Layanan[]>([]);

  const [form, setForm] = useState<Layanan>({
    id: 0,
    nama: "",
    harga: 0,
    tipe: "kg",
    estimasiHari: 1,
    kategori: "reguler",
    diskon: 0,
    aktif: true,
  });

  const [editId, setEditId] = useState<number | null>(null);

  /* ================= LOAD + FIX ================= */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("layanan") || "[]");

    const fixed = saved.map((item: any, i: number) => ({
      id: item.id || Date.now() + i,
      nama: item.nama || "-",
      harga: Number(item.harga) || 0,
      tipe: item.tipe === "item" ? "item" : "kg",
      estimasiHari: Number(item.estimasiHari) || 1,
      kategori: item.kategori || "reguler",
      diskon: Number(item.diskon) || 0,
      aktif: item.aktif !== false,
    }));

    setData(fixed);
    localStorage.setItem("layanan", JSON.stringify(fixed));
  }, []);

  /* ================= SAVE ================= */
  const simpan = () => {
    if (!form.nama || form.harga <= 0) {
      alert("Isi data dengan benar");
      return;
    }

    if (editId !== null) {
      const updated = data.map((d) =>
        d.id === editId ? form : d
      );
      setData(updated);
      localStorage.setItem("layanan", JSON.stringify(updated));
      reset();
      return;
    }

    const newData = { ...form, id: Date.now() };
    const updated = [...data, newData];

    setData(updated);
    localStorage.setItem("layanan", JSON.stringify(updated));
    reset();
  };

  /* ================= EDIT ================= */
  const edit = (item: Layanan) => {
    setEditId(item.id);
    setForm(item);
  };

  /* ================= DELETE ================= */
  const hapus = (id: number) => {
    const updated = data.filter((d) => d.id !== id);
    setData(updated);
    localStorage.setItem("layanan", JSON.stringify(updated));
  };

  /* ================= RESET ================= */
  const reset = () => {
    setEditId(null);
    setForm({
      id: 0,
      nama: "",
      harga: 0,
      tipe: "kg",
      estimasiHari: 1,
      kategori: "reguler",
      diskon: 0,
      aktif: true,
    });
  };

  /* ================= FORMAT ================= */
  const rp = (n: number) => n.toLocaleString("id-ID");

  const hitungHarga = (l: Layanan) => {
    const diskon = (l.harga * l.diskon) / 100;
    return l.harga - diskon;
  };

  /* ================= UI ================= */
  return (
    <div style={{ padding: 20, background: "#f4f6f8", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1000, margin: "auto" }}>
        <h2>🧺 Layanan Laundry (Flexible System)</h2>

        {/* FORM */}
        <div style={{ background: "#fff", padding: 15, borderRadius: 10 }}>
          <h3>{editId ? "Edit Layanan" : "Tambah Layanan"}</h3>

          <div style={{ display: "grid", gap: 10 }}>
            <input
              placeholder="Nama layanan"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />

            <input
              type="number"
              placeholder="Harga"
              value={form.harga}
              onChange={(e) =>
                setForm({ ...form, harga: Number(e.target.value) })
              }
            />

            <select
              value={form.tipe}
              onChange={(e) =>
                setForm({ ...form, tipe: e.target.value as TipeHarga })
              }
            >
              <option value="kg">Per Kg</option>
              <option value="item">Per Item</option>
            </select>

            <input
              type="number"
              placeholder="Estimasi hari"
              value={form.estimasiHari}
              onChange={(e) =>
                setForm({ ...form, estimasiHari: Number(e.target.value) })
              }
            />

            {/* KATEGORI */}
            <select
              value={form.kategori}
              onChange={(e) =>
                setForm({ ...form, kategori: e.target.value as Kategori })
              }
            >
              <option value="reguler">Reguler</option>
              <option value="express">Express</option>
              <option value="kilat">Kilat</option>
            </select>

            {/* DISKON */}
            <input
              type="number"
              placeholder="Diskon (%)"
              value={form.diskon}
              onChange={(e) =>
                setForm({ ...form, diskon: Number(e.target.value) })
              }
            />

            {/* AKTIF */}
            <label>
              <input
                type="checkbox"
                checked={form.aktif}
                onChange={(e) =>
                  setForm({ ...form, aktif: e.target.checked })
                }
              />
              Aktif
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={simpan}>
                {editId ? "Update" : "Simpan"}
              </button>

              {editId && <button onClick={reset}>Batal</button>}
            </div>
          </div>
        </div>

        {/* LIST */}
        <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
          {data.map((l) => (
            <div
              key={l.id}
              style={{
                background: l.aktif ? "#fff" : "#eee",
                padding: 12,
                borderRadius: 10,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <b>{l.nama}</b>
                <div style={{ fontSize: 12 }}>
                  {l.kategori.toUpperCase()} • {l.tipe} • {l.estimasiHari} hari
                </div>

                <div>
                  Rp {rp(hitungHarga(l))}
                  {l.diskon > 0 && (
                    <span style={{ color: "red", marginLeft: 8 }}>
                      (-{l.diskon}%)
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 5 }}>
                <button onClick={() => edit(l)}>Edit</button>
                <button onClick={() => hapus(l.id)}>Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}