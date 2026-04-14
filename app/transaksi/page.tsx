"use client";
import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";

/* ===== TYPES ===== */
type TipeHarga = "kg" | "item";

type Layanan = {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  tipe: TipeHarga;
  estimasiHari: number;
};

type Selected = Layanan & {
  qty: number;
};

export default function TransaksiPage() {
  const [layanan, setLayanan] = useState<Layanan[]>([]);
  const [selected, setSelected] = useState<Selected[]>([]);
  const [nama, setNama] = useState("");
  const [wa, setWa] = useState("");
  const notaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("layanan") || "[]");
    setLayanan(data);
  }, []);

  const formatRp = (n: number) => n.toLocaleString("id-ID");

  const normalizeWA = (n: string) => {
    if (!n) return "";
    const clean = n.replace(/[^0-9]/g, "");
    return clean.startsWith("0") ? "62" + clean.slice(1) : clean;
  };

  const toggleLayanan = (l: Layanan) => {
    const exist = selected.find((x) => x.id === l.id);
    if (exist) {
      setSelected(selected.filter((x) => x.id !== l.id));
    } else {
      setSelected([...selected, { ...l, qty: 1 }]);
    }
  };

  const updateQty = (id: number, qty: number) => {
    if (qty < 1) qty = 1;
    setSelected(selected.map((x) => (x.id === id ? { ...x, qty } : x)));
  };

  const total = selected.reduce((sum, x) => sum + x.harga * x.qty, 0);

  const getEstimasi = () => {
    if (selected.length === 0) return "-";
    const maxHari = Math.max(...selected.map((x) => x.estimasiHari));
    const tgl = new Date();
    tgl.setDate(tgl.getDate() + maxHari);
    return tgl.toLocaleDateString("id-ID");
  };

  const isValid = nama.trim() !== "" && normalizeWA(wa).length >= 10 && selected.length > 0;

  const kirimWA = async () => {
    if (!isValid) return alert("Lengkapi data terlebih dahulu");

    const canvas = await html2canvas(notaRef.current!);
    const img = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = img;
    link.download = "nota.png";
    link.click();

    window.open(`https://wa.me/${normalizeWA(wa)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="md:col-span-2 space-y-6">

          {/* CUSTOMER */}
          <div className="bg-white p-5 rounded-2xl shadow space-y-4">
            <h2 className="text-xl font-bold">💳 Data Pelanggan</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">Nama Pelanggan</label>
                <input
                  className="border p-2 rounded-lg w-full"
                  placeholder="Contoh: Budi"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">No WhatsApp</label>
                <input
                  className="border p-2 rounded-lg w-full"
                  placeholder="Contoh: 08123456789"
                  value={wa}
                  onChange={(e) => setWa(e.target.value)}
                />
                <div className="text-xs text-gray-400">Otomatis jadi format 62</div>
              </div>
            </div>
          </div>

          {/* LAYANAN */}
          <div className="bg-white p-5 rounded-2xl shadow">
            <h3 className="font-semibold mb-1">Pilih Layanan</h3>
            <p className="text-xs text-gray-500 mb-3">Bisa pilih lebih dari satu layanan</p>

            {layanan.length === 0 && (
              <div className="text-sm text-gray-400">Belum ada layanan tersedia</div>
            )}

            <div className="grid gap-3">
              {layanan.map((l) => {
                const isChecked = selected.find((x) => x.id === l.id);

                return (
                  <div
                    key={l.id}
                    className={`border p-3 rounded-xl cursor-pointer transition ${
                      isChecked ? "border-blue-500 bg-blue-50" : "hover:border-gray-400"
                    }`}
                    onClick={() => toggleLayanan(l)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold">{l.nama}</div>
                        <div className="text-xs text-gray-500">
                          {l.kategori} • {l.tipe === "kg" ? "Per Kg" : "Per Item"} • {l.estimasiHari} hari
                        </div>
                      </div>
                      <div className="font-bold">Rp {formatRp(l.harga)}</div>
                    </div>

                    {isChecked && (
                      <div className="mt-2">
                        <label className="text-xs text-gray-500">Qty ({l.tipe})</label>
                        <input
                          type="number"
                          min={1}
                          className="mt-1 border p-2 rounded w-full"
                          value={isChecked.qty}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateQty(l.id, Number(e.target.value))}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          {/* SUMMARY */}
          <div className="bg-white p-5 rounded-2xl shadow">
            <h3 className="font-semibold mb-3">Ringkasan Transaksi</h3>

            <div className="text-sm text-gray-600">Estimasi Selesai</div>
            <div className="font-medium">{getEstimasi()}</div>

            <div className="mt-3 text-sm text-gray-600">Total Bayar</div>
            <div className="text-3xl font-bold text-green-600">Rp {formatRp(total)}</div>

            <button
              onClick={kirimWA}
              disabled={!isValid}
              className={`mt-4 w-full py-2 rounded-lg text-white ${
                isValid ? "bg-green-600" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Kirim Nota WhatsApp
            </button>
          </div>

          {/* NOTA */}
          <div ref={notaRef} className="bg-white p-4 rounded-xl shadow text-sm">
            <div className="text-center font-bold text-lg">AI LAUNDRY</div>
            <div className="text-center text-xs text-gray-400 mb-2">Bersih • Wangi • Rapi</div>
            <hr />

            <div className="mt-2 space-y-1">
              <div>Nama: {nama || "-"}</div>
              <div>Tanggal: {new Date().toLocaleString()}</div>
              <div>Selesai: {getEstimasi()}</div>
            </div>

            <hr className="my-2" />

            {selected.length === 0 && (
              <div className="text-center text-gray-400">Belum ada layanan</div>
            )}

            {selected.map((x) => (
              <div key={x.id} className="flex justify-between">
                <span>{x.nama} x {x.qty}</span>
                <span>Rp {formatRp(x.harga * x.qty)}</span>
              </div>
            ))}

            <hr className="my-2" />

            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>Rp {formatRp(total)}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}