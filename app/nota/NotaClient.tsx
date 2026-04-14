"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import html2canvas from "html2canvas";

type LayananItem = {
  nama: string;
  harga: number;
  berat: number;
};

type Nota = {
  id: string;
  nomor: string;
  nama: string;
  wa: string;
  tanggal: string;
  tanggalSelesai: string;
  layanan: LayananItem[];
  total: number;
};

export default function NotaClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [data, setData] = useState<Nota | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const transaksi = localStorage.getItem("transaksi");
      if (!transaksi) return setLoading(false);

      const parsed: Nota[] = JSON.parse(transaksi);

      const found = parsed.find(
        (item) => String(item.id) === String(id)
      );

      if (found) setData(found);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [id]);

  const formatRupiah = (n: number) =>
    "Rp " + n.toLocaleString("id-ID");

  const formatTanggal = (tgl: string) => {
    const d = new Date(tgl);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDownload = async () => {
    const el = document.querySelector(".nota") as HTMLElement;
    if (!el) return;

    const canvas = await html2canvas(el);
    const img = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = img;
    link.download = `nota-${data?.nomor}.png`;
    link.click();
  };

  const kirimWA = async () => {
    if (!data) return;

    await handleDownload();

    const nomor = data.wa.replace(/^0/, "62");

    const text = encodeURIComponent(
      `Halo ${data.nama},\nLaundry kamu sudah siap diambil 🧺\nTotal: ${formatRupiah(
        data.total
      )}\nTerima kasih 🙏`
    );

    window.open(`https://wa.me/${nomor}?text=${text}`, "_blank");
  };

  if (loading) {
    return <div className="center">Memuat nota...</div>;
  }

  if (!data) {
    return <div className="center">❌ Data tidak ditemukan</div>;
  }

  return (
    <>
      <div className="nota">
        {/* HEADER */}
        <div className="header">
          <h2>AI LAUNDRY</h2>
          <p>Bersih • Wangi • Rapi</p>
          <p>WA: 0813-4703-3944</p>
        </div>

        <div className="line" />

        {/* INFO */}
        <div className="info">
          <p>No : {data.nomor}</p>
          <p>Nama : {data.nama}</p>
          <p>Tgl : {formatTanggal(data.tanggal)}</p>
          <p>Ambil : {formatTanggal(data.tanggalSelesai)}</p>
        </div>

        <div className="line" />

        {/* TABLE */}
        <div className="table">
          <div className="row head">
            <span>Layanan</span>
            <span>Qty</span>
            <span>Total</span>
          </div>

          {data.layanan.map((l, i) => (
            <div key={i} className="row">
              <span>{l.nama}</span>
              <span>{l.berat}kg</span>
              <span>{formatRupiah(l.harga * l.berat)}</span>
            </div>
          ))}
        </div>

        <div className="line" />

        {/* TOTAL */}
        <div className="total">
          <span>TOTAL</span>
          <span>{formatRupiah(data.total)}</span>
        </div>

        <div className="line" />

        {/* FOOTER */}
        <div className="footer">
          <p>Terima kasih 🙏</p>
          <p>Simpan nota saat pengambilan</p>
        </div>

        {/* BUTTON */}
        <button onClick={() => window.print()} className="btn print">
          🖨 Print
        </button>

        <button onClick={handleDownload} className="btn download">
          ⬇ Download
        </button>

        <button onClick={kirimWA} className="btn wa">
          📲 Kirim WhatsApp
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
          background: white;
          padding: 16px;
          font-family: monospace;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .header {
          text-align: center;
        }

        .header h2 {
          margin: 0;
        }

        .line {
          border-top: 1px dashed #999;
          margin: 10px 0;
        }

        .info p {
          margin: 2px 0;
        }

        .table {
          font-size: 13px;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }

        .head {
          font-weight: bold;
        }

        .total {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 15px;
        }

        .footer {
          text-align: center;
          font-size: 12px;
          margin-top: 10px;
        }

        .btn {
          width: 100%;
          margin-top: 8px;
          padding: 10px;
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 14px;
        }

        .print {
          background: #22c55e;
        }

        .download {
          background: #3b82f6;
        }

        .wa {
          background: #25D366;
        }

        @media print {
          .btn {
            display: none;
          }
          .nota {
            box-shadow: none;
            border-radius: 0;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}