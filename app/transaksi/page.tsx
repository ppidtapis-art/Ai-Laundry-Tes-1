"use client";
import { useState, useEffect } from "react";
import { applyReward, getRewardInfo, simulateReward } from "@/lib/rewardEngine";

type TipeHarga = "kg" | "item";

type Layanan = {
  id: string;
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
  id: string;
  nama: string;
  wa: string;
};

/* ===============================
   MEMBER
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

  // 🔥 hanya untuk info, bukan untuk hitung transaksi
  const [rewardInfo, setRewardInfo] = useState({
    totalKg: 0,
    bonus30kgUsed: false,
    level: "Silver" as "Silver" | "Gold" | "Platinum",
  });

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

  /* ===============================
     NORMALIZE WA
  =============================== */
  const normalizeWA = (n: string) => {
    const clean = n.replace(/[^0-9]/g, "");
    if (clean.startsWith("62")) return clean;
    if (clean.startsWith("0")) return "62" + clean.slice(1);
    return clean;
  };

  const pilihPelanggan = (id: string) => {
    const p = pelangganList.find((x) => x.id === id);
    if (!p) return;

    setNama(p.nama);
    setWa(p.wa);
  };

  /* ===============================
     LOAD INFO (READ ONLY)
  =============================== */
  useEffect(() => {
    if (!wa) return;

    const r = getRewardInfo(normalizeWA(wa));
    setRewardInfo(r);
  }, [wa]);

  /* ===============================
     LAYANAN
  =============================== */
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

  const updateQty = (id: string, val: number) => {
    setSelected(selected.map((x) => (x.id === id ? { ...x, qty: val } : x)));
  };

  const updateBerat = (id: string, val: number) => {
    setSelected(selected.map((x) =>
      x.id === id ? { ...x, berat: val } : x
    ));
  };

  const getSubTotalItem = (x: Selected) =>
    x.tipe === "kg" ? x.harga * (x.berat || 0) : x.harga * x.qty;

  const subtotal = selected.reduce((s, x) => s + getSubTotalItem(x), 0);

  /* ===============================
     TOTAL KG
  =============================== */
  const totalKg = selected
    .filter((x) => x.tipe === "kg")
    .reduce((s, x) => s + (x.berat || 0), 0);

  /* ===============================
     HARGA FINAL (BELUM BONUS)
  =============================== */
  const totalHargaKg = selected
    .filter((x) => x.tipe === "kg")
    .reduce((s, x) => s + x.harga * (x.berat || 0), 0);

  const totalHargaItem = selected
    .filter((x) => x.tipe !== "kg")
    .reduce((s, x) => s + x.harga * x.qty, 0);

  const hargaPerKg = totalKg > 0 ? totalHargaKg / totalKg : 0;

  /* ===============================
     SIMPAN (APPLY REWARD)
  =============================== */
  const simpanDanKeNota = () => {
    if (!nama || !wa || !selected.length) return alert("Lengkapi data");

    const trxId = Date.now().toString();
    const norm = normalizeWA(wa);

    // 🔥 APPLY REWARD
    const reward = applyReward({
      id: trxId,
      wa: norm,
      total: subtotal,
      totalKg,
    });

    // 🔥 SIMPAN KE DATABASE PELANGGAN (INI YANG KURANG)
    const pelangganDB = JSON.parse(localStorage.getItem("pelanggan") || "[]");

    const exist = pelangganDB.find((p: any) => p.wa === norm);

    if (!exist) {
      pelangganDB.push({
        id: trxId,
        nama,
        wa: norm,
      });
    }

    localStorage.setItem("pelanggan", JSON.stringify(pelangganDB));

    // ==============================
    // LANJUT KODE KAMU
    // ==============================
    const kgSetelahBonus = Math.max(0, totalKg - reward.bonusKg);

    const subtotalFinal =
      (kgSetelahBonus * hargaPerKg) + totalHargaItem;

    const member = getLevelMember(subtotalFinal);
    const potongan = subtotalFinal * getDiskon(member.level);

    const totalAkhir = subtotalFinal - potongan;

    const trx = {
      id: trxId,
      nomor: "TRX-" + trxId,
      nama,
      wa: norm,
      items: selected,
      subtotal: subtotalFinal,
      bonusKg: reward.bonusKg,
      level: member.level,
      total: totalAkhir,
      status: "Proses",
      tanggal: new Date().toISOString(),
    };

    const lama = JSON.parse(localStorage.getItem("transaksi") || "[]");
    localStorage.setItem("transaksi", JSON.stringify([trx, ...lama]));

    window.location.href = `/nota?id=${trxId}`;
  };

  const [simulasi, setSimulasi] = useState({
    bonusKg: 0,
    akanDapatBonus: false,
    sisaMenujuBonus: 30,
  });

  const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">

      <div className="bg-white p-4 rounded shadow">

        {/* PILIH PELANGGAN */}
        <select
          onChange={(e) => pilihPelanggan(e.target.value)}
          className="border p-2 w-full mb-2"
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

      <div className="bg-white p-4 rounded shadow">
        <div>Subtotal: {formatRp(subtotal)}</div>

        {/* INFO BONUS */}
        <div style={{ fontSize: 12, marginTop: 5 }}>
          Total Kg Customer: {rewardInfo.totalKg.toFixed(1)} kg
        </div>

        {/* BONUS SIAP */}
        {simulasi.bonusKg > 0 && (
          <div style={{ color: "green", marginTop: 5 }}>
            🎁 Bonus akan dipakai: {simulasi.bonusKg} Kg
          </div>
        )}

        {/* MENUJU BONUS */}
        {simulasi.bonusKg === 0 && (
          <div style={{ color: "#555", marginTop: 5 }}>
            Kurang {simulasi.sisaMenujuBonus.toFixed(1)} kg lagi untuk bonus
          </div>
        )}

      {/* AKAN DAPAT BONUS */}
      {simulasi.akanDapatBonus && (
        <div style={{ color: "orange", marginTop: 5 }}>
          ⚡ Transaksi ini akan memicu bonus!
        </div>
      )}

        {!rewardInfo.bonus30kgUsed && rewardInfo.totalKg >= 30 && (
          <div style={{ color: "green" }}>
            🎁 Bonus siap dipakai
          </div>
        )}

        <button onClick={simpanDanKeNota} className="w-full bg-green-600 text-white p-3 mt-3 rounded">
          Simpan & Nota
        </button>
      </div>

    </div>
  );
}