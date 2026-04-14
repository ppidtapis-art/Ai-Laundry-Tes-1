"use client";
import { useEffect, useState } from "react";

type LayananItem = {
  nama: string;
  harga: number;
  berat: number;
};

type StatusType = "proses" | "selesai" | "diambil";

type Transaksi = {
  id: string;
  nomor: string;
  nama: string;
  wa: string;
  tanggal: string;
  tanggalSelesai: string;
  layanan: LayananItem[];
  total: number;
  status?: StatusType;
};

export default function RiwayatPage() {
  const [data, setData] = useState<Transaksi[]>([]);
  const [search, setSearch] = useState("");
  const [editData, setEditData] = useState<Transaksi | null>(null);

  useEffect(() => {
    const getData = localStorage.getItem("transaksi");
    if (getData) {
      const parsed: Transaksi[] = JSON.parse(getData);
      const withStatus = parsed.map((d) => ({
        ...d,
        status: d.status || "proses",
      }));
      setData([...withStatus].reverse());
    }
  }, []);

  const formatRupiah = (n: number) => n.toLocaleString("id-ID");

  const updateStatus = (id: string, status: StatusType) => {
    const updated = data.map((d) =>
      d.id === id ? { ...d, status } : d
    );
    setData(updated);
    localStorage.setItem("transaksi", JSON.stringify(updated));
  };

  const updateLayanan = (index: number, field: string, value: any) => {
    if (!editData) return;

    const newLayanan = [...editData.layanan];
    newLayanan[index] = {
      ...newLayanan[index],
      [field]: field === "harga" || field === "berat" ? Number(value) : value,
    };

    const total = newLayanan.reduce(
      (s, l) => s + l.harga * l.berat,
      0
    );

    setEditData({ ...editData, layanan: newLayanan, total });
  };

  const addLayanan = () => {
    if (!editData) return;
    setEditData({
      ...editData,
      layanan: [...editData.layanan, { nama: "", harga: 0, berat: 0 }],
    });
  };

  const removeLayanan = (index: number) => {
    if (!editData) return;
    const newLayanan = editData.layanan.filter((_, i) => i !== index);
    const total = newLayanan.reduce(
      (s, l) => s + l.harga * l.berat,
      0
    );
    setEditData({ ...editData, layanan: newLayanan, total });
  };

  const saveEdit = () => {
    if (!editData) return;

    const updated = data.map((d) =>
      d.id === editData.id ? editData : d
    );

    setData(updated);
    localStorage.setItem("transaksi", JSON.stringify(updated));
    setEditData(null);
  };

  const filtered = data.filter((d) =>
    d.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Riwayat Transaksi</h1>

      <input
        placeholder="Cari pelanggan..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      {/* MODAL EDIT */}
      {editData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-lg">
            <h2 className="font-bold mb-3">Edit Transaksi</h2>

            <input
              className="border p-2 rounded w-full mb-2"
              value={editData.nama}
              onChange={(e) =>
                setEditData({ ...editData, nama: e.target.value })
              }
            />

            <input
              className="border p-2 rounded w-full mb-3"
              value={editData.wa}
              onChange={(e) =>
                setEditData({ ...editData, wa: e.target.value })
              }
            />

            <h3 className="font-semibold mb-2">Layanan</h3>

            {editData.layanan.map((l, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                <input
                  placeholder="Nama"
                  className="border p-2 rounded"
                  value={l.nama}
                  onChange={(e) => updateLayanan(i, "nama", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Harga"
                  className="border p-2 rounded"
                  value={l.harga}
                  onChange={(e) => updateLayanan(i, "harga", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Kg"
                  className="border p-2 rounded"
                  value={l.berat}
                  onChange={(e) => updateLayanan(i, "berat", e.target.value)}
                />
                <button
                  onClick={() => removeLayanan(i)}
                  className="col-span-3 text-red-500 text-sm"
                >
                  Hapus Layanan
                </button>
              </div>
            ))}

            <button
              onClick={addLayanan}
              className="bg-gray-200 px-3 py-1 rounded mb-3"
            >
              + Tambah Layanan
            </button>

            <p className="font-bold mb-3">
              Total: Rp {editData.total.toLocaleString("id-ID")}
            </p>

            <div className="flex gap-2">
              <button onClick={saveEdit} className="bg-blue-600 text-white px-3 py-1 rounded">
                Simpan
              </button>
              <button onClick={() => setEditData(null)} className="bg-gray-400 text-white px-3 py-1 rounded">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIST */}
      <div className="space-y-4">
        {filtered.map((trx) => (
          <div key={trx.id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold">{trx.nama}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(trx.tanggal).toLocaleString()}
                </p>
              </div>
              <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                {trx.status}
              </span>
            </div>

            <div className="mt-2 text-sm">
              {trx.layanan.map((l, i) => (
                <div key={i}>
                  {l.nama} - {l.berat}kg
                </div>
              ))}
            </div>

            <p className="font-bold mt-2">
              Rp {formatRupiah(trx.total)}
            </p>

            <div className="flex gap-2 mt-3">
              <button onClick={() => setEditData(trx)} className="bg-yellow-500 text-white px-2 rounded">
                Edit
              </button>
              <button onClick={() => updateStatus(trx.id, "selesai")} className="bg-blue-500 text-white px-2 rounded">
                Selesai
              </button>
              <button onClick={() => updateStatus(trx.id, "diambil")} className="bg-green-500 text-white px-2 rounded">
                Diambil
              </button>
              <button
                onClick={() => {
                  const updated = data.filter((d) => d.id !== trx.id);
                  setData(updated);
                  localStorage.setItem("transaksi", JSON.stringify(updated));
                }}
                className="bg-red-500 text-white px-2 rounded"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
