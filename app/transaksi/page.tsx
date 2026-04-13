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

```
  if (data) {
    const parsed: LayananItem[] = JSON.parse(data);

    if (Array.isArray(parsed)) {
      setLayanan(parsed);
    }
  }
} catch (error) {
  console.log("ERROR AMBIL LAYANAN:", error);
}
```

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

```
const nomor = transaksi.length + 1;
return "TRX-" + nomor.toString().padStart(3, "0");
```

};

const simpanTransaksi = (): Transaksi | null => {
if (!nama || !wa || selectedLayanan.length === 0) {
alert("Lengkapi data terlebih dahulu!");
return null;
}

```
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
```

};

const handlePrint = () => {
const data = simpanTransaksi();
if (!data) return;

```
window.open(`/nota?id=${data.id}`, "_blank");
```

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
> <h2>Input Transaksi</h2>

```
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
      style={{ width: "100%", marginBottom: "10px" }}
    >
      <option value="">-- Pilih Pelanggan --</option>
      {pelangganList.map((p, i) => (
        <option key={i} value={p.nama + "|" + p.wa}>
          {p.nama} - {p.wa}
        </option>
      ))}
    </select>

    <label>Tanggal Selesai</label>
    <input
      type="date"
      value={tanggalSelesai}
      onChange={(e) => setTanggalSelesai(e.target.value)}
      style={{ width: "100%", marginBottom: "10px" }}
    />

    <label>Nama</label>
    <input
      type="text"
      value={nama}
      onChange={(e) => setNama(e.target.value)}
      style={{ width: "100%", marginBottom: "10px" }}
    />

    <label>WA</label>
    <input
      type="text"
      value={wa}
      onChange={(e) => setWa(e.target.value)}
      style={{ width: "100%", marginBottom: "10px" }}
    />

    <p>Pilih Layanan</p>

    {layanan.map((item) => {
      const existing = selectedLayanan.find(
        (l) => l.nama === item.nama
      );

      return (
        <div key={item.nama}>
          <input
            type="checkbox"
            checked={!!existing}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedLayanan([
                  ...selectedLayanan,
                  { nama: item.nama, harga: item.harga, berat: 0 },
                ]);
              } else {
                setSelectedLayanan(
                  selectedLayanan.filter(
                    (l) => l.nama !== item.nama
                  )
                );
              }
            }}
          />

          {item.nama} (Rp {formatRupiah(item.harga)})

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
            />
          )}
        </div>
      );
    })}

    <h3>Total: Rp {formatRupiah(total)}</h3>

    <button onClick={handlePrint}>
      🖨 Simpan & Cetak
    </button>
  </div>
</div>
```

);
}
