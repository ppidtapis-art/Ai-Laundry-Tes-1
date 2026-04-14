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
  status: StatusType;
};

export default function RiwayatPage() {
  const [data, setData] = useState<Transaksi[]>([]);
  const [search, setSearch] = useState("");
  const [editData, setEditData] = useState<Transaksi | null>(null);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const getData = localStorage.getItem("transaksi");
    if (getData) {
      const parsed = JSON.parse(getData);

      const fixed = parsed.map((d: any, i: number) => {
        let tanggal = d.tanggal;

        if (!tanggal || isNaN(new Date(tanggal).getTime())) {
          if (typeof tanggal === "string" && tanggal.includes("/")) {
            const [dd, mm, yyyy] = tanggal.split("/");
            tanggal = `${yyyy}-${mm}-${dd}`;
          } else {
            tanggal = new Date().toISOString();
          }
        }

        return {
          id: d.id || i.toString(),
          nomor: d.nomor || "-",
          nama: d.nama || "-",
          wa: d.wa || "-",
          tanggal,
          tanggalSelesai: d.tanggalSelesai || tanggal,
          layanan: d.layanan || [],
          total: Number(d.total) || 0,
          status: d.status || "proses",
        };
      });

      setData([...fixed].reverse());
    }
  }, []);

  /* ================= FORMAT ================= */
  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID").format(n);

  const formatTanggal = (tgl: string) => {
    const d = new Date(tgl);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toInputDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toISOString().slice(0, 16);
  };

  const getStatusColor = (status: StatusType) => {
    if (status === "proses") return "bg-yellow-400";
    if (status === "selesai") return "bg-blue-500";
    return "bg-green-500";
  };

  /* ================= UPDATE ================= */
  const saveEdit = () => {
    if (!editData) return;

    const updated = data.map((d) =>
      d.id === editData.id ? editData : d
    );

    setData(updated);
    localStorage.setItem("transaksi", JSON.stringify(updated));
    setEditData(null);
  };

  /* ================= LAYANAN ================= */
  const updateLayanan = (index: number, field: string, value: any) => {
    if (!editData) return;

    const newLayanan = [...editData.layanan];
    newLayanan[index] = {
      ...newLayanan[index],
      [field]: field === "harga" || field === "berat" ? Number(value) : value,
    };

    const total = newLayanan.reduce((s, l) => s + l.harga * l.berat, 0);

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
    const total = newLayanan.reduce((s, l) => s + l.harga * l.berat, 0);

    setEditData({ ...editData, layanan: newLayanan, total });
  };

  /* ================= FILTER ================= */
  const filtered = data.filter((d) =>
    d.nama.toLowerCase().includes(search.toLowerCase())
  );

  const total = filtered.reduce((s, d) => s + d.total, 0);

  /* ================= CETAK NOTA ================= */
  const cetakNota = (trx: Transaksi) => {
    localStorage.setItem("printData", JSON.stringify(trx));
    window.open("/nota", "_blank");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📋 Riwayat Transaksi</h1>

      <input
        placeholder="Cari pelanggan..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-3 rounded w-full mb-4"
      />

      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Total Omzet</p>
          <p className="font-bold text-lg">
            Rp {formatRupiah(total)}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Transaksi</p>
          <p className="font-bold text-lg">{filtered.length}</p>
        </div>
      </div>

      {/* MODAL EDIT */}
      {editData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-lg space-y-3">
            <h2 className="font-bold text-lg">Edit Transaksi</h2>

            <input
              className="border p-2 rounded w-full"
              value={editData.nama}
              onChange={(e) =>
                setEditData({ ...editData, nama: e.target.value })
              }
            />

            <input
              className="border p-2 rounded w-full"
              value={editData.wa}
              onChange={(e) =>
                setEditData({ ...editData, wa: e.target.value })
              }
            />

            {/* 🔥 TANGGAL MASUK */}
            <label className="text-sm">Tanggal Masuk</label>
            <input
              type="datetime-local"
              className="border p-2 rounded w-full"
              value={toInputDateTime(editData.tanggal)}
              onChange={(e) =>
                setEditData({ ...editData, tanggal: e.target.value })
              }
            />

            {/* 🔥 TANGGAL SELESAI (FIX UTAMA) */}
            <label className="text-sm">Tanggal Selesai</label>
            <input
              type="datetime-local"
              className="border p-2 rounded w-full"
              value={toInputDateTime(editData.tanggalSelesai)}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  tanggalSelesai: e.target.value,
                })
              }
            />

            {/* STATUS */}
            <select
              className="border p-2 rounded w-full"
              value={editData.status}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  status: e.target.value as StatusType,
                })
              }
            >
              <option value="proses">Proses</option>
              <option value="selesai">Selesai</option>
              <option value="diambil">Diambil</option>
            </select>

            <h3 className="font-semibold">Layanan</h3>

            {editData.layanan.map((l, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <input
                  className="border p-2 rounded"
                  value={l.nama}
                  onChange={(e) =>
                    updateLayanan(i, "nama", e.target.value)
                  }
                />
                <input
                  type="number"
                  className="border p-2 rounded"
                  value={l.harga}
                  onChange={(e) =>
                    updateLayanan(i, "harga", e.target.value)
                  }
                />
                <input
                  type="number"
                  className="border p-2 rounded"
                  value={l.berat}
                  onChange={(e) =>
                    updateLayanan(i, "berat", e.target.value)
                  }
                />
                <button
                  onClick={() => removeLayanan(i)}
                  className="col-span-3 text-red-500 text-sm"
                >
                  Hapus
                </button>
              </div>
            ))}

            <button
              onClick={addLayanan}
              className="bg-gray-200 px-3 py-1 rounded"
            >
              + Tambah Layanan
            </button>

            <p className="font-bold">
              Total: Rp {formatRupiah(editData.total)}
            </p>

            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Simpan
              </button>
              <button
                onClick={() => setEditData(null)}
                className="bg-gray-400 text-white px-3 py-1 rounded"
              >
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
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">{trx.nama}</h3>
                <p className="text-xs text-gray-500">
                  Masuk: {formatTanggal(trx.tanggal)}
                </p>
                <p className="text-xs text-gray-500">
                  Selesai: {formatTanggal(trx.tanggalSelesai)}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded text-white text-sm ${getStatusColor(
                  trx.status
                )}`}
              >
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

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => setEditData(trx)}
                className="bg-yellow-500 text-white px-2 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => cetakNota(trx)}
                className="bg-purple-600 text-white px-2 rounded"
              >
                Cetak Nota
              </button>

              <button
                onClick={() => {
                  const updated = data.filter((d) => d.id !== trx.id);
                  setData(updated);
                  localStorage.setItem(
                    "transaksi",
                    JSON.stringify(updated)
                  );
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