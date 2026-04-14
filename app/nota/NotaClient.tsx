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
  id: string; // 🔥 FIX (string)
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

      if (!transaksi) {
        setLoading(false);
        return;
      }

      const parsed: Nota[] = JSON.parse(transaksi);

      // 🔥 FIX CARI ID STRING
      const found = parsed.find((item) => item.id === id);

      if (found) {
        setData(found);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [id]);

  const formatRupiah = (angka: number) => {
    return "Rp " + angka.toLocaleString("id-ID");
  };

  const formatTanggal = (tgl: string) => {
    const d = new Date(tgl);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const kirimWA = async () => {
    if (!data) return;

    const element = document.querySelector(".nota") as HTMLElement;

    if (!element) {
      alert("Nota tidak ditemukan");
      return;
    }

    try {
      const canvas = await html2canvas(element);
      const image = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = image;
      link.download = `nota-${data.nomor}.png`;
      link.click();

      const nomor = data.wa.replace(/^0/, "62");
      window.open(`https://wa.me/${nomor}`, "_blank");

      alert("Nota sudah didownload & siap dikirim ke WhatsApp");
    } catch (error) {
      console.log(error);
      alert("Gagal membuat gambar nota");
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="centerPage">
        <p>Memuat nota...</p>
      </div>
    );
  }

  /* ================= DATA TIDAK ADA ================= */
  if (!data) {
    return (
      <div className="centerPage">
        <p>❌ Data nota tidak ditemukan</p>
      </div>
    );
  }

  return (
    <>
      <div className="nota">
        <div className="center">
          <img src="/logo.png" className="logo" />
          <h2>AI LAUNDRY</h2>
          <p>Bersih • Wangi • Rapi</p>
          <p>WA: 0813-4703-3944</p>
        </div>

        <div className="info">
          <p>No: {data.nomor}</p>
          <p>Nama: {data.nama}</p>
          <p>WA: {data.wa}</p>
          <p>Tgl: {formatTanggal(data.tanggal)}</p>
          <p>Ambil: {formatTanggal(data.tanggalSelesai)}</p>
        </div>

        <div className="divider" />

        {data.layanan.map((item, i) => (
          <div key={i} className="item">
            <div>{item.nama}</div>
            <div className="row">
              <span>
                {item.berat} Kg x {formatRupiah(item.harga)}
              </span>
              <span>{formatRupiah(item.harga * item.berat)}</span>
            </div>
          </div>
        ))}

        <div className="divider" />

        <div className="total">
          <span>Total</span>
          <span>{formatRupiah(data.total)}</span>
        </div>

        <div className="footer">
          <p>
            Terima kasih dari ai Laundry — cucian beres, kamu tinggal tampil
            percaya diri 😎
          </p>
          <p>Simpan nota ini saat pengambilan</p>
        </div>

        <button onClick={() => window.print()} className="printBtn">
          🖨 Print
        </button>

        <button onClick={kirimWA} className="waBtn">
          📲 Kirim WhatsApp
        </button>
      </div>

      <style jsx>{`
        .centerPage {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }

        .nota {
          width: 300px;
          margin: auto;
          background: #fff;
          border-radius: 12px;
          padding: 18px;
          font-family: monospace;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .center {
          text-align: center;
        }

        .logo {
          width: 70px;
          margin-bottom: 5px;
        }

        .info p {
          margin: 2px 0;
        }

        .divider {
          border-top: 1px dashed #999;
          margin: 10px 0;
        }

        .item {
          margin-bottom: 5px;
        }

        .row {
          display: flex;
          justify-content: space-between;
        }

        .total {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 15px;
        }

        .footer {
          text-align: center;
          margin-top: 10px;
          font-size: 11px;
          color: #555;
        }

        .printBtn {
          margin-top: 10px;
          width: 100%;
          padding: 12px;
          background: #22c55e;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 16px;
        }

        .waBtn {
          margin-top: 10px;
          width: 100%;
          padding: 12px;
          background: #25D366;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 16px;
        }

        @media print {
          .printBtn, .waBtn {
            display: none;
          }
          .nota {
            box-shadow: none;
            border: none;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}