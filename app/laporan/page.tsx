"use client";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import jsPDF from "jspdf";

/* REGISTER CHART */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type Transaksi = {
  id: string;
  nama: string;
  tanggal: string;
  total: number;
};

export default function LaporanPage() {
  const [data, setData] = useState<Transaksi[]>([]);
  const [filter, setFilter] = useState("hari");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const get = JSON.parse(localStorage.getItem("transaksi") || "[]");
    setData(get);
  }, []);

  const today = new Date();

  /* FILTER */
  const filterData = () => {
    return data.filter((d) => {
      const tgl = new Date(d.tanggal);

      if (startDate && endDate) {
        return tgl >= new Date(startDate) && tgl <= new Date(endDate);
      }

      if (filter === "hari") {
        return tgl.toDateString() === today.toDateString();
      }

      if (filter === "minggu") {
        const m = new Date();
        m.setDate(today.getDate() - 7);
        return tgl >= m;
      }

      if (filter === "bulan") {
        return (
          tgl.getMonth() === today.getMonth() &&
          tgl.getFullYear() === today.getFullYear()
        );
      }

      return true;
    });
  };

  const hasil = filterData();

  const total = hasil.reduce((s, d) => s + d.total, 0);
  const formatRp = (n: number) => n.toLocaleString("id-ID");

  /* CHART */
  const group: Record<string, number> = {};
  hasil.forEach((d) => {
    const t = new Date(d.tanggal).toLocaleDateString();
    group[t] = (group[t] || 0) + d.total;
  });

  const chartData = {
    labels: Object.keys(group),
    datasets: [
      {
        label: "Omzet",
        data: Object.values(group),
        tension: 0.4,
        borderWidth: 3,
      },
    ],
  };

  /* EXPORT PDF */
  const exportPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const w = pdf.internal.pageSize.getWidth();

    /* ===== LOGO ===== */
    // GANTI dengan logo Anda (letakkan di folder public/logo.png)
    pdf.addImage("/logo.png", "PNG", 14, 10, 20, 20);

    /* ===== HEADER ===== */
    pdf.setFontSize(16);
    pdf.text("LAUNDRY ANDA", w / 2, 15, { align: "center" });

    pdf.setFontSize(10);
    pdf.text("Alamat: Desa Tapis", w / 2, 22, { align: "center" });
    pdf.text("HP: 08xxxxxxxxxx", w / 2, 27, { align: "center" });

    pdf.setFontSize(12);
    pdf.text("LAPORAN KEUANGAN", w / 2, 35, { align: "center" });

    const periode =
      startDate && endDate
        ? `${startDate} s/d ${endDate}`
        : filter.toUpperCase();

    pdf.setFontSize(10);
    pdf.text(`Periode: ${periode}`, 14, 45);
    pdf.text(`Total Omzet: Rp ${formatRp(total)}`, 14, 52);
    pdf.text(`Jumlah Transaksi: ${hasil.length}`, 14, 58);

    /* ===== TABEL ===== */
    let y = 70;

    pdf.text("Nama", 14, y);
    pdf.text("Tanggal", 80, y);
    pdf.text("Total", 160, y);

    y += 5;

    hasil.forEach((d) => {
      if (y > 260) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(d.nama, 14, y);
      pdf.text(new Date(d.tanggal).toLocaleDateString(), 80, y);
      pdf.text(`Rp ${formatRp(d.total)}`, 160, y);

      y += 6;
    });

    /* ===== TANDA TANGAN ===== */
    const yTtd = y + 15;

    pdf.text("Mengetahui,", 140, yTtd);
    pdf.text("Pemilik Usaha", 140, yTtd + 5);

    // GANTI dengan tanda tangan (public/ttd.png)
    pdf.addImage("/ttd.png", "PNG", 135, yTtd + 8, 40, 20);

    pdf.text("__________________", 140, yTtd + 35);
    pdf.text("Nama Pemilik", 140, yTtd + 40);

    pdf.save("laporan-resmi.pdf");
  };

  return (
    <div>
      <h2>📊 Laporan Keuangan</h2>

      <button onClick={exportPDF}>📄 Export PDF Resmi</button>

      <div style={{ marginTop: 20 }}>
        <b>Total:</b> Rp {formatRp(total)} | {hasil.length} transaksi
      </div>

      <div style={{ marginTop: 20 }}>
        {Object.keys(group).length === 0 ? (
          <p>Tidak ada data</p>
        ) : (
          <Line data={chartData} />
        )}
      </div>
    </div>
  );
}