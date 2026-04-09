"use client";
import { useState, useEffect } from "react";

export default function LayananPage() {

  const [layanan, setLayanan] = useState([]);
  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      try {
        const data = localStorage.getItem("layanan");
        if (data) {
          const parsed = JSON.parse(data);
          setLayanan(parsed);
        }
      } catch (error) {
        console.log(error);
      }
    }, 100);
  }, []);

 const tambahLayanan = () => {
    if (!nama || !harga) return;

    const dataBaru = {
      nama: nama,
      harga: parseInt(harga)
    };

    let dataUpdate;

    if (editIndex !== null) {
      dataUpdate = [...layanan];
      dataUpdate[editIndex] = dataBaru;
      setEditIndex(null);
    } else {
      dataUpdate = [...layanan, dataBaru];
    }

    // SIMPAN LANGSUNG KE LOCALSTORAGE
    localStorage.setItem("layanan", JSON.stringify(dataUpdate));

    // UPDATE STATE
    setLayanan(dataUpdate);

    setNama("");
    setHarga("");
  };

  const hapusLayanan = (index) => {
    const dataBaru = layanan.filter((_, i) => i !== index);

    localStorage.setItem("layanan", JSON.stringify(dataBaru));
    setLayanan(dataBaru);
  };

  const editLayanan = (index) => {
    const item = layanan[index];
    setNama(item.nama);
    setHarga(item.harga);
    setEditIndex(index);
  };     

  return (
    <div
      style={{
        backgroundColor: "#2ecc71",
        minHeight: "100vh",
        padding: "20px",
        color: "black",
      }}
    >
      <h1 style={{ color: "white" }}>Tambah Layanan</h1>

      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Nama Layanan"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          style={{ padding: "10px", marginRight: "10px" }}
        />

        <input
          type="number"
          placeholder="Harga"
          value={harga}
          onChange={(e) => setHarga(e.target.value)}
          style={{ padding: "10px", marginRight: "10px" }}
        />

        <button
          onClick={tambahLayanan}
          style={{
            padding: "10px",
            backgroundColor: "green",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Tambah Layanan
        </button>
      </div>

      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <h3>Daftar Layanan:</h3>

        {layanan.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <span>
              {item.nama} - Rp {item.harga}
            </span>
        
            <div>
              <button
                onClick={() => editLayanan(index)}
                style={{ marginRight: "10px" }}
              >
                Edit
              </button>
        
              <button
                onClick={() => hapusLayanan(index)}
                style={{ backgroundColor: "red", color: "white" }}
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
