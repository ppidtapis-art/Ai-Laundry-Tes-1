"use client";
import { useState, useEffect } from "react";
import { rewardEngine } from "@/lib/rewardEngine";

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

/* ===============================
   🔥 MEMBER + DISKON
=============================== */
const getLevelMember = (total: number) => {
  if (total >= 1500000) return { level: "Platinum", color: "#8e44ad" };
  if (total >= 500000) return { level: "Gold", color: "#f1c40f" };
  return { level: "Silver", color: "#bdc3c7" };
};

const getDiskon = (level: string) => {
  if (level === "Platinum") return 0.1;
  if (level === "Gold") return 0.05;
  return 0;
};

export default function TransaksiPage() {
  const [layanan, setLayanan] = useState<Layanan[]>([]);
  const [selected, setSelected] = useState<Selected[]>([]);
  const [pelangganList, setPelangganList] = useState<Pelanggan[]>([]);
  const [nama, setNama] = useState("");
  const [wa, setWa] = useState("");

  useEffect(() => {
    setLayanan(JSON.parse(localStorage.getItem("layanan") || "[]"));

    const trx = JSON.parse(localStorage.getItem("transaksi") || "[]");

    const unik = Array.from(
      new Map(trx.map((t: any) => [t.wa, t])).values()
    );

    setPelangganList(
      unik.map((t: any) => ({
        id: t.id,
        nama: t.nama,
        wa: t.wa,
      }))
    );
  }, []);

  const normalizeWA = (n: string) => {
    const clean = n.replace(/[^0-9]/g, "");
    if (clean.startsWith("62")) return clean;
    if (clean.startsWith("0")) return "62" + clean.slice(1);
    return clean;
  };

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
    setSelected(selected.map((x) =>
      x.id === id ? { ...x, berat: val } : x
    ));
  };

  const getSubTotalItem = (x: Selected) =>
    x.tipe === "kg" ? x.harga * (x.berat || 0) : x.harga * x.qty;

  // 1. subtotal awal (lama)
  const subtotal = selected.reduce((s, x) => s + getSubTotalItem(x), 0);

  /* ===============================
     🔥 HITUNG DISKON REAL-TIME
  =============================== */
  const [totalBelanjaPelanggan, setTotalBelanjaPelanggan] = useState(0);

  useEffect(() => {
    if (!wa) return;

    const semuaTrx = JSON.parse(localStorage.getItem("transaksi") || "[]");

    const total = semuaTrx
      .filter((t: any) => t.wa === normalizeWA(wa))
      .reduce((s: number, t: any) => s + (t.subtotal || t.total), 0);

    setTotalBelanjaPelanggan(total);
  }, [wa]);
  const totalGabungan = totalBelanjaPelanggan + subtotal;
  const member = getLevelMember(totalGabungan);

  const getEstimasi = () => {
    if (!selected.length) return "-";
    const max = Math.max(...selected.map((x) => x.estimasiHari));
    const tgl = new Date();
    tgl.setDate(tgl.getDate() + max);
    return tgl.toLocaleDateString("id-ID");
  };

  // 2. total KG
  const totalKg = selected
    .filter((x) => x.tipe === "kg")
    .reduce((s, x) => s + (x.berat || 0), 0);

  // 3. reward
  const reward = rewardEngine({
    wa: normalizeWA(wa),
    total: subtotal,
    totalKg,
  }) || {
    diskonRp: 0,
    bonusKg: 0,
    level: "Silver",
  };

  // 4. harga KG total
  const totalHargaKg = selected
      .filter((x) => x.tipe === "kg")
      .reduce((s, x) => s + x.harga * (x.berat || 0), 0);

  // 5. harga item
  const totalHargaItem = selected
      .filter((x) => x.tipe !== "kg")
      .reduce((s, x) => s + x.harga * x.qty, 0);

  // 6. kg setelah bonus
  const kgSetelahBonus = Math.max(0, totalKg - (reward?.bonusKg || 0));

  // 7. harga per kg
  const hargaPerKg = totalKg > 0 ? totalHargaKg / totalKg : 0;

  // 8. harga kg setelah bonus
  const hargaKgSetelahBonus = kgSetelahBonus * hargaPerKg;

  // 9. subtotal FINAL (baru di sini!)
  const subtotalFinal = hargaKgSetelahBonus + totalHargaItem;

  // 10. diskon member
  const persenDiskon = getDiskon(member.level);
  const potongan = subtotalFinal * persenDiskon;

  // 11. total akhir
  const totalAkhir =
      subtotalFinal - potongan - (reward?.diskonRp || 0);

  const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

  /* ===============================
     🔥 SIMPAN
  =============================== */
  const simpanDanKeNota = () => {
    if (!nama || !wa || !selected.length) return alert("Lengkapi data");

    const trxId = Date.now();
    const norm = normalizeWA(wa);

    let pelangganLama: Pelanggan[] = JSON.parse(
      localStorage.getItem("pelanggan") || "[]"
    );

    const idx = pelangganLama.findIndex((p) => p.wa === norm);

    if (idx !== -1) pelangganLama[idx].nama = nama;
    else
      pelangganLama.unshift({
        id: Date.now(),
        nama,
        wa: norm,
      });

    localStorage.setItem("pelanggan", JSON.stringify(pelangganLama));

    const trx = {
      id: trxId,
      nomor: "TRX-" + trxId,
      nama,
      wa: norm,
      items: selected,

      subtotal: subtotalFinal,
      bonusKg: reward?.bonusKg || 0,
      diskonReward: reward?.diskonRp || 0,
      total: totalAkhir,

      status: "Proses",
      tanggal: new Date().toISOString(),
      tanggalSelesai: getEstimasi(),
    };

    const lama = JSON.parse(localStorage.getItem("transaksi") || "[]");
    localStorage.setItem("transaksi", JSON.stringify([trx, ...lama]));

    window.location.href = `/nota?id=${trxId}`;
  };

  return (
    <div className="p-4 w-full md:max-w-3xl mx-auto space-y-4">

      {/* PELANGGAN */}
      <div className="bg-white p-4 rounded shadow">
        <select onChange={(e) => pilihPelanggan(Number(e.target.value))} className="border p-2 w-full">
          <option value="">Pilih Pelanggan</option>
          {pelangganList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama} - {p.wa}
            </option>
          ))}
        </select>

        <input className="border p-2 w-full mt-2" placeholder="Nama" value={nama} onChange={(e) => setNama(e.target.value)} />
        <input className="border p-2 w-full mt-2" placeholder="WA" value={wa} onChange={(e) => setWa(e.target.value)} />
      </div>

      {/* LAYANAN */}
      <div className="bg-white p-4 rounded shadow">
        {layanan.map((l) => {
          const s = selected.find((x) => x.id === l.id);

          return (
            <div key={l.id} className={`border p-2 mb-2 ${s ? "bg-green-100" : ""}`} onClick={() => toggleLayanan(l)}>
              <div>{l.nama} - {formatRp(l.harga)}</div>

              {s && (
                <div onClick={(e) => e.stopPropagation()}>
                  {l.tipe === "kg" ? (
                    <input type="number" value={s.berat} onChange={(e) => updateBerat(l.id, Number(e.target.value))} />
                  ) : (
                    <input type="number" value={s.qty} onChange={(e) => updateQty(l.id, Number(e.target.value))} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* TOTAL */}
      <div className="bg-white p-4 rounded shadow">
        <div>Subtotal: {formatRp(subtotal)}</div>

        <div>
          Member:
          <span style={{
            marginLeft: 6,
            padding: "3px 8px",
            borderRadius: 10,
            background: member.color,
            color: "#fff",
            fontSize: 12
          }}>
            {member.level}
          </span>
        </div>

        {potongan > 0 && (
          <div style={{ color: "green" }}>
            Diskon: -{formatRp(potongan)}
          </div>
        )}

        <hr />

        <div className="text-lg font-bold">
          Total Bayar: {formatRp(totalAkhir)}
        </div>

        <button onClick={simpanDanKeNota} className="w-full bg-green-600 text-white p-3 mt-3 rounded">
          Simpan & Nota
        </button>
      </div>

    </div>
  );
}