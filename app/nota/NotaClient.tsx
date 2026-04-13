"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type LayananItem = {
  nama: string;
  harga: number;
  berat: number;
};

type Nota = {
  id: number;
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

  useEffect(() => {
    const transaksi = localStorage.getItem("transaksi");

    if (transaksi) {
      const parsed: Nota[] = JSON.parse(transaksi);
      const found = parsed.find((item) => item.id === Number(id));

      if (found) setData(found);
    }
  }, [id]);

  const formatRupiah = (angka: number) => {
    return "Rp " + angka.toLocaleString("id-ID");
  };

  const kirimWA = () => {
    if (!data) return;

    const pesan = `
  *LAUNDRY ANDA*
  -------------------------
  No: ${data.nomor}
  Nama: ${data.nama}
  WA: ${data.wa}
  Tgl: ${data.tanggal}
  Ambil: ${data.tanggalSelesai}

  ${data.layanan
    .map(
      (item) =>
        `${item.nama} (${item.berat} Kg x ${formatRupiah(item.harga)}) = ${formatRupiah(item.harga * item.berat)}`
    )
    .join("\n")}

  -------------------------
  Total: ${formatRupiah(data.total)}

  Terima kasih 🙏
  `;

    const encoded = encodeURIComponent(pesan);
    const nomor = data.wa.replace(/^0/, "62");

    window.open(`https://wa.me/${nomor}?text=${encoded}`, "_blank");
  };

  if (!data) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <>
      <div className="nota">
        <div className="center">
          <img src="/logo.png" className="logo" />
          <h2>LAUNDRY ANDA</h2>
          <p>Cuci • Setrika • Express</p>
          <p>WA: 0813-4703-3944</p>
        </div>

        <div className="info">
          <p>No: {data.nomor}</p>
          <p>Nama: {data.nama}</p>
          <p>WA: {data.wa}</p>
          <p>Tgl: {data.tanggal}</p>
          <p>Ambil: {data.tanggalSelesai}</p>
        </div>

        <div className="divider" />

        {data.layanan.map((item, i) => (
          <div key={i} className="item">
            <div>{item.nama}</div>
            <div className="row">
              <span>{item.berat} Kg x {formatRupiah(item.harga)}</span>
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
          <p>Terima kasih 🙏</p>
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
        .nota {
          width: 280px;
          margin: auto;
          background: #fff;
          color: #000;
          border: 2px solid #22c55e;
          border-radius: 10px;
          padding: 15px;
          font-family: monospace;
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
          border-top: 1px dashed #000;
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
          font-size: 14px;
        }

        .footer {
          text-align: center;
          margin-top: 10px;
          font-size: 11px;
        }

        .printBtn {
          margin-top: 10px;
          width: 100%;
          padding: 12px;
          background: #22c55e;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 16px;
        }

        .waBtn {
          margin-top: 10px;
          width: 100%;
          padding: 12px;
          background: #25D366;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 16px;
        }

        @media print {
          body {
            margin: 0;
          }
          .printBtn {
            display: none;
          }
          .nota {
            border: none;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}