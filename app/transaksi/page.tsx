"use client";
import { useState, useEffect } from "react";

type TipeHarga = "kg" | "item";

type Layanan = {
  id: number;
  nama: string;
  harga: number;
  tipe: TipeHarga;
  estimasiHari: number;
};

type Selected = Layanan & {
  qty: number;
  berat?: number;
};

type Pelanggan = {
  id: number;
  nama: string;
  wa: string;
};

export default function TransaksiPage() {
  const [layanan, setLayanan] = useState<Layanan[]>([]);
  const [selected, setSelected] = useState<Selected[]>([]);
  const [pelangganList, setPelangganList] = useState<Pelanggan[]>([]);
  const [nama, setNama] = useState("");
  const [wa, setWa] = useState("");

  const normalizeWA = (n: string) => {
    const clean = n.replace(/[^0-9]/g, "");
    if (clean.startsWith("62")) return clean;
    if (clean.startsWith("0")) return "62" + clean.slice(1);
    return clean;
  };

  useEffect(() => {
    setLayanan(JSON.parse(localStorage.getItem("layanan") || "[]"));
    setPelangganList(JSON.parse(localStorage.getItem("pelanggan") || "[]"));
  }, []);

  const pilihPelanggan = (id: number) => {
    const p = pelangganList.find((x) => x.id === id);
    if (!p) return;
    setNama(p.nama);
    setWa(p.wa);
  };

  const toggleLayanan = (l: Layanan) => {
    const exist = selected.find((x) => x.id === l.id);
    if (exist) {
      setSelected(selected.filter((x) => x.id !== l.id));
    } else {
      setSelected([
        ...selected,
        { ...l, qty: 1, berat: l.tipe === "kg" ? 1 : undefined },
      ]);
    }
  };

  const updateQty = (id: number, val: number) => {
    setSelected(selected.map((x) => (x.id === id ? { ...x, qty: val } : x)));
  };

  const updateBerat = (id: number, val: number) => {
    setSelected(selected.map((x) => (x.id === id ? { ...x, berat: val } : x)));
  };

  const getSubTotal = (x: Selected) =>
    x.tipe === "kg" ? x.harga * (x.berat || 0) : x.harga * x.qty;

  const total = selected.reduce((s, x) => s + getSubTotal(x), 0);

  const getEstimasi = () => {
    if (!selected.length) return "-";
    const max = Math.max(...selected.map((x) => x.estimasiHari));
    const tgl = new Date();
    tgl.setDate(tgl.getDate() + max);
    return tgl.toLocaleDateString("id-ID");
  };

  const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

  /* ===== SIMPAN + REDIRECT ===== */
  const simpanDanKeNota = () => {
    if (!nama || !wa || !selected.length) {
      alert("Lengkapi data");
      return;
    }

    const trxId = Date.now();
    const norm = normalizeWA(wa);

    const trx = {
      id: trxId,
      nomor: "TRX-" + trxId,
      nama,
      wa: norm,
      items: selected,
      total,
      status: "Proses",
      tanggal: new Date().toISOString(),
      tanggalSelesai: getEstimasi(),
    };

    const lama = JSON.parse(localStorage.getItem("transaksi") || "[]");
    localStorage.setItem("transaksi", JSON.stringify([trx, ...lama]));

    // 🔥 PINDAH KE HALAMAN NOTA
    window.location.href = `/nota?id=${trxId}`;
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-4">

        {/* PELANGGAN */}
        <div className="bg-white p-4 rounded shadow">
          <select
            className="border p-2 w-full"
            onChange={(e) => pilihPelanggan(Number(e.target.value))}
          >
            <option value="">Pilih Pelanggan</option>
            {pelangganList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama} - {p.wa}
              </option>
            ))}
          </select>

          <input
            className="border p-2 w-full mt-2"
            placeholder="Nama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />

          <input
            className="border p-2 w-full mt-2"
            placeholder="WA"
            value={wa}
            onChange={(e) => setWa(e.target.value)}
          />
        </div>

        {/* LAYANAN */}
        <div className="bg-white p-4 rounded shadow">
          {layanan.map((l) => {
            const s = selected.find((x) => x.id === l.id);

            return (
              <div
                key={l.id}
                className={`border p-2 mb-2 ${s ? "bg-green-100" : ""}`}
                onClick={() => toggleLayanan(l)}
              >
                <div className="font-semibold">
                  {l.nama} - {formatRp(l.harga)}
                </div>

                {s && (
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    {l.tipe === "kg" ? (
                      <>
                        <label>Berat (Kg)</label>
                        <input
                          type="number"
                          className="border p-1 w-full"
                          value={s.berat}
                          onChange={(e) =>
                            updateBerat(l.id, Number(e.target.value))
                          }
                        />
                      </>
                    ) : (
                      <>
                        <label>Jumlah</label>
                        <input
                          type="number"
                          className="border p-1 w-full"
                          value={s.qty}
                          onChange={(e) =>
                            updateQty(l.id, Number(e.target.value))
                          }
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* TOTAL */}
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>{formatRp(total)}</span>
          </div>

          <button
            onClick={simpanDanKeNota}
            className="w-full bg-green-600 text-white p-2 mt-2"
          >
            Simpan & Lihat Nota
          </button>
        </div>

      </div>
    </div>
  );
}