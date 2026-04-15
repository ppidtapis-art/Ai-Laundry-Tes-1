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

  /* ===== QR CODE (API GRATIS) ===== */
  const getQR = () => {
    if (!data) return "";

    const text = `TRX:${data.nomor}\nNama:${data.nama}\nTotal:${formatRp(data.total)}`;

    return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(text)}`;
  };

  const handleDownload = async () => {
    if (!notaRef.current) return;

    const canvas = await html2canvas(notaRef.current, {
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `nota-${data?.nomor}.png`;
    link.click();
  };

  const kirimWA = async () => {
    if (!data) return;

    await handleDownload();
    const nomor = data.wa.replace(/^0/, "62");

    window.open(`https://wa.me/${nomor}`, "_blank");
  };

  if (loading) return <div className="center">Memuat...</div>;
  if (!data) return <div className="center">❌ Data tidak ditemukan</div>;

  const items = getItems();

  return (
    <>
      <div
        ref={notaRef}
        className="nota"
        style={{ backgroundColor: "#fff", color: "#000" }}
      >
        <center>
          <img src="/logo.png" alt="logo" style={{ width: 60 }} />
          <b>AI LAUNDRY</b>
          <div>Cuci • Setrika • Rapi • Wangi</div>
          <div style={{ fontSize: 12 }}>
            Jl. Contoh No. 123, Tapis <br />
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

        {items.map((l, i) => (
          <div key={i} style={{ marginBottom: "6px" }}>
            <div>{l.nama}</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
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

        <div className="total">
          <span>TOTAL</span>
          <span>{formatRp(data.total)}</span>
        </div>

        <div className="line" />

        {/* QR CODE */}
        <center style={{ marginTop: 10 }}>
          <img src={getQR()} alt="QR Code" />
          <div style={{ fontSize: 10, marginTop: 4 }}>
            Scan untuk cek transaksi
          </div>
        </center>

        <div className="line" />

        <center style={{ marginTop: 10 }}>
          Terima Kasih telah menggunakan Jasa Kami
        </center>
      </div>

      {/* BUTTON */}
      <div className="wrapper">
        <button onClick={() => window.print()} className="btn print">
          Print
        </button>

        <button onClick={handleDownload} className="btn download">
          Download
        </button>

        <button onClick={kirimWA} className="btn wa">
          Kirim WA
        </button>
      </div>

      <style jsx>{`
        .center {
          text-align: center;
          margin-top: 50px;
        }

        .nota {
          width: 320px;
          margin: auto;
          padding: 16px;
          font-family: monospace;
          border: 1px solid #ddd;
        }

        .line {
          border-top: 1px dashed #000;
          margin: 10px 0;
        }

        .total {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
        }

        .wrapper {
          max-width: 320px;
          margin: auto;
        }

        .btn {
          width: 100%;
          margin-top: 8px;
          padding: 10px;
          border: none;
          color: white;
        }

        .print {
          background: #16a34a;
        }

        .download {
          background: #2563eb;
        }

        .wa {
          background: #25d366;
        }

        @media print {
          .wrapper {
            display: none;
          }
        }
      `}</style>
    </>
  );
}