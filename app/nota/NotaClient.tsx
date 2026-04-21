"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";

type Nota = {
  id: string;
  nomor: string;
  nama: string;
  wa: string;
  tanggal: string;
  tanggalSelesai: string;
  total: number;
  subtotal?: number;
  diskon?: number;
  level?: string;
  items?: any[];
  layanan?: any[];
  bonusKg?: number;
  diskonReward?: number;
};

export default function NotaClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<Nota | null>(null);
  const [loading, setLoading] = useState(true);

  const notaRef = useRef<HTMLDivElement>(null);

  /* ===================== LOAD DATA ===================== */
  useEffect(() => {
    const trx = JSON.parse(localStorage.getItem("transaksi") || "[]");

    const found = trx.find((x: any) => String(x.id) === String(id)) || null;

    if (found && !found.tanggalSelesai) {
      found.tanggalSelesai = found.tanggal;
    }

    setData(found);
    console.log("DATA NOTA:", found);
    setLoading(false);
  }, [id]);

  /* ===================== HELPERS ===================== */
  const formatRp = (n: number) =>
    "Rp " + (n || 0).toLocaleString("id-ID");

  const formatTanggal = (tgl: string) => {
    if (!tgl) return "-";
    const d = new Date(tgl);
    return isNaN(d.getTime()) ? tgl : d.toLocaleDateString("id-ID");
  };

  /* ===================== ITEMS ===================== */
  const items = useMemo(() => {
    if (!data) return [];

    return (data.items || data.layanan || []).map((l: any) => {
      const isKg = l.tipe === "kg" || l.berat !== undefined;

      const qty = isKg
        ? Number(l.berat || 0)
        : Number(l.qty || 0);

      const harga = Number(l.harga || 0);

      return {
        nama: l.nama,
        qty,
        harga,
        tipe: isKg ? "kg" : "item",
        total: qty * harga,
      };
    });
  }, [data]);

  /* ===================== TOTAL KG ===================== */
  const totalKg = useMemo(() => {
    return items
      .filter(i => i.tipe === "kg")
      .reduce((a, b) => a + b.qty, 0);
  }, [items]);

  const totalHargaKg = useMemo(() => {
    return items
      .filter(i => i.tipe === "kg")
      .reduce((a, b) => a + (b.qty * b.harga), 0);
  }, [items]);

  const hargaPerKg = totalKg > 0 ? totalHargaKg / totalKg : 0;

  /* ===================== REWARD ===================== */
  const reward = {
    bonusKg: data?.bonusKg || 0,
    diskonRp: data?.diskonReward || 0,
  };

