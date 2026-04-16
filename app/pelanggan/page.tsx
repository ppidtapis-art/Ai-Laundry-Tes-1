"use client";
import { useEffect, useState } from "react";

type Trx = {
  id: string;
  nama: string;
  wa: string;
  total: number;
  tanggal?: string;
};

type Pelanggan = {
  nama: string;
  wa: string;
  total: number;
};

export default function PelangganPage() {
  const [data, setData] = useState<Pelanggan[]>([]);
  const [selected, setSelected] = useState<Pelanggan | null>(null);
  const [riwayat, setRiwayat] = useState<Trx[]>([]);

  useEffect(() => {
    const trx: Trx[] = JSON.parse(localStorage.getItem("transaksi") || "[]");

    const map: { [key: string]: Pelanggan } = {};

    trx.forEach((t) => {
      if (!map[t.wa]) {
        map[t.wa] = {
          nama: t.nama,
          wa: t.wa,
          total: 0,
        };
      }
      map[t.wa].total += t.total || 0;
    });

    const result = Object.values(map).sort((a, b) => b.total - a.total);
    setData(result);
  }, []);

  /* HANDLE KLIK */
  const handleClick = (p: Pelanggan) => {
    const trx: Trx[] = JSON.parse(localStorage.getItem("transaksi") || "[]");

    const filtered = trx
      .filter((t) => t.wa === p.wa)
      .sort((a, b) =>
        (b.tanggal || "").localeCompare(a.tanggal || "")
      );

    setSelected(p);
    setRiwayat(filtered);
  };

  /* LEVEL */
  const getLevel = (total: number) => {
    if (total >= 2000000) return "Platinum";
    if (total >= 1000000) return "Gold";
    return "Silver";
  };

  /* PROGRESS */
  const getProgress = (total: number) => {
    if (total < 1000000) return (total / 1000000) * 100;
    if (total < 2000000) return (total / 2000000) * 100;
    return 100;
  };

  const getNextTarget = (total: number) => {
    if (total < 1000000) return 1000000 - total;
    if (total < 2000000) return 2000000 - total;
    return 0;
  };

  const getColor = (level: string) => {
    if (level === "Platinum") return "#8e44ad";
    if (level === "Gold") return "#f1c40f";
    return "#bdc3c7";
  };

  const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

  /* STATISTIK */
  const totalSemua = data.reduce((a, b) => a + b.total, 0);
  const jumlahPelanggan = data.length;

  /* ===============================
     🔥 EXPORT JSON
  =============================== */
  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "data_pelanggan.json";
    a.click();
  };

  /* ===============================
     🔥 IMPORT JSON
  =============================== */
  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setData(json);
        localStorage.setItem("pelanggan_backup", JSON.stringify(json));
        alert("Import berhasil");
      } catch {
        alert("File tidak valid");
      }
    };
    reader.readAsText(file);
  };

  /* ===============================
     🔥 CETAK
  =============================== */
  const cetak = () => {
    const isi = data
      .map(
        (p, i) =>
          `${i + 1}. ${p.nama}\n${p.wa}\nTotal: ${formatRp(p.total)}\n`
      )
      .join("\n");

    const win = window.open("", "", "width=800,height=600");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Data Pelanggan</title>
        </head>
        <body>
          <h2>Data Pelanggan</h2>
          <pre>${isi}</pre>
          <script>window.print()</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>👥 Data Pelanggan</h2>
      <div style={{ display: "flex", gap: 10, margin: "10px 0" }}>
        <button onClick={cetak}>🖨️ Cetak</button>
        <button onClick={exportData}>⬇️ Export</button>
        <label style={{ border: "1px solid #ccc", padding: "5px 10px", cursor: "pointer" }}>
          ⬆️ Import
          <input type="file" accept="application/json" hidden onChange={importData} />
        </label>
      </div>

      {/* STATISTIK */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <div style={card}>
          <div>Total Pelanggan</div>
          <b>{jumlahPelanggan}</b>
        </div>

        <div style={card}>
          <div>Total Omzet</div>
          <b>{formatRp(totalSemua)}</b>
        </div>
      </div>

      {/* RANKING */}
      <div>
        {data.map((p, i) => {
          const level = getLevel(p.total);
          const progress = getProgress(p.total);
          const next = getNextTarget(p.total);

          return (
            <div
              key={i}
              style={{ ...rowCard, cursor: "pointer" }}
              onClick={() => handleClick(p)}
            >
              <div style={{ fontWeight: "bold" }}>
                #{i + 1} {p.nama}
              </div>

              <div style={{ fontSize: 12 }}>{p.wa}</div>

              <div style={{ marginTop: 5 }}>
                Total: <b>{formatRp(p.total)}</b>
              </div>

              {/* LEVEL */}
              <div
                style={{
                  marginTop: 5,
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: 10,
                  background: getColor(level),
                  color: "#fff",
                  fontSize: 12,
                }}
              >
                {level}
              </div>

              {/* PROGRESS */}
              <div style={{ marginTop: 8 }}>
                <div
                  style={{
                    width: "100%",
                    height: 6,
                    background: "#eee",
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: "100%",
                      background: getColor(level),
                      borderRadius: 10,
                    }}
                  />
                </div>

                <div style={{ fontSize: 10, marginTop: 3 }}>
                  {next > 0
                    ? `Kurang ${formatRp(next)} lagi`
                    : "Level Maksimal 🎉"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL RIWAYAT */}
      {selected && (
        <div style={{ marginTop: 30 }}>
          <h3>📄 Riwayat: {selected.nama}</h3>
          <div style={{ fontSize: 12, marginBottom: 10 }}>
            {selected.wa}
          </div>

          {riwayat.map((t, i) => (
            <div key={i} style={detailCard}>
              <div>
                <b>{formatRp(t.total)}</b>
              </div>
              <div style={{ fontSize: 12 }}>
                {t.tanggal
                  ? new Date(t.tanggal).toLocaleDateString("id-ID")
                  : "-"}
              </div>
            </div>
          ))}

          {riwayat.length === 0 && <div>Tidak ada transaksi</div>}
        </div>
      )}
    </div>
  );
}

/* STYLE */
const card: React.CSSProperties = {
  flex: 1,
  padding: 12,
  borderRadius: 10,
  background: "#f1f5f9",
};

const rowCard: React.CSSProperties = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid #ddd",
  marginBottom: 10,
};

const detailCard: React.CSSProperties = {
  padding: 10,
  border: "1px solid #eee",
  borderRadius: 8,
  marginBottom: 8,
};