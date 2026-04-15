"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
};

export default function NotaClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<Nota | null>(null);
  const [loading, setLoading] = useState(true);

  const notaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trx = JSON.parse(localStorage.getItem("transaksi") || "[]");
    const found = trx.find((x: any) => String(x.id) === String(id));

    if (found && !found.tanggalSelesai) {
      found.tanggalSelesai = found.tanggal;
    }

    setData(found || null);
    setLoading(false);
  }, [id]);

  const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

  const formatTanggal = (tgl: string) => {
    if (!tgl) return "-";
    const d = new Date(tgl);
    if (!isNaN(d.getTime())) return d.toLocaleDateString("id-ID");
    return tgl;
  };

  const getItems = () => {
    if (!data) return [];
    return (data.items || data.layanan || []).map((l: any) => {
      const qty = l.qty || l.berat || 0;
      const total = l.qty
        ? l.qty * l.harga
        : (l.berat || 0) * l.harga;

      return {
        nama: l.nama,
        qty,
        harga: l.harga,
        total,
        tipe: l.qty ? "item" : "kg",
      };
    });
  };

  /* 🔥 LEVEL AUTO (UNTUK DATA LAMA) */
  const getLevel = (total: number) => {
    if (total >= 1500000) return "Platinum";
    if (total >= 500000) return "Gold";
    return "Silver";
  };

  /* 🔥 AMBIL DATA */
  const subtotal = data?.subtotal ?? data?.total ?? 0;
  const diskon = data?.diskon ?? 0;
  const level = data?.level ?? getLevel(subtotal);

  /* 🔥 PROGRESS */
  const getProgress = () => {
    if (level === "Silver") return Math.min((subtotal / 500000) * 100, 100);
    if (level === "Gold") return Math.min((subtotal / 1500000) * 100, 100);
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

  /* 🔥 QR */
  const getQR = () => {
    if (!data) return "";
    const text = `TRX:${data.nomor}\nNama:${data.nama}\nTotal:${formatRp(data.total)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(text)}`;
  };

  const handleDownload = async () => {
    if (!notaRef.current) return;

    const canvas = await html2canvas(notaRef.current, {
      backgroundColor: "#ffffff",
      scale: 3, // 🔥 biar HD (WA ga kecil)
      width: notaRef.current.offsetWidth,
      height: notaRef.current.offsetHeight,
      useCORS: true,
    });

    const dataUrl = canvas.toDataURL("image/png", 1.0);

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `nota-${data?.nomor}.png`;
    link.click();

    return dataUrl;
  };

  const kirimWA = async () => {
    if (!data) return;

    await handleDownload(); // otomatis download HD

    const nomor = data.wa.replace(/^0/, "62");

    const pesan = `🧾 *Nota Laundry*
  No: ${data.nomor}
  Nama: ${data.nama}
  Total: ${formatRp(data.total)}

  Terima kasih 🙏`;

    window.open(
      `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`,
      "_blank"
    );
  };

  if (loading) return <div className="center">Memuat...</div>;
  if (!data) return <div className="center">❌ Data tidak ditemukan</div>;

  const items = getItems();

  return (
    <>
      <div ref={notaRef} className="nota">

        <center>
          <img src="/logo.png" alt="logo" style={{ width: 60 }} />
          <b>AI LAUNDRY</b>
          <div>Cuci • Setrika • Rapi • Wangi</div>
          <div style={{ fontSize: 12 }}>
            Perum Korpri Tapis Blok B Gg Tirta 7 <br />
            Kec. Tanah Grogot, Kab. Paser
          </div>
          <div>WA : 0813-4703-3944</div>
        </center>

        <div className="line" />

        <div>
          <div>No Trx : {data.nomor}</div>
          <div>Nama : {data.nama}</div>
          <div>HP/WA : {data.wa}</div>
          <div>Tgl Masuk : {formatTanggal(data.tanggal)}</div>
          <div>Tgl Selesai : {formatTanggal(data.tanggalSelesai)}</div>
        </div>

        <div className="line" />

        {/* ITEM */}
        {items.map((l, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            <div>{l.nama}</div>
            <div className="row">
              <span>
                {l.tipe === "kg"
                  ? `${l.qty} Kg x ${l.harga.toLocaleString()}`
                  : `${l.qty} x ${l.harga.toLocaleString()}`}
              </span>
              <span>{formatRp(l.total)}</span>
            </div>
          </div>
        ))}

        <div className="line" />

        {/* 🔥 RINGKASAN */}
        <div className="row">
          <span>Subtotal</span>
          <span>{formatRp(subtotal)}</span>
        </div>

        {diskon > 0 && (
          <>
            <div className="row green">
              <span>Diskon</span>
              <span>-{formatRp(diskon)}</span>
            </div>

            <div style={{ fontSize: 12 }}>
              Member: {level}
            </div>
          </>
        )}

        {/* PROGRESS */}
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11 }}>Progress Member</div>
          <div style={{
            width: "100%",
            height: 6,
            background: "#eee",
            borderRadius: 10,
            overflow: "hidden"
          }}>
            <div style={{
              width: `${getProgress()}%`,
              height: "100%",
              background: getColor()
            }} />
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
        <center style={{ marginTop: 10 }}>
          <img src={getQR()} alt="QR Code" />
          <div style={{ fontSize: 10 }}>Scan untuk cek transaksi</div>
        </center>

        <div className="line" />

        <center style={{ marginTop: 10 }}>
          Terima Kasih telah menggunakan Jasa Kami
        </center>

      </div>

      {/* BUTTON */}
      <div className="wrapper">
        <button onClick={() => window.print()} className="btn print">Print</button>
        <button onClick={handleDownload} className="btn download">Download</button>
        <button onClick={kirimWA} className="btn wa">Kirim WA</button>
      </div>

      <style jsx>{`
        .center { text-align: center; margin-top: 50px; }

        .nota {
          width: 320px; /* 🔥 FIX biar ga kepanjangan */
          margin: auto;
          padding: 16px;
          font-family: "Courier New", monospace;
          background: #fff;
          color: #000;
          border: 2px solid #16a34a;
          border-radius: 8px;
        }

        .line {
          border-top: 1px dashed #000;
          margin: 10px 0;
        }

        .row {
          display: flex;
          justify-content: space-between;
        }

        .green { color: green; }

        .total {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 16px;
        }

        .wrapper {
          max-width: 320px;
          margin: auto;
        }

        .btn {
          width: 100%;
          margin-top: 8px;
          padding: 14px;
          font-size: 16px;
          border-radius: 8px;
          border: none;
          color: white;
        }

        .print { background: #16a34a; }
        .download { background: #2563eb; }
        .wa { background: #25d366; }

        @media print {
          .wrapper { display: none; }
        }
      `}</style>
    </>
  );
}