const nilaiBonus = reward.bonusKg * hargaPerKg;

  /* ===================== LEVEL (fallback data lama) ===================== */
  const getLevel = (total: number) => {
    if (total >= 2000000) return "Platinum";
    if (total >= 1000000) return "Gold";
    return "Silver";
  };

  const getDiskonMember = (level: string) => {
    if (level === "Silver") return 0;
    if (level === "Gold") return 5;
    if (level === "Platinum") return 10;
    return 0;
  };

  const subtotal = data?.subtotal ?? data?.total ?? 0;

  // ⬇️ tentukan level dulu
  const level = data?.level ?? getLevel(subtotal);

  // ⬇️ baru hitung persen
  const persenMember = getDiskonMember(level);

  // ⬇️ baru hitung diskon
  const diskon =
    data?.diskon ??
    (persenMember > 0 ? (subtotal * persenMember) / 100 : 0);

  // ⬇️ estimasi (opsional)
  const estimasiDiskon = (subtotal * persenMember) / 100;

  /* ===================== PROGRESS ===================== */
  const getProgress = () => {
    if (level === "Silver") return Math.min((subtotal / 1000000) * 100, 100);
    if (level === "Gold") return Math.min((subtotal / 2000000) * 100, 100);
    return 100;
  };

  const getNextLabel = () => {
    if (level === "Silver") return "Menuju Gold";
    if (level === "Gold") return "Menuju Platinum";
    return "Level Tertinggi";
  };

  const getColor = () => {
    if (level === "Platinum") return "#8e44ad";
    if (level === "Gold") return "#f1c40f";
    return "#bdc3c7";
  };

  /* ===================== QR ===================== */
  const getQR = () => {
    if (!data) return "";
    const text = `TRX:${data.nomor}\nNama:${data.nama}\nTotal:${formatRp(data.total)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(text)}`;
  };

  /* ===================== ACTION ===================== */
  const handleDownload = async () => {
    if (!notaRef.current || !data) return;

    const canvas = await html2canvas(notaRef.current, {
      backgroundColor: "#ffffff",
      scale: 3,
      useCORS: true,
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `nota-${data.nomor}.png`;
    link.click();
  };

  const kirimWA = async () => {
    if (!data) return;

    await handleDownload();

    const nomor = data.wa.replace(/^0/, "62");

    const pesan = `🧾 Nota Laundry
No: ${data.nomor}
Nama: ${data.nama}
Total: ${formatRp(data.total)}

Terima kasih 🙏`;

    const url = `intent://send?phone=${nomor}&text=${encodeURIComponent(pesan)}#Intent;scheme=whatsapp;package=com.whatsapp;end`;

    window.location.href = url;
  };

  /* ===================== LOADING ===================== */
  if (loading) return <div className="center">Memuat...</div>;
  if (!data) return <div className="center">❌ Data tidak ditemukan</div>;

  /* ===================== RENDER ===================== */
  return (
    <>
      <div ref={notaRef} className="nota">

        <center>
          <img src="/logo.png" alt="logo" style={{ width: 60 }} />
          <b>AI LAUNDRY</b>
          <div>Cuci • Setrika • Rapi • Wangi</div>
        </center>

        <div className="line" />

        <div>
          <div>No Trx : {data.nomor}</div>
          <div>Nama : {data.nama}</div>
          <div>WA : {data.wa}</div>
          <div>Tgl Masuk : {formatTanggal(data.tanggal)}</div>
          <div>Tgl Selesai : {formatTanggal(data.tanggalSelesai)}</div>
        </div>

        <div className="line" />

        {/* ITEMS */}
        {items.map((l, i) => (
          <div key={i}>
            <div>{l.nama}</div>
            <div className="row">
              <span>
                {l.tipe === "kg"
                  ? `${l.qty} Kg x ${l.harga}`
                  : `${l.qty} x ${l.harga}`}
              </span>
              <span>{formatRp(l.total)}</span>
            </div>
          </div>
        ))}

        <div className="line" />

        {/* RINGKASAN */}
        <div className="row">
          <span>Subtotal</span>
          <span>{formatRp(subtotal)}</span>
        </div>

        {/* BONUS KG */}
        {reward.bonusKg > 0 && (
          <div className="row green">
            <span>Bonus Laundry</span>
            <span>
              -{reward.bonusKg} Kg x {Math.round(hargaPerKg)} = {formatRp(nilaiBonus)}
            </span>
          </div>
        )}

        {/* DISKON REWARD */}
        {reward.diskonRp > 0 && (
          <div className="row green">
            <span>Diskon Reward</span>
            <span>-{formatRp(reward.diskonRp)}</span>
          </div>
        )}

        {/* DISKON MEMBER */}
        {diskon > 0 && (
          <div className="row green">
            <span>Potongan Member</span>
            <span>-{formatRp(diskon)}</span>
          </div>
        )}

        <div style={{ fontSize: 12 }}>
          Member: {level}
          {persenMember > 0 && (
            <span style={{ marginLeft: 6, color: "green" }}>
              ({persenMember > 0 ? `-${persenMember}%` : "Tidak ada diskon"})
            </span>
          )}
        </div>



        {/* PROGRESS */}
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11 }}>Progress Member</div>

          <div className="bar">
            <div
              className="fill"
              style={{
                width: `${getProgress()}%`,
                background: getColor(),
              }}
            />
          </div>

          <div style={{ fontSize: 10 }}>{getNextLabel()}</div>
        </div>

        <div className="line" />

        {/* TOTAL */}
        <div className="total">
          <span>TOTAL</span>
          <span>{formatRp(data.total)}</span>
        </div>

        <div className="line" />

        {/* QR */}
        <center>
          <img src={getQR()} alt="QR" />
        </center>

      </div>

      {/* BUTTON */}
      <div className="wrapper">
        <button onClick={() => window.print()} className="btn print">Print</button>
        <button onClick={handleDownload} className="btn download">Download</button>
        <button onClick={kirimWA} className="btn wa">Kirim WA</button>
      </div>

      <style jsx>{`
        .center { text-align:center; margin-top:50px; }

        .nota {
          width: 320px;
          margin: auto;
          padding: 16px;
          font-family: monospace;
          background: #fff;
          color: #000;
        }

        .line {
          border-top: 1px dashed #000;
          margin: 10px 0;
        }

        .row {
          display:flex;
          justify-content:space-between;
        }

        .green { color: green; }

        .total {
          display:flex;
          justify-content:space-between;
          font-weight:bold;
        }

        .bar {
          width:100%;
          height:6px;
          background:#eee;
          border-radius:10px;
        }

        .fill {
          height:100%;
        }

        .wrapper {
          max-width:320px;
          margin:auto;
        }

        .btn {
          width:100%;
          margin-top:8px;
          padding:12px;
          border:none;
          color:#fff;
        }

        .print { background:#16a34a; }
        .download { background:#2563eb; }
        .wa { background:#25d366; }
      `}</style>
    </>
  );
}