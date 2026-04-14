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

type Selected = Layanan & { qty: number };

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

  const kirimWA = async () => {
    const canvas = await html2canvas(notaRef.current!);
    const img = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = img;
    link.download = "nota.png";
    link.click();

    window.open(`https://wa.me/${normalizeWA(wa)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* HEADER */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-bold">💳 Transaksi Laundry</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
            <input
              className="border p-2 rounded"
              placeholder="Nama pelanggan"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
            <input
              className="border p-2 rounded"
              placeholder="No WA"
              value={wa}
              onChange={(e) => setWa(e.target.value)}
            />
          </div>
        </div>

        {/* LAYANAN (COMPACT) */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-sm font-semibold mb-2">Pilih Layanan</h3>

          <div className="grid gap-2">
            {layanan.map((l) => {
              const isChecked = selected.find((x) => x.id === l.id);

              return (
                <div
                  key={l.id}
                  className={`flex justify-between items-center p-2 rounded-lg border text-sm ${
                    isChecked ? "bg-blue-100 border-blue-400" : ""
                  }`}
                  onClick={() => toggleLayanan(l)}
                >
                  <div>
                    <div className="font-medium">{l.nama}</div>
                    <div className="text-xs text-gray-500">
                      Rp {formatRp(l.harga)} / {l.tipe}
                    </div>
                  </div>

                  {isChecked && (
                    <input
                      type="number"
                      min={1}
                      className="w-16 border rounded p-1 text-center"
                      value={isChecked.qty}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateQty(l.id, Number(e.target.value))}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SUMMARY */}
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex justify-between text-sm">
            <span>Estimasi</span>
            <span>{getEstimasi()}</span>
          </div>

          <div className="flex justify-between mt-2 font-bold text-lg text-green-600">
            <span>Total</span>
            <span>Rp {formatRp(total)}</span>
          </div>

          <button
            onClick={kirimWA}
            className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg"
          >
            Kirim Nota
          </button>
        </div>

        {/* NOTA */}
        <div ref={notaRef} className="bg-white p-3 rounded shadow text-xs">
          <div className="text-center font-bold">AI LAUNDRY</div>
          <hr className="my-1" />

          <div>Nama: {nama}</div>
          <div>Selesai: {getEstimasi()}</div>

          <hr className="my-1" />

          {selected.map((x) => (
            <div key={x.id} className="flex justify-between">
              <span>{x.nama} x {x.qty}</span>
              <span>{formatRp(x.harga * x.qty)}</span>
            </div>
          ))}

          <hr className="my-1" />

          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{formatRp(total)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
