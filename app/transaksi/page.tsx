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
  qty: number; // kg atau item
};

type Transaksi = {
  id: number;
  nomor: string;
  tanggal: string;
  selesai: string;
  nama: string;
  wa: string;
  layanan: Selected[];
  total: number;
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

  const formatWA = (n: string) =>
    n.startsWith("0") ? "62" + n.slice(1) : n;

  /* ===== SELECT LAYANAN ===== */
  const toggleLayanan = (l: Layanan) => {
    const exist = selected.find((x) => x.id === l.id);

    if (exist) {
      setSelected(selected.filter((x) => x.id !== l.id));
    } else {
      setSelected([...selected, { ...l, qty: 1 }]);
    }
  };

  /* ===== UPDATE QTY ===== */
  const updateQty = (id: number, qty: number) => {
    setSelected(
      selected.map((x) =>
        x.id === id ? { ...x, qty } : x
      )
    );
  };

  /* ===== TOTAL ===== */
  const total = selected.reduce(
    (sum, x) => sum + x.harga * x.qty,
    0
  );

  /* ===== ESTIMASI OTOMATIS ===== */
  const getEstimasi = () => {
    if (selected.length === 0) return "-";
    const maxHari = Math.max(...selected.map((x) => x.estimasiHari));
    const tgl = new Date();
    tgl.setDate(tgl.getDate() + maxHari);
    return tgl.toLocaleDateString("id-ID");
  };

  /* ===== NOMOR ===== */
  const getNomor = () => {
    const trx = JSON.parse(localStorage.getItem("transaksi") || "[]");
    return "TRX-" + (trx.length + 1).toString().padStart(3, "0");
  };

  /* ===== SIMPAN ===== */
  const simpan = (): Transaksi | null => {
    if (!nama || !wa || selected.length === 0) {
      alert("Lengkapi data");
      return null;
    }

    const trx: Transaksi = {
      id: Date.now(),
      nomor: getNomor(),
      tanggal: new Date().toLocaleString(),
      selesai: getEstimasi(),
      nama,
      wa: formatWA(wa),
      layanan: selected,
      total,
    };

    const data = JSON.parse(localStorage.getItem("transaksi") || "[]");
    data.push(trx);
    localStorage.setItem("transaksi", JSON.stringify(data));

    return trx;
  };

  /* ===== WA GAMBAR ===== */
  const kirimWA = async () => {
    const trx = simpan();
    if (!trx) return;

    const canvas = await html2canvas(notaRef.current!);
    const img = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = img;
    link.download = trx.nomor + ".png";
    link.click();

    window.open(`https://wa.me/${trx.wa}`, "_blank");
  };

  /* ===== UI ===== */
  return (
    <div style={{ padding: 20, background: "#eef2f7", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1000, margin: "auto", background: "#fff", padding: 20, borderRadius: 12 }}>

        <h2>💳 Transaksi Laundry</h2>

        <input placeholder="Nama Pelanggan" value={nama} onChange={(e) => setNama(e.target.value)} />
        <input placeholder="No WhatsApp" value={wa} onChange={(e) => setWa(e.target.value)} />

        <h3>Pilih Layanan</h3>
        {layanan.map((l) => {
          const isChecked = selected.find((x) => x.id === l.id);

          return (
            <div key={l.id} style={{ marginBottom: 10 }}>
              <label>
                <input
                  type="checkbox"
                  checked={!!isChecked}
                  onChange={() => toggleLayanan(l)}
                />
                {l.nama} - Rp {formatRp(l.harga)} ({l.tipe})
              </label>

              {isChecked && (
                <input
                  type="number"
                  min={1}
                  value={isChecked.qty}
                  onChange={(e) =>
                    updateQty(l.id, Number(e.target.value))
                  }
                  placeholder={l.tipe === "kg" ? "Berat (kg)" : "Jumlah item"}
                />
              )}
            </div>
          );
        })}

        <h3>Estimasi Selesai: {getEstimasi()}</h3>
        <h2>Total: Rp {formatRp(total)}</h2>

        <button onClick={kirimWA}>📤 Kirim Nota WA</button>

        {/* ===== NOTA ===== */}
        <div ref={notaRef} style={{
          width: 300,
          padding: 15,
          border: "2px solid black",
          marginTop: 20,
          background: "#fff"
        }}>
          <h3 style={{ textAlign: "center" }}>LAUNDRY</h3>
          <hr />

          <p>Nama: {nama}</p>
          <p>Tanggal: {new Date().toLocaleString()}</p>
          <p>Selesai: {getEstimasi()}</p>

          <hr />

          {selected.map((x) => (
            <div key={x.id}>
              {x.nama} ({x.tipe}) x {x.qty} = Rp {formatRp(x.harga * x.qty)}
            </div>
          ))}

          <hr />
          <h3>Total: Rp {formatRp(total)}</h3>
        </div>

      </div>
    </div>
  );
}