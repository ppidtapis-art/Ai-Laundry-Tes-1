"use client";
import { useEffect, useState } from "react";

type Trx = {
  id: string;
  nama: string;
  wa: string;
  total: number;
  subtotal?: number;
  tanggal?: string;
  items?: any[];
};

type Pelanggan = {
  nama: string;
  wa: string;
  total: number;

  // 🔥 BONUS SYSTEM
  totalBerat: number;
  bonusCount: number;
  siapBonus: boolean;
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
          totalBerat: 0,
          bonusCount: 0,
          siapBonus: false,
        };
      }

      map[t.wa].total += t.subtotal || t.total || 0;

      // 🔥 hitung berat
      if (t.items) {
        t.items.forEach((item: any) => {
          if (item.tipe === "kg") {
            map[t.wa].totalBerat += item.berat || 0;
          }
        });
      }
    });

    Object.values(map).forEach((p) => {
      // 🔥 hanya 3x bonus
      if (p.bonusCount < 3 && p.totalBerat >= 30) {
        p.siapBonus = true;
      } else {
        p.siapBonus = false;
      }
    });

    const result = Object.values(map).sort((a, b) => b.total - a.total);
    setData(result);
  }, []);

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

  const totalSemua = data.reduce((a, b) => a + b.total, 0);
  const jumlahPelanggan = data.length;

  const hapusRiwayat = (wa: string) => {
    const trx: Trx[] = JSON.parse(localStorage.getItem("transaksi") || "[]");

    // hapus semua transaksi pelanggan ini
    const filtered = trx.filter((t) => t.wa !== wa);

    localStorage.setItem("transaksi", JSON.stringify(filtered));

    // 🔥 hapus juga dari pelanggan
    const pelanggan = JSON.parse(localStorage.getItem("pelanggan") || "[]");
    const filteredPelanggan = pelanggan.filter((p: any) => p.wa !== wa);
    localStorage.setItem("pelanggan", JSON.stringify(filteredPelanggan));

    // refresh data
    window.location.reload();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>👥 Data Pelanggan</h2>

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

      {/* LIST */}
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
            <b>#{i + 1} {p.nama}</b>
            <div style={{ fontSize: 12 }}>{p.wa}</div>

            <div>Total: <b>{formatRp(p.total)}</b></div>

            {/* BONUS INFO */}
            <div style={{ fontSize: 12, marginTop: 5 }}>
              Berat: {p.totalBerat.toFixed(1)} kg
            </div>

            <div style={{ fontSize: 12 }}>
              Bonus dipakai: {p.bonusCount} / 3
            </div>

            <div style={{ fontSize: 12, color: p.siapBonus ? "green" : "gray" }}>
              {p.siapBonus ? "🎁 Bonus 2.5kg siap dipakai" : "Belum mencapai bonus"}
            </div>

            {/* LEVEL */}
            <div style={{
              marginTop: 5,
              padding: "2px 8px",
              borderRadius: 10,
              background: getColor(level),
              color: "#fff",
              fontSize: 12,
              display: "inline-block"
            }}>
              {level}
            </div>

            {/* PROGRESS */}
            <div style={{ marginTop: 8 }}>
              <div style={{ width: "100%", height: 6, background: "#eee", borderRadius: 10 }}>
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: getColor(level),
                    borderRadius: 10,
                  }}
                />
              </div>

              <div style={{ fontSize: 10 }}>
                {next > 0 ? `Kurang ${formatRp(next)} lagi` : "Level Maksimal 🎉"}
              </div>
            </div>
          </div>
        );
      })}

      {/* RIWAYAT */}
      {selected && (
        <div style={{ marginTop: 30 }}>
          <h3>📄 Riwayat: {selected.nama}</h3>
          <button
            onClick={() => {
              if (confirm("Yakin hapus semua riwayat pelanggan ini?")) {
                hapusRiwayat(selected.wa);
              }
            }}
            style={{
              background: "red",
              color: "#fff",
              padding: "6px 12px",
              border: "none",
              borderRadius: 6,
              marginBottom: 10,
              cursor: "pointer"
            }}
          >
            🗑️ Hapus Riwayat
          </button>

          {riwayat.map((t, i) => (
            <div key={i} style={detailCard}>
              <b>{formatRp(t.total)}</b>
              <div style={{ fontSize: 12 }}>
                {t.tanggal ? new Date(t.tanggal).toLocaleDateString("id-ID") : "-"}
              </div>
            </div>
          ))}
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