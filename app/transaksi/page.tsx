"use client";
import { useState, useEffect } from "react";

export default function TransaksiPage() {

  const [layanan, setLayanan] = useState([]);
  const [selectedLayanan, setSelectedLayanan] = useState([]);
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [nama, setNama] = useState("");
  const [wa, setWa] = useState("");

  // ambil layanan
  useEffect(() => {
    try {
      const data = localStorage.getItem("layanan");

      if (data) {
        const parsed = JSON.parse(data);
        console.log("DATA LAYANAN MASUK:", parsed);

        if (Array.isArray(parsed)) {
          setLayanan(parsed);
        }
      }
    } catch (error) {
      console.log("ERROR AMBIL LAYANAN:", error);
    }
  }, []);

  // hitung total
  const total = selectedLayanan.reduce((sum, item) => {
    return sum + (item.harga * item.berat);
  }, 0);

  // format rupiah
  const formatRupiah = (angka) => {
    return Number(angka).toLocaleString("id-ID");
  };

  // simpan transaksi (sementara console dulu)
  const simpanDanCetak = () => {
    if (!nama || !wa || selectedLayanan.length === 0) {
      alert("Lengkapi data terlebih dahulu!");
      return;
    }

    const getNomorNota = () => {
      const data = localStorage.getItem("transaksi");
      const transaksi = data ? JSON.parse(data) : [];

      const nomor = transaksi.length + 1;
      return "TRX-" + nomor.toString().padStart(3, "0");
    };

    const transaksiBaru = {
      id: Date.now(),
      nomor: getNomorNota(),
      tanggal: new Date().toLocaleString(),
      tanggalSelesai,
      nama,
      wa,
      layanan: selectedLayanan,
      total
    };

    try {
      const dataLama = localStorage.getItem("transaksi");
      const transaksi = dataLama ? JSON.parse(dataLama) : [];

      transaksi.push(transaksiBaru);

      localStorage.setItem("transaksi", JSON.stringify(transaksi));

      console.log("TERSIMPAN:", transaksiBaru);

      // buka halaman nota
      window.open(`/nota?id=${transaksiBaru.id}`, "_blank");

      // reset form
      setNama("");
      setWa("");
      setTanggalSelesai("");
      setSelectedLayanan([]);

    } catch (error) {
      console.log("ERROR:", error);
    }
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
      <h2 className="font-bold mb-3">Input Transaksi</h2>

      <label>Tanggal Selesai</label>
      <input
        type="date"
        value={tanggalSelesai}
        onChange={(e) => setTanggalSelesai(e.target.value)}
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          width: "100%",
          marginBottom: "10px",
          borderRadius: "5px",
          color: "black"
        }}
      />

      <label>Nama Pelanggan</label>
      <input
        type="text"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        style={{
  border: "1px solid #ccc",
  padding: "10px",
  width: "100%",
  marginBottom: "10px",
  borderRadius: "5px",
  color: "black"
}}
      />

      <label>Nomor HP / WA</label>
      <input
        type="text"
        value={wa}
        onChange={(e) => setWa(e.target.value)}
        style={{
  border: "1px solid #ccc",
  padding: "10px",
  width: "100%",
  marginBottom: "10px",
  borderRadius: "5px",
  color: "black"
}}
      />

      <div className="mb-2">
        <p className="font-semibold">Pilih Layanan</p>

        {layanan.length === 0 && (
          <p style={{ color: "red" }}>Belum ada layanan</p>
        )}

        {layanan.map((item, index) => {
          const existing = selectedLayanan.find(l => l.nama === item.nama);

          return (
            <div key={index} className="flex items-center gap-2 mb-1">

              <input
                type="checkbox"
                checked={!!existing}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedLayanan([
                      ...selectedLayanan,
                      { nama: item.nama, harga: item.harga, berat: 0 }
                    ]);
                  } else {
                    setSelectedLayanan(
                      selectedLayanan.filter(l => l.nama !== item.nama)
                    );
                  }
                }}
              />

              <span style={{ width: "200px", color: "black" }}>
                {item.nama} (Rp {formatRupiah(item.harga)})
              </span>

              {existing && (
                <input
                  type="number"
                  step="0.1"
                  value={existing.berat}
                  onChange={(e) => {
                    const newData = selectedLayanan.map(l =>
                      l.nama === item.nama
                        ? { ...l, berat: parseFloat(e.target.value) || 0 }
                        : l
                    );
                    setSelectedLayanan(newData);
                  }}
                  className="border p-1 w-20 rounded"
                  placeholder="Kg"
                />
              )}

            </div>
          );
        })}
      </div>

      <div
        style={{
          backgroundColor: "#ecf0f1",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "10px",
          color: "black"
        }}
      >
        <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
          Ringkasan Layanan
        </p>
      
        {selectedLayanan.length === 0 && (
          <p style={{ color: "red" }}>Belum ada layanan dipilih</p>
        )}
      
        {selectedLayanan.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#bdc3c7" }}>
                <th style={{ border: "1px solid #999", padding: "5px" }}>Layanan</th>
                <th style={{ border: "1px solid #999", padding: "5px" }}>Harga</th>
                <th style={{ border: "1px solid #999", padding: "5px" }}>Berat</th>
                <th style={{ border: "1px solid #999", padding: "5px" }}>Total</th>
              </tr>
            </thead>
      
            <tbody>
              {selectedLayanan.map((item, index) => {
                const totalPerItem = item.harga * item.berat;
      
                return (
                  <tr key={index}>
                    <td style={{ border: "1px solid #999", padding: "5px" }}>
                      {item.nama}
                    </td>
                    <td style={{ border: "1px solid #999", padding: "5px" }}>
                      Rp {formatRupiah(item.harga)}
                    </td>
                    <td style={{ border: "1px solid #999", padding: "5px" }}>
                      {item.berat} Kg
                    </td>
                    <td style={{ border: "1px solid #999", padding: "5px" }}>
                      Rp {formatRupiah(totalPerItem)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

  <div style={{ marginTop: "10px", fontWeight: "bold" }}>
    Jumlah Layanan: {selectedLayanan.length}
  </div>

  <div style={{ fontSize: "18px", fontWeight: "bold" }}>
    Total Keseluruhan: Rp {formatRupiah(total)}
  </div>
</div>

      <button
        onClick={simpanDanCetak}
        style={{
          backgroundColor: "green",
          color: "white",
          padding: "10px",
          width: "100%",
          borderRadius: "5px",
          border: "none"
        }}
      >
        Simpan & Cetak Nota
      </button>

        </div>
    </div>
  );
}