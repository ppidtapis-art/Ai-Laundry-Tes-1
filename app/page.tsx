"use client";
import { useEffect, useState } from "react";

type Transaksi = {
  id: string;
  nama: string;
  tanggal: string;
  total: number;
  status?: "proses" | "selesai" | "diambil";
};

export default function DashboardPage() {
  const [data, setData] = useState<Transaksi[]>([]);

  useEffect(() => {
    const getData = localStorage.getItem("transaksi");
    if (getData) {
      const parsed = JSON.parse(getData);

      const withStatus = parsed.map((d: any) => ({
        ...d,
        status: d.status || "proses",
      }));

      setData(withStatus);
    }
  }, []);

  const formatRupiah = (n: number) =>
    n.toLocaleString("id-ID");

  const parse = (t: string) => new Date(t);

  const isSameDay = (a: Date, b: Date) =>
    a.toDateString() === b.toDateString();

  const today = new Date();

  const todayData = data.filter((d) =>
    isSameDay(parse(d.tanggal), today)
  );

  const omzetHari = todayData.reduce((s, d) => s + d.total, 0);

  const proses = data.filter((d) => d.status === "proses").length;
  const selesai = data.filter((d) => d.status === "selesai").length;
  const diambil = data.filter((d) => d.status === "diambil").length;

  const lastTransaksi = [...data].reverse().slice(0, 5);

  return (
    <div style={styles.container}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={{ marginBottom: "20px" }}>Laundry POS</h2>
        <Menu text="Dashboard" active />
        <Menu text="Transaksi" />
        <Menu text="Riwayat" />
        <Menu text="Layanan" />
      </div>

      {/* MAIN */}
      <div style={styles.main}>

        {/* HEADER */}
        <div style={styles.header}>
          <h2>Dashboard</h2>
          <p style={{ color: "#888" }}>
            Ringkasan usaha hari ini
          </p>
        </div>

        {/* CARD UTAMA */}
        <div style={styles.grid}>
          <Card title="Omzet Hari Ini" value={"Rp " + formatRupiah(omzetHari)} highlight />
          <Card title="Transaksi Hari Ini" value={todayData.length} />
          <Card title="Sedang Diproses" value={proses} />
          <Card title="Siap Diambil" value={selesai} />
          <Card title="Sudah Diambil" value={diambil} />
        </div>

        {/* QUICK ACTION */}
        <div style={styles.actions}>
          <ActionButton text="➕ Transaksi Baru" link="/transaksi" />
          <ActionButton text="📋 Lihat Riwayat" link="/riwayat" />
          <ActionButton text="🧾 Cetak Nota" link="/nota" />
        </div>

        {/* TRANSAKSI TERBARU */}
        <div style={styles.tableCard}>
          <h3 style={{ marginBottom: "10px" }}>Transaksi Terbaru</h3>

          <table style={{ width: "100%" }}>
            <thead>
              <tr style={{ background: "#f1f2f6" }}>
                <th style={th}>Nama</th>
                <th style={th}>Tanggal</th>
                <th style={th}>Total</th>
                <th style={th}>Status</th>
              </tr>
            </thead>

            <tbody>
              {lastTransaksi.map((trx) => (
                <tr key={trx.id}>
                  <td style={td}>{trx.nama}</td>
                  <td style={td}>
                    {new Date(trx.tanggal).toLocaleString()}
                  </td>
                  <td style={td}>
                    Rp {formatRupiah(trx.total)}
                  </td>
                  <td style={td}>
                    <StatusBadge status={trx.status!} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function Menu({ text, active = false }: any) {
  return (
    <div style={{
      padding: "10px",
      borderRadius: "8px",
      marginBottom: "5px",
      background: active ? "#34495e" : "transparent",
      cursor: "pointer"
    }}>
      {text}
    </div>
  );
}

function Card({ title, value, highlight = false }: any) {
  return (
    <div style={{
      ...styles.card,
      background: highlight ? "#2ecc71" : "white",
      color: highlight ? "white" : "black"
    }}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

function ActionButton({ text, link }: any) {
  return (
    <button
      onClick={() => (window.location.href = link)}
      style={styles.button}
    >
      {text}
    </button>
  );
}

function StatusBadge({ status }: any) {
  const style =
    status === "proses"
      ? { background: "#f1c40f" }
      : status === "selesai"
      ? { background: "#3498db" }
      : { background: "#2ecc71" };

  return (
    <span style={{
      padding: "5px 10px",
      borderRadius: "8px",
      color: "white",
      ...style
    }}>
      {status}
    </span>
  );
}

/* ================= STYLE ================= */

const styles: any = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#f5f6fa"
  },
  sidebar: {
    width: "230px",
    background: "#2c3e50",
    color: "white",
    padding: "20px"
  },
  main: {
    flex: 1,
    padding: "20px"
  },
  header: {
    marginBottom: "20px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
    gap: "15px",
    marginBottom: "20px"
  },
  card: {
    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0 3px 8px rgba(0,0,0,0.05)"
  },
  actions: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px"
  },
  button: {
    padding: "10px 15px",
    borderRadius: "8px",
    border: "none",
    background: "#3498db",
    color: "white",
    cursor: "pointer"
  },
  tableCard: {
    background: "white",
    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0 3px 8px rgba(0,0,0,0.05)"
  }
};

const th = { padding: "10px", textAlign: "left" as const };
const td = { padding: "10px", borderBottom: "1px solid #eee" };