"use client";
import { useEffect, useState } from "react";

type LayananItem = {
  nama: string;
  harga: number;
  berat: number;
};

type StatusType = "proses" | "selesai" | "diambil";

type Transaksi = {
  id: string;
  nomor: string;
  nama: string;
  wa: string;
  tanggal: string;
  tanggalSelesai: string;
  layanan: LayananItem[];
  total: number;
  status?: StatusType;
};

export default function RiwayatPage() {
  const [data, setData] = useState<Transaksi[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const getData = localStorage.getItem("transaksi");
    if (getData) {
      const parsed: Transaksi[] = JSON.parse(getData);

      // default status = proses
      const withStatus = parsed.map((d) => ({
        ...d,
        status: d.status || "proses",
      }));

      setData([...withStatus].reverse());
    }
  }, []);

  const formatRupiah = (n: number) =>
    n.toLocaleString("id-ID");

  const updateStatus = (id: string, status: StatusType) => {
    const updated = data.map((d) =>
      d.id === id ? { ...d, status } : d
    );

    setData(updated);
    localStorage.setItem("transaksi", JSON.stringify(updated));
  };

  const getStatusStyle = (status: StatusType) => {
    if (status === "proses")
      return { background: "#f1c40f", color: "#000" };
    if (status === "selesai")
      return { background: "#3498db", color: "#fff" };
    return { background: "#2ecc71", color: "#fff" };
  };

  const filtered = data.filter((d) =>
    d.nama.toLowerCase().includes(search.toLowerCase())
  );

  const total = filtered.reduce((s, d) => s + d.total, 0);

  return (
    <div style={styles.container}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2>Laundry POS</h2>
        <Menu text="Dashboard" />
        <Menu text="Transaksi" />
        <Menu text="Riwayat" active />
      </div>

      {/* MAIN */}
      <div style={styles.main}>

        {/* HEADER */}
        <div style={styles.header}>
          <h2>Riwayat Transaksi</h2>
          <input
            placeholder="Cari pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.search}
          />
        </div>

        {/* SUMMARY */}
        <div style={styles.summary}>
          <b>Total:</b> Rp {formatRupiah(total)} |
          <b> Transaksi:</b> {filtered.length}
        </div>

        {/* LIST */}
        <div style={styles.list}>
          {filtered.map((trx) => (
            <div key={trx.id} style={styles.card}>

              <div style={styles.cardTop}>
                <div>
                  <h3>{trx.nama}</h3>
                  <p>{new Date(trx.tanggal).toLocaleString()}</p>
                </div>

                <div style={{
                  ...styles.badge,
                  ...getStatusStyle(trx.status!)
                }}>
                  {trx.status?.toUpperCase()}
                </div>
              </div>

              {/* LAYANAN */}
              <div style={styles.layanan}>
                {trx.layanan.map((l, i) => (
                  <div key={i}>
                    {l.nama} ({l.berat}kg)
                  </div>
                ))}
              </div>

              <h3>Rp {formatRupiah(trx.total)}</h3>

              {/* STATUS BUTTON */}
              <div style={styles.actions}>
                <button onClick={() => updateStatus(trx.id, "proses")}>
                  Proses
                </button>
                <button onClick={() => updateStatus(trx.id, "selesai")}>
                  Selesai
                </button>
                <button onClick={() => updateStatus(trx.id, "diambil")}>
                  Diambil
                </button>
              </div>

              {/* AKSI */}
              <div style={styles.actions}>
                <button onClick={() => window.open(`/nota?id=${trx.id}`)}>
                  Cetak
                </button>
                <button
                  onClick={() => {
                    const updated = data.filter(d => d.id !== trx.id);
                    setData(updated);
                    localStorage.setItem("transaksi", JSON.stringify(updated));
                  }}
                >
                  Hapus
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

/* COMPONENT */
function Menu({ text, active = false }: any) {
  return (
    <div style={{
      padding: "10px",
      background: active ? "#34495e" : "transparent",
      borderRadius: "8px",
      marginBottom: "5px"
    }}>
      {text}
    </div>
  );
}

/* STYLE */
const styles: any = {
  container: { display: "flex", minHeight: "100vh", background: "#f5f6fa" },
  sidebar: { width: "220px", background: "#2c3e50", color: "white", padding: "20px" },
  main: { flex: 1, padding: "20px" },
  header: { display: "flex", justifyContent: "space-between", marginBottom: "20px" },
  search: { padding: "10px", borderRadius: "8px", border: "1px solid #ddd" },
  summary: { marginBottom: "15px" },
  list: { display: "flex", flexDirection: "column", gap: "15px" },
  card: {
    background: "white",
    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0 3px 8px rgba(0,0,0,0.05)"
  },
  cardTop: { display: "flex", justifyContent: "space-between" },
  badge: {
    padding: "5px 10px",
    borderRadius: "8px",
    fontWeight: "bold"
  },
  layanan: { margin: "10px 0" },
  actions: { display: "flex", gap: "10px", marginTop: "10px" }
};