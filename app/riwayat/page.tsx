"use client";
import { useEffect, useState } from "react";

type Item = {
  id: string;
  nama: string;
  harga: number;
  tipe: "kg" | "item";
  qty: number;
  berat?: number;
};

type Transaksi = {
  id: string;
  nomor: string;
  nama: string;
  wa: string;
  items: Item[];
  total: number;
  status: "Proses" | "Selesai";
  tanggal: string;
  tanggalSelesai: string;

  // 🔥 TAMBAHAN BIAR SINKRON
  subtotal?: number;
  bonusKg?: number;
  diskonReward?: number;
};

export default function RiwayatPage() {
  const [layanan, setLayanan] = useState<any[]>([]);

  const [data, setData] = useState<Transaksi[]>([]);
  const [filter, setFilter] = useState("Semua");
  const [search, setSearch] = useState("");
  const [editData, setEditData] = useState<Transaksi | null>(null);

  useEffect(() => {
    loadData();

    // 🔥 TAMBAHKAN INI
    const dataLayanan = JSON.parse(localStorage.getItem("layanan") || "[]");
    setLayanan(dataLayanan);

  }, []);

  const loadData = () => {
    const trx = JSON.parse(localStorage.getItem("transaksi") || "[]");
    setData(trx);
  };

  const save = (newData: Transaksi[]) => {
    setData(newData);
    localStorage.setItem("transaksi", JSON.stringify(newData));
  };

  const formatRp = (n: number) =>
    "Rp " + (n || 0).toLocaleString("id-ID");

  const formatTanggal = (tgl: string) =>
    new Date(tgl).toLocaleDateString("id-ID");

  /* ===============================
     🔥 FIX: ID STRING (BUG KRUSIAL)
  =============================== */
  const updateStatus = (id: string) => {
    save(data.map(x => x.id === id ? { ...x, status: "Selesai" } : x));
  };

  const hapus = (id: string) => {
    if (!confirm("Hapus transaksi?")) return;
    save(data.filter(x => x.id !== id));
  };

  /* ===============================
     🔥 HITUNG ULANG TOTAL TANPA REWARD
     (BIAR TIDAK DISALAHGUNAKAN)
  =============================== */
  const hitungTotal = (items: Item[]) => {
    return items.reduce((s, x) => {
      return s + (x.tipe === "kg"
        ? x.harga * (x.berat || 0)
        : x.harga * x.qty);
    }, 0);
  };

  const simpanEdit = () => {
    if (!editData) return;

    const newSubtotal = hitungTotal(editData.items);

    const updated = data.map(x =>
      x.id === editData.id
        ? {
            ...editData,
            subtotal: newSubtotal,
            total: newSubtotal, // 🔥 NO REWARD RE-CALC
          }
        : x
    );

    save(updated);
    setEditData(null);
  };

  const updateItem = (index: number, field: string, value: number) => {
    if (!editData) return;

    const newItems = [...editData.items];
    // @ts-ignore
    newItems[index][field] = value;

    setEditData({ ...editData, items: newItems });
  };

  const filtered = data
    .filter(x => filter === "Semua" || x.status === filter)
    .filter(x =>
      x.nama.toLowerCase().includes(search.toLowerCase()) ||
      x.nomor.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto bg-gray-100 min-h-screen">

      {/* FILTER */}
      <div className="bg-white p-4 rounded shadow flex gap-2 flex-wrap">
        <input
          className="border p-2 flex-1 min-w-[150px]"
          placeholder="Cari..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="border p-2"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option>Semua</option>
          <option>Proses</option>
          <option>Selesai</option>
        </select>
      </div>

      {/* LIST */}
      <div className="space-y-3 mt-3">
        {filtered.map(x => (
          <div key={x.id} className="bg-white p-4 rounded shadow">

            <div className="flex justify-between">
              <div>
                <div className="font-bold">{x.nama}</div>
                <div className="text-sm">{x.nomor}</div>
              </div>
              <div className={`px-2 py-1 rounded text-sm ${
                x.status === "Selesai"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {x.status}
              </div>
            </div>

            <div className="text-sm mt-2">
              Masuk: {formatTanggal(x.tanggal)} <br />
              Selesai: {x.tanggalSelesai}
            </div>

            {/* 🔥 INFO REWARD */}
            {x.bonusKg ? (
              <div className="text-green-600 text-sm mt-1">
                🎁 Bonus {x.bonusKg} kg
              </div>
            ) : null}

            <div className="mt-2 font-bold">
              {formatRp(x.total)}
            </div>

            {/* ACTION */}
            <div className="flex gap-2 mt-3 flex-wrap">
              <button onClick={() => window.location.href=`/nota?id=${x.id}`} className="bg-blue-600 text-white p-2 rounded flex-1">Nota</button>
              <button onClick={() => setEditData(x)} className="bg-yellow-500 text-white p-2 rounded flex-1">Edit</button>
              <button onClick={() => hapus(x.id)} className="bg-red-600 text-white p-2 rounded flex-1">Hapus</button>
              {x.status === "Proses" && (
                <button onClick={() => updateStatus(x.id)} className="bg-green-600 text-white p-2 rounded flex-1">Selesai</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ===============================
         🔥 MODAL EDIT (FIX MOBILE!)
      =============================== */}
      {editData && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-end md:items-center">

          {/* 🔥 FULL WIDTH MOBILE */}
          <div className="bg-white p-4 rounded-t-xl md:rounded w-full md:max-w-xl max-h-[90vh] overflow-auto">

            <h2 className="font-bold mb-3 text-lg">Edit Transaksi</h2>

            {/* BASIC */}
            <textarea
              className="border p-2 w-full mb-2"
              rows={2}
              value={editData.nama}
              onChange={e => setEditData({...editData, nama:e.target.value})}
              placeholder="Nama"
            />

            <input
              className="border p-2 w-full mb-2"
              value={editData.wa}
              onChange={e => setEditData({...editData, wa:e.target.value})}
              placeholder="WA"
            />

            {/* 🔥 TANGGAL */}
            <input
              type="date"
              className="border p-2 w-full mb-2"
              value={editData.tanggal?.slice(0,10)}
              onChange={e =>
                setEditData({
                  ...editData,
                  tanggal: new Date(e.target.value).toISOString(),
                })
              }
            />

            <input
              type="date"
              className="border p-2 w-full mb-2"
              value={editData.tanggalSelesai?.slice(0,10)}
              onChange={e =>
                setEditData({
                  ...editData,
                  tanggalSelesai: new Date(e.target.value).toISOString(),
                })
              }
            />

            {/* ITEMS */}
            <div className="mt-3 space-y-2">
              {editData.items.map((it, i) => (
                <div key={i} className="border p-3 rounded">

                  <div className="font-medium">{it.nama}</div>

                  {it.tipe === "kg" ? (
                    <input
                      type="number"
                      className="border p-2 w-full mt-2"
                      value={it.berat}
                      onChange={e => updateItem(i, "berat", Number(e.target.value))}
                    />
                  ) : (
                    <input
                      type="number"
                      className="border p-2 w-full mt-2"
                      value={it.qty}
                      onChange={e => updateItem(i, "qty", Number(e.target.value))}
                    />
                  )}

                  <div className="text-sm mt-1">
                    {formatRp(it.harga)}
                  </div>

                  {/* 🔥 HAPUS ITEM */}
                  <button
                    onClick={() => {
                      const newItems = editData.items.filter((_, idx) => idx !== i);
                      setEditData({ ...editData, items: newItems });
                    }}
                    className="bg-red-500 text-white px-2 py-1 mt-2 rounded"
                  >
                    Hapus
                  </button>

                </div>
              ))}
            </div>

            <select
            className="border p-2 w-full mt-3"
            onChange={(e) => {
              const l = layanan.find(x => x.id == e.target.value);
              if (!l || !editData) return;

              setEditData({
                ...editData,
                items: [
                  ...editData.items,
                  {
                    ...l,
                    qty: 1,
                    berat: l.tipe === "kg" ? 1 : undefined
                  }
                ]
              });

              e.target.value = ""; // reset dropdown
            }}
          >
            <option value="">+ Tambah Layanan</option>
            {layanan.map(l => (
              <option key={l.id} value={l.id}>
                {l.nama} - {formatRp(l.harga)}
              </option>
            ))}
          </select>

            {/* ACTION */}
            <div className="flex gap-2 mt-4">
              <button onClick={simpanEdit} className="bg-green-600 text-white p-3 flex-1 rounded">
                Simpan
              </button>
              <button onClick={()=>setEditData(null)} className="bg-gray-400 text-white p-3 flex-1 rounded">
                Batal
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}