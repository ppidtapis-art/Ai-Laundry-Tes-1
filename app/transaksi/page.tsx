"use client";
import { useState, useEffect } from "react";

type LayananItem = {
nama: string;
harga: number;
};

type SelectedLayanan = {
nama: string;
harga: number;
berat: number;
};

type Transaksi = {
id: number;
nomor: string;
tanggal: string;
tanggalSelesai: string;
nama: string;
wa: string;
layanan: SelectedLayanan[];
total: number;
};

export default function TransaksiPage() {
const [layanan, setLayanan] = useState<LayananItem[]>([]);
const [selectedLayanan, setSelectedLayanan] = useState<SelectedLayanan[]>([]);
const [tanggalSelesai, setTanggalSelesai] = useState("");
const [nama, setNama] = useState("");
const [wa, setWa] = useState("");

const [pelangganList, setPelangganList] = useState<{ nama: string; wa: string }[]>([]);
const [selectedPelanggan, setSelectedPelanggan] = useState("");

// ambil layanan
useEffect(() => {
try {
const data = localStorage.getItem("layanan");


  if (data) {
    const parsed: LayananItem[] = JSON.parse(data);

    if (Array.isArray(parsed)) {
      setLayanan(parsed);
    }
  }
} catch (error) {
  console.log("ERROR AMBIL LAYANAN:", error);
}


}, []);

// ambil pelanggan
useEffect(() => {
const data = localStorage.getItem("pelanggan");
if (data) {
setPelangganList(JSON.parse(data));
}
}, []);

// hitung total
const total = selectedLayanan.reduce((sum, item) => {
return sum + item.harga * item.berat;
}, 0);

const formatRupiah = (angka: number | string) => {
return Number(angka).toLocaleString("id-ID");
};

const getNomorNota = () => {
const data = localStorage.getItem("transaksi");
const transaksi: Transaksi[] = data ? JSON.parse(data) : [];


const nomor = transaksi.length + 1;
return "TRX-" + nomor.toString().padStart(3, "0");


};

const simpanTransaksi = (): Transaksi | null => {
if (!nama || !wa || selectedLayanan.length === 0) {
alert("Lengkapi data terlebih dahulu!");
return null;
}


const transaksiBaru: Transaksi = {
  id: Date.now(),
  nomor: getNomorNota(),
  tanggal: new Date().toLocaleString(),
  tanggalSelesai,
  nama,
  wa,
  layanan: selectedLayanan,
  total,
};

try {
  const dataLama = localStorage.getItem("transaksi");
  const transaksi: Transaksi[] = dataLama ? JSON.parse(dataLama) : [];

  transaksi.push(transaksiBaru);
  localStorage.setItem("transaksi", JSON.stringify(transaksi));

  // simpan pelanggan
  const dataPelanggan = localStorage.getItem("pelanggan");
  let pelanggan = dataPelanggan ? JSON.parse(dataPelanggan) : [];

  const sudahAda = pelanggan.find((p: any) => p.wa === wa);

  if (!sudahAda) {
    pelanggan.push({ nama, wa });
    localStorage.setItem("pelanggan", JSON.stringify(pelanggan));
  }

  setNama("");
  setWa("");
  setTanggalSelesai("");
  setSelectedLayanan([]);
  setSelectedPelanggan("");

  return transaksiBaru;
} catch (error) {
  console.log("ERROR:", error);
  return null;
}


};

const handlePrint = () => {
const data = simpanTransaksi();
    if (!data) return;

    window.open(`/nota?id=${data.id}`, "_blank");
    };

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  marginTop: "5px",
  outline: "none",
};

return (
  <div
    style={{
      background: "linear-gradient(135deg, #27ae60, #2ecc71)",
      minHeight: "100vh",
      padding: "20px",
      display: "flex",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: "900px",
        background: "#ffffff",
        borderRadius: "16px",
        padding: "25px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>🧾 Input Transaksi</h2>

      {/* GRID FORM */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px",
        }}
      >
        {/* Pelanggan */}
        <div style={{ gridColumn: "span 2" }}>
          <label>Pilih Pelanggan</label>
          <select
            value={selectedPelanggan}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedPelanggan(value);

              const found = pelangganList.find(
                (p) => p.nama + "|" + p.wa === value
              );

              if (found) {
                setNama(found.nama);
                setWa(found.wa);
              }
            }}
            style={inputStyle}
          >
            <option value="">-- Pilih Pelanggan --</option>
            {pelangganList.map((p, i) => (
              <option key={i} value={p.nama + "|" + p.wa}>
                {p.nama} - {p.wa}
              </option>
            ))}
          </select>
        </div>

        {/* Tanggal */}
        <div>
          <label>Tanggal Selesai</label>
          <input
            type="date"
            value={tanggalSelesai}
            onChange={(e) => setTanggalSelesai(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Nama */}
        <div>
          <label>Nama</label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama pelanggan"
            style={inputStyle}
          />
        </div>

        {/* WA */}
        <div>
          <label>WhatsApp</label>
          <input
            type="text"
            value={wa}
            onChange={(e) => setWa(e.target.value)}
            placeholder="08xxxx"
            style={inputStyle}
          />
        </div>
      </div>

      {/* LAYANAN */}
      <div style={{ marginTop: "25px" }}>
        <h3>Pilih Layanan</h3>

        {layanan.map((item) => {
          const existing = selectedLayanan.find(
            (l) => l.nama === item.nama
          );

          return (
            <div
              key={item.nama}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            >
              <div>
                <input
                  type="checkbox"
                  checked={!!existing}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLayanan([
                        ...selectedLayanan,
                        {
                          nama: item.nama,
                          harga: item.harga,
                          berat: 0,
                        },
                      ]);
                    } else {
                      setSelectedLayanan(
                        selectedLayanan.filter(
                          (l) => l.nama !== item.nama
                        )
                      );
                    }
                  }}
                />{" "}
                {item.nama} (Rp {formatRupiah(item.harga)})
              </div>

              {existing && (
                <input
                  type="number"
                  value={existing.berat}
                  onChange={(e) => {
                    const newData = selectedLayanan.map((l) =>
                      l.nama === item.nama
                        ? {
                            ...l,
                            berat: parseFloat(e.target.value) || 0,
                          }
                        : l
                    );
                    setSelectedLayanan(newData);
                  }}
                  placeholder="Kg"
                  style={{
                    width: "80px",
                    padding: "6px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* TOTAL */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          background: "#f8f9fa",
          borderRadius: "10px",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        Total: Rp {formatRupiah(total)}
      </div>

      {/* BUTTON */}
      <button
        onClick={handlePrint}
        style={{
          width: "100%",
          marginTop: "20px",
          padding: "15px",
          fontSize: "16px",
          background: "#27ae60",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        🖨 Simpan & Cetak
      </button>
    </div>
  </div>
);
}
