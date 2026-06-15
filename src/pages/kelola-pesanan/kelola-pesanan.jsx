import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './kelola-pesanan.css'
import HeaderAdmin from "../templates/header-admin";
import FooterAdmin from '../templates/footer-admin';
import Swal from "sweetalert2";
import { Table } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../lib/axios";
import PageLoading from "../PageLoading/pageloading";

function KelolaPesanan() {

  const [OpenDropdown, setOpenDropdown] = useState(false);
  const [dataPesanan, setDataPesanan] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [previewImg, setPreviewImg] = useState(null);
  const [filterMode, setFilterMode] = useState("hari");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/show-pesanan"); // route showPesanan
        setDataPesanan(res.data);
      } catch (err) {
        console.error("Gagal ambil data pesanan", err);

        Swal.fire({
          icon: "error",
          title: "Gagal mengambil data pesanan",
          confirmButtonText: "Kembali",
          customClass: {
            popup: "custom-swal",
            title: "custom-title",
            htmlContainer: "custom-text",
            confirmButton: "custom-confirm-button",
          },

        })
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const tanggalList = [
    ...new Set(
      dataPesanan.map(p => p.updated_at.split("T")[0])
    )
  ];

  const bulanList = [
    ...new Set(
      dataPesanan.map(p => p.updated_at.slice(0, 7)) // YYYY-MM
    )
  ];

  const formatTanggal = (dateStr) => {
    const d = new Date(dateStr);
    const hari = d.getDate().toString().padStart(2, "0");
    const bulan = d.toLocaleString("id-ID", { month: "long" });
    const tahun = d.getFullYear();
    return `${hari} ${bulan} ${tahun}`;
  };

  const formatBulan = (dateStr) => {
    const d = new Date(dateStr);
    const bulan = d.toLocaleString("id-ID", { month: "long" });
    const tahun = d.getFullYear();
    return `${bulan} ${tahun}`;
  };

  const filteredData = dataPesanan.filter(item => {
    const tanggalItem = item.updated_at?.split("T")[0];
    const bulanItem = item.updated_at.slice(0, 7);

    let cocokTanggal = true;

    if (selectedDate) {
      if (filterMode === "hari") {
        cocokTanggal = tanggalItem === selectedDate;
      } else {
        cocokTanggal = bulanItem === selectedDate;
      }
    }

    const cocokNama = item.nama_pemesan
      ?.toLowerCase()
      .includes(searchName.toLowerCase());

    return cocokTanggal && cocokNama;
  });

  const totalHarga = filteredData.reduce(
    (sum, item) => sum + (item.total_harga || 0),
    0
  );

  const formatPesanan = (items) => {
    if (!items) return "";

    return items
      .map(i =>
        `${i.menu?.nama_menu} (${i.jumlah}x)`
      )
      .join(", ");
  };


  // export pdf

  const exportToPDF = () => {
    const doc = new jsPDF();

    const judulFilter = selectedDate
      ? (filterMode === "hari"
        ? `Tanggal: ${formatTanggal(selectedDate)}`
        : `Bulan: ${formatBulan(selectedDate)}`)
      : "Semua Data";

    doc.setFontSize(14);
    doc.text("Laporan Pesanan", 14, 15);
    doc.setFontSize(11);
    doc.text(judulFilter, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [["No", "Nama", "Nomor HP", "Jenis", "Status", "Rincian", "Total"]],
      body: filteredData.map((item, index) => [
        index + 1,
        item.nama_pemesan,
        item.user?.nohp,
        item.jenis_pemesanan,
        item.status_pesanan,
        formatPesanan(item.items),
        `Rp ${(item.total_harga || 0).toLocaleString("id-ID")}`
      ]),
    });

    doc.text(
      `TOTAL PENDAPATAN: Rp ${totalHarga.toLocaleString("id-ID")}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    const namaFile = selectedDate
      ? (filterMode === "hari"
        ? `Laporan_Harian_${selectedDate}.pdf`
        : `Laporan_Bulanan_${selectedDate}.pdf`)
      : "Laporan_Semua_Data.pdf";

    doc.save(namaFile);
  };

  const handleAksi = async (id, type, nama) => {

    if (!id) {
      Swal.fire("Error", "Data pesanan belum ada", "error");
      return;
    }

    const statusMap = {
      pending: "Pesanan Masuk",
      "di-proses": "Di Proses",
      selesai: "Pesanan Selesai",
      "di-tolak": "Di Tolak",
      "qr-expired": "QR Digunakan"
    };

    Swal.fire({
      icon: type === "di-tolak" ? "warning" : "question",
      title: `Ubah status menjadi ${statusMap[type]}?`,
      text: `Pesanan: ${nama}`,
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),

      preConfirm: async () => {

        try {

          await api.put(`/api/update-status/${id}`, {
            status_pesanan: type
          });

          setDataPesanan(prev =>
            prev.map(p =>
              p.id === id
                ? { ...p, status_pesanan: type }
                : p
            )
          );

          return true;

        } catch (error) {

          Swal.fire({
            icon: "error",
            title: "Gagal update",
            text: error.response?.data?.message || "Server error",
            confirmButtonText: "Kembali",
            customClass: {
              popup: "custom-swal",
              title: "custom-title",
              htmlContainer: "custom-text",
              confirmButton: "custom-confirm-button",
            },
          });

          return false;

        }
      },

      customClass: {
        popup: "custom-swal",
        title: "custom-title",
        htmlContainer: "custom-text",
        confirmButton: "custom-confirm-button",
        cancelButton: "custom-cancel-button"
      },

    }).then((result) => {

      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: `Status diubah menjadi ${statusMap[type]}`,
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: "custom-swal",
            title: "custom-title",
            htmlContainer: "custom-text",
            confirmButton: "custom-confirm-button",
            denyButton: "custom-cancel-button"
          },
        });
      }

    });

  };

  const handleQrExpired = (item) => {
    handleAksi(item.id, "qr-expired", item.nama_pemesan);
  };

  const [uangBayar, setUangBayar] = useState(0);
  const [pesananCetak, setPesananCetak] = useState(null);

  const handleCetakInvoice = async () => {

    setPesananCetak(pesanan);
    setUangBayar(pesanan.total_harga);

    setTimeout(() => {
      window.print();
    }, 300);
  };

  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/beranda-admin"); // kembali-admin ke halaman sebelumnya
  };

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div>
      <HeaderAdmin />
      <div onClick={handleBack} className="kembali-admin">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-arrow-left-circle" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
        </svg>
        <p>Beranda</p>
      </div>
      <header className='judul-beranda-admin'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-basket" viewBox="0 0 16 16">
          <path d="M5.757 1.071a.5.5 0 0 1 .172.686L3.383 6h9.234L10.07 1.757a.5.5 0 1 1 .858-.514L13.783 6H15a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1v4.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 13.5V9a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1.217L5.07 1.243a.5.5 0 0 1 .686-.172zM2 9v4.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V9zM1 7v1h14V7zm3 3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 4 10m2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 6 10m2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 8 10m2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5m2 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5" />
        </svg>
        <h1>Kelola Pesanan</h1>
      </header>

      {/* filter */}

      <div className="utama-filter">
        {/* Tanggal */}
        <div className="elemen-filter">
          <p>Filter : </p>
          <div className="custom-dropdown-2">

            {/* ==== Display Pilihan ==== */}
            <div className="filter-mode">

              {/* FILTER HARI */}
              <div
                className="dropdown-display"
                onClick={() => {
                  setFilterMode("hari");
                  setOpenDropdown(!OpenDropdown);
                }}
              >
                <span>
                  {selectedDate && filterMode === "hari"
                    ? formatTanggal(selectedDate)
                    : "Per Hari"}
                </span>

                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                  <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                </svg>
              </div>

              {/* FILTER BULAN */}
              <div
                className="dropdown-display"
                onClick={() => {
                  setFilterMode("bulan");
                  setOpenDropdown(!OpenDropdown);
                }}
              >
                <span>
                  {selectedDate && filterMode === "bulan"
                    ? formatBulan(selectedDate)
                    : "Per Bulan"}
                </span>

                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                  <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                </svg>
              </div>

            </div>

            {/* ==== Dropdown List ==== */}
            {OpenDropdown && (
              <div className="dropdown-list">

                <div
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedDate(null);
                    setOpenDropdown(false);
                  }}
                >
                  <span>Semua</span>
                </div>

                {(filterMode === "hari" ? tanggalList : bulanList).map((tgl) => (
                  <div
                    key={tgl}
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedDate(tgl); // simpan YYYY-MM-DD
                      setOpenDropdown(false);
                    }}
                  >
                    <span>
                      {filterMode === "hari"
                        ? formatTanggal(tgl)
                        : formatBulan(tgl)}
                    </span>
                  </div>
                ))}


              </div>
            )}
          </div>
        </div>

        {/* Nama */}
        <div className="elemen-filter search-filter">
          <p>Cari Nama : </p>
          <input
            type="text"
            placeholder="Cari nama pemesan..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>

        {/* Export PDF */}
        <button
          onClick={exportToPDF}
          className="custom-confirm-button button-filter"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-printer-fill" viewBox="0 0 16 16">
            <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1" />
            <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" />
          </svg>
          Unduh PDF
        </button>
      </div>

      <div className="utama-data-tabel">
        <Table responsive='lg' striped hover>
          <thead style={{ background: "#f0f0f0" }}>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Nama</th>
              <th>Nomor HP</th>
              <th>Catatan</th>
              <th>Jenis Pemesanan</th>
              <th>Rincian</th>
              <th>Total Harga</th>
              <th>Bukti Pembayaran</th>
              <th>Status Pesanan</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>{formatTanggal(item.updated_at)}</td>
                <td>{item.nama_pemesan}</td>
                <td>{item.nohp}</td>
                <td>{item.catatan ?? ""}</td>

                <td>
                  {item.jenis_pemesanan === "take-away"
                    ? "Dibawa Pulang"
                    : item.jenis_pemesanan === "dine-in"
                      ? "Makan Ditempat"
                      : item.jenis_pemesanan}
                </td>
                <td className="item-produk-qc">
                  {item.items?.map((prod, i) => (
                    <div key={i} className="produk-row-qc">
                      <p className="nama-produk-qc">
                        {prod.menu?.nama_menu}
                      </p>

                      <p className="jumlah-produk-qc">
                        {prod.jumlah}x
                      </p>

                      <p className="harga-produk-qc">
                        Rp {prod.harga_satuan.toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </td>
                <td className="total-harga-qc">Rp {item.total_harga.toLocaleString("id-ID")}</td>
                <td>
                  {item.bukti_pembayaran && (
                    <img
                      src={item.bukti_pembayaran}
                      alt={item.nama_pemesan}
                      className="img-tabel"
                      style={{ cursor: "pointer" }}
                      onClick={() => setPreviewImg(item.bukti_pembayaran)}
                      loading="lazy"
                    />
                  )}
                </td>
                <td>{item.status_pesanan === "pending"
                  ? "Pesanan Masuk"
                  : item.status_pesanan === "di-proses"
                    ? "Di Proses"
                    : item.status_pesanan === "selesai"
                      ? "Pesanan Selesai"
                      : item.status_pesanan === "di-tolak"
                        ? "Di Tolak"
                        : item.status_pesanan === "qr-expired"
                          ? "QR Digunakan"
                          : item.status_pesanan}</td>
                <td>
                  <div className="utama-button-handle">
                    {/* DIPROSES — hanya saat pending */}
                    {item.status_pesanan === "pending" && (
                      <>
                        <button
                          onClick={() => handleAksi(item.id, "di-proses", item.nama_pemesan)}
                          className="handle-warning"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-clock-fill" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" /> </svg>
                          Diproses
                        </button>

                        <button
                          onClick={() => handleAksi(item.id, "di-tolak", item.nama_pemesan)}
                          className="handle-danger"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-x-circle-fill" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" /> </svg>
                          Ditolak
                        </button>
                      </>
                    )}

                    {item.status_pesanan === "di-proses" && (
                      <button
                        onClick={() => handleAksi(item.id, "selesai", item.nama_pemesan)}
                        className="handle-succes"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" /> </svg>
                        Selesai
                      </button>
                    )}

                    {item.status_pesanan === "selesai" && (
                      <>
                        <button
                          onClick={() => handleCetakInvoice(item)}
                          className="handle-invoice"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-printer-fill" viewBox="0 0 16 16">
                            <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1" />
                            <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" />
                          </svg>
                          Cetak Invoice
                        </button>

                        <button
                          onClick={() => handleQrExpired(item)}
                          className="handle-warning"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-qr-code" viewBox="0 0 16 16">
                            <path d="M2 2h2v2H2z" />
                            <path d="M6 0v6H0V0zM5 1H1v4h4zM4 12H2v2h2z" />
                            <path d="M6 10v6H0v-6zm-5 1v4h4v-4zm11-9h2v2h-2z" />
                            <path d="M10 0v6h6V0zm5 1v4h-4V1zM8 1V0h1v2H8v2H7V1zm0 5V4h1v2zM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8zm0 0v1H2V8H1v1H0V7h3v1zm10 1h-1V7h1zm-1 0h-1v2h2v-1h-1zm-4 0h2v1h-1v1h-1zm2 3v-1h-1v1h-1v1H9v1h3v-2zm0 0h3v1h-2v1h-1zm-4-1v1h1v-2H7v1z" />
                            <path d="M7 12h1v3h4v1H7zm9 2v2h-3v-1h2v-1z" />
                          </svg>
                          QR Expired
                        </button>
                      </>
                    )}

                    {item.status_pesanan === "di-tolak" && (
                      <span className="text-muted" style={{ color: "var(--second-color)" }}>Pesanan Ditolak</span>
                    )}

                    {item.status_pesanan === "qr-expired" && (
                      <button
                        onClick={() => handleCetakInvoice(item)}
                        className="handle-invoice"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-printer-fill" viewBox="0 0 16 16">
                          <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1" />
                          <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" />
                        </svg>
                        Cetak Invoice
                      </button>
                    )}
                  </div>

                </td>
              </tr>
            ))}

            {/* ROW TOTAL */}
            <tr className="total-pesanan">
              <td colSpan="10">Total Harga</td>
              <td>Rp {totalHarga.toLocaleString("id-ID")}</td>
            </tr>
          </tbody>
        </Table>

        {previewImg && (
          <div className="preview-overlay" onClick={() => setPreviewImg(null)}>
            <img src={previewImg} className="preview-img" loading="lazy" />
          </div>
        )}

        {pesananCetak && (
          <div className="area-struk">
            <div className="struk">
              <div className="title-struk">
                <img src="./assets/images/logo-2.jpg" alt="Griya Dhahar Suroboyo" loading="lazy" />
                <h1>Griya Dhahar Suroboyo</h1>
                <p>Jl. Ahmad Dahlan No.9, Mojoroto, Kota Kediri</p>
              </div>

              <hr />

              <div className="tgl-struk">
                <div className="item-tgl-struk">
                  <p>Tanggal</p>
                  <p>Waktu</p>
                </div>
                <div className="titik-item-tgl-struk">
                  <p>:</p>
                  <p>:</p>
                </div>
                <div className="item-tgl-struk">
                  <p>{new Date().toLocaleDateString("id-ID")}</p>
                  <p>{new Date().toLocaleTimeString("id-ID")}</p>
                </div>
              </div>

              <hr />

              {pesananCetak.items?.map((item, i) => (
                <div key={i} className="row-struk">
                  <div className="item-tgl-struk">
                    <p>{item.menu?.nama_menu}</p>
                  </div>
                  <div className="titik-item-tgl-struk">
                    <p>{item.jumlah}x</p>
                  </div>
                  <div className="item-tgl-struk">
                    <p>
                      Rp {(item.subtotal).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}

              <hr />

              <div className="row-struk">
                <p>Total</p>
                <p>
                  Rp {pesananCetak?.total_harga?.toLocaleString("id-ID") ?? 0}
                </p>

              </div>
              <div className="row-struk">
                <p>Bayar</p>
                <p>Rp {uangBayar.toLocaleString("id-ID")}</p>
              </div>
              <div className="row-struk">
                <p>Kembali</p>
                <p>Rp {(uangBayar - pesananCetak.total_harga).toLocaleString("id-ID")}</p>
              </div>

              <hr />

              <p className="penutup-struk">Terima kasih atas kunjungan Anda. Kepuasan Anda adalah kebanggaan kami.</p>
            </div>
          </div>
        )}
      </div>
      <FooterAdmin />
    </div>
  )
}

export default KelolaPesanan
