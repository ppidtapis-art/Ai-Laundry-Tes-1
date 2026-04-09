"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type LayananItem = {
  nama: string;
  harga: number;
  berat: number;
};

type Nota = {
  id: number; // 🔥 FIX (tadi string, padahal Date.now number)
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

      const found = parsed.find((item) => item.id === Number(id)); // 🔥 FIX

      if (found) {
        setData(found);
      }
    }
  }, [id]);

  const formatRupiah = (angka: number | string) => {
    return Number(angka).toLocaleString("id-ID");
  };

  if (!data) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <>
      <div
        style={{
          width: "220px",
          margin: "auto",
          fontFamily: "monospace",
          fontSize: "12px",
          backgroundColor: "white",
          color: "black",
          border: "2px solid green",
          borderRadius: "8px",
          padding: "10px"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <img
            src="/logo.png"
            style={{ width: "80px", display: "block", margin: "auto" }}
          />

          <h3>NOTA LAUNDRY</h3>
          <p style={{ margin: 0 }}>Terima Jasa Cuci & Setrika</p>
          <p style={{ margin: 0 }}>HP/WA : 0813 4703 3944</p>
        </div>

        <p>No Nota: {data.nomor}</p>
        <p>Nama: {data.nama}</p>
        <p>WA: {data.wa}</p>
        <p>Tanggal: {data.tanggal}</p>
        <p>Selesai: {data.tanggalSelesai}</p>

        <hr />

        {data.layanan.map((item, i) => (
          <div key={i} style={{ marginBottom: "5px" }}>
            <div>{item.nama}</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>
                {item.berat} Kg x {formatRupiah(item.harga)}
              </span>
              <span>
                {formatRupiah(item.harga * item.berat)}
              </span>
            </div>
          </div>
        ))}

        <hr />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <b>Total</b>
          <b>Rp {formatRupiah(data.total)}</b>
        </div>

        <button
          onClick={() => window.print()}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "10px",
            backgroundColor: "green",
            color: "white",
            border: "none",
            borderRadius: "5px"
          }}
        >
          Print
        </button>
      </div>

      <style jsx>{`
        @media print {
          button {
            display: none;
          }
        }
      `}</style>
    </>
  );
}