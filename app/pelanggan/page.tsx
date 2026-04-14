"use client";
import { useEffect, useState } from "react";

type Pelanggan = {
  id: string;
  nama: string;
  wa: string;
};

type Transaksi = {
  id: string;
  nama: string;
  tanggal: string;
  total: number;
};

export default function PelangganPage() {
  const [pelanggan, setPelanggan] = useState<Pelanggan[]>([]);
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [nama, setNama] = useState("");
  const [wa, setWa] = useState("");

  useEffect(() => {
    const p = localStorage.getItem("pelanggan");
    const t = localStorage.getItem("transaksi");

    if (p) setPelanggan(JSON.parse(p));
    if (t) setTransaksi(JSON.parse(t));
  }, []);

  const simpan = () => {
    if (!nama || !wa) return alert("Isi semua data");

    const dataBaru = {
      id: Date.now().toString(),
      nama,
      wa,
    };

    const updated = [...pelanggan, dataBaru];
    setPelanggan(updated);
    localStorage.setItem("pelanggan", JSON.stringify(updated));

    setNama("");
    setWa("");
  };

  const hapus = (id: string) => {
    const updated = pelanggan.filter((p) => p.id !== id);
    setPelanggan(updated);
    localStorage.setItem("pelanggan", JSON.stringify(updated));
  };

  const getRiwayat = (nama: string) => {
    return transaksi.filter((t) => t.nama === nama);
  };

  const kirimWA = (p: Pelanggan) => {
    const riwayat = getRiwayat(p.nama);
    const total = riwayat.reduce((s, t) => s + t.total, 0);

    const pesan = `Halo ${p.nama},
Terima kasih sudah menggunakan jasa laundry kami.

Total transaksi Anda: Rp ${total.toLocaleString("id-ID")}
Jumlah order: ${riwayat.length}

Kami tunggu kedatangan Anda kembali 🙏`;

    const url = `https://wa.me/${p.wa}?text=${encodeURIComponent(pesan)}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Data Pelanggan</h2>

      {/* FORM */}
      <div style={card}>
        <h3>Tambah Pelanggan</h3>
        <input
          placeholder="Nama"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          style={input}
        />
        <input
          placeholder="No WhatsApp (628xxx)"
          value={wa}
          onChange={(e) => setWa(e.target.value)}
          style={input}
        />
        <button onClick={simpan} style={btn}>
          Simpan
        </button>
      </div>

      {/* LIST */}
      <div style={card}>
        <h3>Daftar Pelanggan</h3>

        <table width="100%">
          <thead>
            <tr>
              <th>Nama</th>
              <th>WA</th>
              <th>Total Order</th>
              <th>Total Belanja</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {pelanggan.map((p) => {
              const riwayat = getRiwayat(p.nama);
              const total = riwayat.reduce((s, t) => s + t.total, 0);

              return (
                <tr key={p.id}>
                  <td>{p.nama}</td>
                  <td>{p.wa}</td>
                  <td>{riwayat.length}</td>
                  <td>Rp {total.toLocaleString("id-ID")}</td>
                  <td>
                    <button onClick={() => kirimWA(p)} style={btnSmall}>
                      WA
                    </button>
                    <button onClick={() => hapus(p.id)} style={btnDanger}>
                      Hapus
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* STYLE */
const card = {
  background: "white",
  padding: "15px",
  borderRadius: "10px",
  marginTop: "20px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
};

const input = {
  display: "block",
  marginBottom: "10px",
  padding: "8px",
  width: "100%",
};

const btn = {
  padding: "10px",
  background: "#2ecc71",
  color: "white",
  border: "none",
  borderRadius: "6px",
};

const btnSmall = {
  padding: "5px 10px",
  marginRight: "5px",
  background: "#3498db",
  color: "white",
  border: "none",
  borderRadius: "5px",
};

const btnDanger = {
  padding: "5px 10px",
  background: "#e74c3c",
  color: "white",
  border: "none",
  borderRadius: "5px",
};