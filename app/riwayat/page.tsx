"use client";
import { useEffect, useState } from "react";

export default function RiwayatPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    try {
      const getData = localStorage.getItem("transaksi");
      if (getData) {
        const parsed = JSON.parse(getData);
        if (Array.isArray(parsed)) {
          setData(parsed.reverse());
        }
      }
    } catch (error) {
      console.log("ERROR LOAD RIWAYAT:", error);
    }
  }, []);

  const formatRupiah = (angka) => {
    return Number(angka).toLocaleString("id-ID");
  };

  const hapusTransaksi = (id) => {
    const konfirmasi = confirm("Yakin ingin menghapus?");
    if (!konfirmasi) return;

    const dataBaru = data.filter((item) => item.id !== id);
    setData(dataBaru);
    localStorage.setItem("transaksi", JSON.stringify(dataBaru));
  };

  const today = new Date().toLocaleDateString();

  const transaksiHariIni = data.filter((item) =>
    item.tanggal.includes(today)
  );

  const totalHariIni = transaksiHariIni.reduce((sum, item) => sum + item.total, 0);

  const cetakUlang = (id) => {
    window.open(`/nota?id=${id}`, "_blank");
  };


  return (
    <div
      style={{
        backgroundColor: "#2ecc71",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          color: "black",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>Riwayat Transaksi</h2>

<div
  style={{
    backgroundColor: "#dff9fb",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "10px"
  }}
>
  <p><b>Laporan Hari Ini</b></p>
  <p>Jumlah Transaksi: {transaksiHariIni.length}</p>
  <p>Total Pendapatan: Rp {formatRupiah(totalHariIni)}</p>
</div>

        {data.length === 0 && (
          <p style={{ color: "red" }}>Belum ada transaksi</p>
        )}

        {data.map((trx, index) => (
          <div
            key={trx.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "10px",
            }}
          >
            <p><b>Nama:</b> {trx.nama}</p>
            <p><b>WA:</b> {trx.wa}</p>
            <p><b>Tanggal:</b> {trx.tanggal}</p>
            <p><b>Selesai:</b> {trx.tanggalSelesai}</p>

            <table style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#bdc3c7" }}>
                  <th style={{ border: "1px solid #999", padding: "5px" }}>Layanan</th>
                  <th style={{ border: "1px solid #999", padding: "5px" }}>Harga</th>
                  <th style={{ border: "1px solid #999", padding: "5px" }}>Berat</th>
                  <th style={{ border: "1px solid #999", padding: "5px" }}>Total</th>
                </tr>
              </thead>

              <tbody>
                {trx.layanan.map((item, i) => (
                  <tr key={i}>
                    <td style={{ border: "1px solid #999", padding: "5px" }}>{item.nama}</td>
                    <td style={{ border: "1px solid #999", padding: "5px" }}>
                      Rp {formatRupiah(item.harga)}
                    </td>
                    <td style={{ border: "1px solid #999", padding: "5px" }}>
                      {item.berat} Kg
                    </td>
                    <td style={{ border: "1px solid #999", padding: "5px" }}>
                      Rp {formatRupiah(item.harga * item.berat)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p style={{ marginTop: "10px", fontWeight: "bold" }}>
              Total: Rp {formatRupiah(trx.total)}
            </p>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
  
              <button
                onClick={() => cetakUlang(trx.id)}
                style={{
                  backgroundColor: "blue",
                  color: "white",
                  padding: "5px 10px",
                  border: "none",
                  borderRadius: "5px",
                  flex: 1
                }}
              >
                Cetak Ulang
              </button>

              <button
                onClick={() => hapusTransaksi(trx.id)}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  padding: "5px 10px",
                  border: "none",
                  borderRadius: "5px",
                  flex: 1
                }}
              >
                Hapus
              </button>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}