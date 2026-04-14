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
  diskon: number;
  aktif: boolean;
};

/* ================= COMPONENT ================= */
export default function LayananPage() {
  const [data, setData] = useState<Layanan[]>([]);
  const [search, setSearch] = useState("");

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

  /* ================= LOAD ================= */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("layanan") || "[]");
    setData(saved);
  }, []);

  /* ================= SAVE ================= */
  const simpan = () => {
    if (!form.nama || form.harga <= 0) {
      alert("Isi data dengan benar");
      return;
    }

    if (form.diskon > 100) {
      alert("Diskon maksimal 100%");
      return;
    }

    if (editId !== null) {
      const updated = data.map((d) => (d.id === editId ? form : d));
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

  /* ================= ACTION ================= */
  const edit = (item: Layanan) => {
    setEditId(item.id);
    setForm(item);
  };

  const hapus = (id: number) => {
    const updated = data.filter((d) => d.id !== id);
    setData(updated);
    localStorage.setItem("layanan", JSON.stringify(updated));
  };

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

  /* ================= HELPER ================= */
  const rp = (n: number) => n.toLocaleString("id-ID");

  const hitungHarga = (l: Layanan) => {
    const diskon = (l.harga * l.diskon) / 100;
    return l.harga - diskon;
  };

  const filtered = data.filter((d) =>
    d.nama.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        <h1 className="text-2xl font-bold">🧺 Manajemen Layanan Laundry</h1>

        {/* FORM */}
        <div className="bg-white p-5 rounded-2xl shadow space-y-4">
          <h2 className="font-semibold text-lg">
            {editId ? "Edit Layanan" : "Tambah Layanan"}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">

            <div>
              <label className="text-sm font-semibold">Nama</label>
              <input
                className="w-full border rounded-lg p-2"
                value={form.nama}
                onChange={(e) =>
                  setForm({ ...form, nama: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Harga</label>
              <input
                type="number"
                className="w-full border rounded-lg p-2"
                value={form.harga}
                onChange={(e) =>
                  setForm({ ...form, harga: Number(e.target.value) })
                }
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Tipe</label>
              <select
                className="w-full border rounded-lg p-2"
                value={form.tipe}
                onChange={(e) =>
                  setForm({ ...form, tipe: e.target.value as TipeHarga })
                }
              >
                <option value="kg">Per Kg</option>
                <option value="item">Per Item</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">Estimasi (Hari)</label>
              <input
                type="number"
                className="w-full border rounded-lg p-2"
                value={form.estimasiHari}
                onChange={(e) =>
                  setForm({
                    ...form,
                    estimasiHari: Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Kategori</label>
              <select
                className="w-full border rounded-lg p-2"
                value={form.kategori}
                onChange={(e) =>
                  setForm({
                    ...form,
                    kategori: e.target.value as Kategori,
                  })
                }
              >
                <option value="reguler">Reguler</option>
                <option value="express">Express</option>
                <option value="kilat">Kilat</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">Diskon (%)</label>
              <input
                type="number"
                className="w-full border rounded-lg p-2"
                value={form.diskon}
                onChange={(e) =>
                  setForm({ ...form, diskon: Number(e.target.value) })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.aktif}
                onChange={(e) =>
                  setForm({ ...form, aktif: e.target.checked })
                }
              />
              <span>Aktif</span>
            </div>

          </div>

          <div className="flex gap-2">
            <button
              onClick={simpan}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              {editId ? "Update" : "Simpan"}
            </button>

            {editId && (
              <button
                onClick={reset}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg"
              >
                Batal
              </button>
            )}
          </div>
        </div>

        {/* SEARCH */}
        <input
          placeholder="Cari layanan..."
          className="w-full border p-2 rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* LIST */}
        <div className="grid gap-3">
          {filtered.map((l) => (
            <div
              key={l.id}
              className={`p-4 rounded-xl shadow flex justify-between ${
                l.aktif ? "bg-white" : "bg-gray-200"
              }`}
            >
              <div>
                <div className="font-bold">{l.nama}</div>
                <div className="text-sm text-gray-500">
                  {l.kategori.toUpperCase()} • {l.tipe} • {l.estimasiHari} hari
                </div>
                <div className="mt-1">
                  Rp {rp(hitungHarga(l))}
                  {l.diskon > 0 && (
                    <span className="text-red-500 ml-2">
                      -{l.diskon}%
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => edit(l)}
                  className="bg-yellow-400 px-3 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => hapus(l.id)}
                  className="bg-red-500 text-white px-3 rounded"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
