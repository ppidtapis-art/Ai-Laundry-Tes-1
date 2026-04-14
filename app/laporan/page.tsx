"use client";
import { useEffect, useState, useRef } from "react";
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
import * as XLSX from "xlsx";

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
  const [search, setSearch] = useState("");

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const get = JSON.parse(localStorage.getItem("transaksi") || "[]");

    // FIX DATA LAMA
    const fixed = get.map((d: any, i: number) => ({
      id: d.id || i.toString(),
      nama: d.nama || "-",
      tanggal: d.tanggal || new Date().toISOString(),
      total: Number(d.total) || 0,
    }));

    setData(fixed);
  }, []);

  const today = new Date();

  const filterData = () => {
    return data.filter((d) => {
      const tgl = new Date(d.tanggal);

      if (search && !d.nama.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

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

  /* PDF dari PREVIEW */
  const exportPDF = () => {
    const pdf = new jsPDF();
    let y = 10;

    pdf.setFontSize(16);
    pdf.text("AI LAUNDRY", 105, y, { align: "center" });

    y += 8;
    pdf.setFontSize(10);
    pdf.text("Laporan Keuangan", 105, y, { align: "center" });

    y += 10;
    pdf.text(`Total: Rp ${formatRp(total)}`, 14, y);
    y += 6;
    pdf.text(`Transaksi: ${hasil.length}`, 14, y);

    y += 10;

    hasil.forEach((d) => {
      pdf.text(`${d.nama}`, 14, y);
      pdf.text(new Date(d.tanggal).toLocaleDateString(), 80, y);
      pdf.text(`Rp ${formatRp(d.total)}`, 150, y);
      y += 6;
    });

    pdf.save("laporan.pdf");
  };

  /* EXCEL */
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(hasil);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, "laporan.xlsx");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📊 Laporan Keuangan</h1>

      {/* FILTER */}
      <div className="grid md:grid-cols-5 gap-3 mb-4">
        <select
          className="border p-2 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="hari">Hari Ini</option>
          <option value="minggu">7 Hari</option>
          <option value="bulan">Bulan Ini</option>
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <input
          placeholder="Cari pelanggan..."
          className="border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-2">
          <button onClick={exportPDF} className="bg-blue-600 text-white px-3 rounded">
            PDF
          </button>
          <button onClick={exportExcel} className="bg-green-600 text-white px-3 rounded">
            Excel
          </button>
          <button onClick={() => window.print()} className="bg-gray-700 text-white px-3 rounded">
            Print
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="bg-white shadow rounded p-4 mb-4 flex justify-between">
        <div>
          <p className="text-lg font-semibold">Rp {formatRp(total)}</p>
          <p className="text-sm text-gray-500">Total Omzet</p>
        </div>
        <div>
          <p className="text-lg font-semibold">{hasil.length}</p>
          <p className="text-sm text-gray-500">Transaksi</p>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-white shadow rounded p-4 mb-4">
        {Object.keys(group).length === 0 ? (
          <p>Tidak ada data</p>
        ) : (
          <Line data={chartData} />
        )}
      </div>

      {/* PREVIEW CETAK (INI YANG KAMU MAU) */}
      <div ref={printRef} className="bg-white shadow rounded p-6 mt-6">
        <h2 className="text-lg font-bold text-center">AI LAUNDRY</h2>
        <p className="text-center text-sm mb-4">Laporan Keuangan</p>

        <div className="mb-4 text-sm">
          <p>Total: Rp {formatRp(total)}</p>
          <p>Transaksi: {hasil.length}</p>
        </div>

        <table className="w-full text-sm border">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-2 text-left">Nama</th>
              <th className="p-2 text-left">Tanggal</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {hasil.map((d) => (
              <tr key={d.id} className="border-b">
                <td className="p-2">{d.nama}</td>
                <td className="p-2">
                  {new Date(d.tanggal).toLocaleDateString()}
                </td>
                <td className="p-2 text-right">
                  Rp {formatRp(d.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 text-right text-sm">
          <p>Pemilik</p>
          <br />
          <p>(______________)</p>
        </div>
      </div>
    </div>
  );
}