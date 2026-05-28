import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import "./qr-scanner.css"; // Import CSS terpisah
import HeaderAdmin from "../templates/header-admin";
import Table from 'react-bootstrap/Table';
import FooterAdmin from "../templates/footer-admin";
import Swal from 'sweetalert2';
import api from "../../lib/axios";

function QRScanner() {

  const navigate = useNavigate();

  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [dataScan, setDataScan] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);

  const handleScanResult = async (decodedText) => {

    setIsLoading(true);
    try {
      // ambil token dari URL
      const token = decodedText.split("/").pop();

      if (!decodedText.includes("/scan-qr/")) {
        Swal.fire({
          icon: "error",
          title: "QR Code Salah",
          text: "QR bukan milik sistem pesanan",
          confirmButtonText: "Kembali",
          customClass: {
            popup: "custom-swal",
            title: "custom-title",
            htmlContainer: "custom-text",
            confirmButton: "custom-confirm-button",
          },
        })
        return;
      }

      const response = await api.get(`/api/scan-qr/${token}`);

      setDataScan(response.data);

      Swal.fire({
        icon: "success",
        title: "QR Code Valid",
        text: `Pesanan atas nama ${response.data.nama_pemesan} ditemukan`,
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-confirm-button",
          denyButton: "custom-cancel-button"
        },
      })

    } catch (error) {

      Swal.fire({
        icon: "error",
        title: "QR Code Tidak Valid",
        text: error.response?.data?.message || "Scan gagal",
        confirmButtonText: "Kembali",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-confirm-button",
        },
      })

    } finally {
      setIsLoading(false); // 🔑 WAJIB
    }
  };

  const startScanning = () => {
    if (isScanning) return;

    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        console.log("QR result:", decodedText);

        stopScanning();

        handleScanResult(decodedText);
      },
      () => { }
    )
      .then(() => setIsScanning(true))
      .catch(console.error);
  };

  const stopScanning = async () => {
    if (!scannerRef.current) return;

    try {
      await scannerRef.current.stop();
      await scannerRef.current.clear();
      scannerRef.current = null;
      setIsScanning(false);
    } catch (err) {
      console.error("Stop failed:", err);
    }
  };

  // Cleanup saat user meninggalkan halaman
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const handleAksi = async (type) => {
    if (!dataScan?.pesanan_id) {
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

    const newStatus = type;

    Swal.fire({
      icon: type === "di-tolak" ? "warning" : "question",
      title: `Ubah status menjadi ${statusMap[type]}?`,
      text: `Pesanan: ${dataScan.nama_pemesan}`,
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),

      preConfirm: async () => {

        try {

          await api.put(`/api/update-status/${dataScan.pesanan_id}`, {
            status_pesanan: newStatus
          });

          setDataScan(prev => ({
            ...prev,
            status_pesanan: newStatus
          }));

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

  const handleQrExpired = () => {
    handleAksi("qr-expired");
  };

  const [uangBayar, setUangBayar] = useState(0);

  const handleCetakInvoice = async () => {
    const total = dataScan.total_harga;

    setUangBayar(total);

    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleBack = () => {
    navigate("/beranda-admin"); // kembali-admin ke halaman sebelumnya
  };


  return (
    <div className="main">
      <HeaderAdmin />
      <div onClick={handleBack} className="kembali-admin">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-arrow-left-circle" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
        </svg>
        <p>Beranda</p>
      </div>
      <header className='judul-beranda-admin'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-qr-code-scan" viewBox="0 0 16 16">
          <path d="M0 .5A.5.5 0 0 1 .5 0h3a.5.5 0 0 1 0 1H1v2.5a.5.5 0 0 1-1 0zm12 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V1h-2.5a.5.5 0 0 1-.5-.5M.5 12a.5.5 0 0 1 .5.5V15h2.5a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1H15v-2.5a.5.5 0 0 1 .5-.5M4 4h1v1H4z" />
          <path d="M7 2H2v5h5zM3 3h3v3H3zm2 8H4v1h1z" />
          <path d="M7 9H2v5h5zm-4 1h3v3H3zm8-6h1v1h-1z" />
          <path d="M9 2h5v5H9zm1 1v3h3V3zM8 8v2h1v1H8v1h2v-2h1v2h1v-1h2v-1h-3V8zm2 2H9V9h1zm4 2h-1v1h-2v1h3zm-4 2v-1H8v1z" />
          <path d="M12 9h2V8h-2z" />
        </svg>
        <h1>QR Scanner</h1>
      </header>

      <div className="utama-cam-scanner">
        <div id="reader"></div>

        <div className="utama-button-scanner">
          {/* Tombol Start */}
          <button
            onClick={startScanning}
            disabled={isLoading || isScanning}
            className={`start-scanner ${isLoading ? "btn-loading-qc" : ""}`}
          >
            {isLoading ? (
              <span className="loading-dots-qc">
                <span>.</span><span>.</span><span>.</span>
              </span>
            ) : (
              "Start Scanning"
            )}
          </button>

          {/* Tombol Stop */}
          <button
            onClick={stopScanning}
            disabled={!isScanning}
            className="stop-scanner"
          >
            Stop Scanning
          </button>
        </div>

      </div>

      {dataScan && (
        <div className="utama-hasil-scan">
          <h1 className="hasil-scan">Hasil Scan</h1>

          <Table responsive="lg">
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                <th>Nama</th>
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
              <tr>
                <td>{dataScan.nama_pemesan}</td>
                <td>{dataScan.catatan ?? ""}</td>
                <td>
                  {dataScan.jenis_pemesanan === "take-away"
                    ? "Dibawa Pulang"
                    : dataScan.jenis_pemesanan === "dine-in"
                      ? "Makan Ditempat"
                      : dataScan.jenis_pemesanan}
                </td>
                <td className="item-produk-qc">
                  {dataScan.items?.map((item, i) => (
                    <div key={i} className="produk-row-qc">
                      <p className="nama-produk-qc">
                        {item.menu?.nama_menu}
                      </p>

                      <p className="jumlah-produk-qc">
                        {item.jumlah}x
                      </p>

                      <p className="harga-produk-qc">
                        Rp {item.harga_satuan.toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </td>
                <td className="total-harga-qc">Rp {dataScan.total_harga.toLocaleString("id-ID")}</td>
                <td>
                  {dataScan.bukti_pembayaran && (
                    <img
                      src={dataScan.bukti_pembayaran}
                      alt={dataScan.nama_pemesan}
                      className="img-tabel"
                      style={{ cursor: "pointer" }}
                      onClick={() => setPreviewImg(dataScan.bukti_pembayaran)}
                      loading="lazy"
                    />
                  )}
                </td>
                <td>{dataScan.status_pesanan === "pending"
                  ? "Pesanan Masuk"
                  : dataScan.status_pesanan === "di-proses"
                    ? "Di Proses"
                    : dataScan.status_pesanan === "selesai"
                      ? "Pesanan Selesai"
                      : dataScan.status_pesanan === "di-tolak"
                        ? "Di Tolak"
                        : dataScan.status_pesanan === "qr-expired"
                          ? "QR Digunakan"
                          : dataScan.status_pesanan}</td>
                <td>
                  <div className="utama-button-handle">

                    {/* DIPROSES — hanya saat pending */}
                    {dataScan?.status_pesanan === "pending" && (
                      <>
                        <button
                          onClick={() => handleAksi("di-proses")}
                          className="handle-warning"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-clock-fill" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" /> </svg>
                          Diproses
                        </button>

                        <button
                          onClick={() => handleAksi("di-tolak")}
                          className="handle-danger"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-x-circle-fill" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" /> </svg>
                          Ditolak
                        </button>
                      </>
                    )}

                    {dataScan?.status_pesanan === "di-proses" && (
                      <button
                        onClick={() => handleAksi("selesai")}
                        className="handle-succes"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" /> </svg>
                        Selesai
                      </button>
                    )}

                    {dataScan?.status_pesanan === "selesai" && (
                      <>

                        <button
                          onClick={() => handleCetakInvoice()}
                          className="handle-invoice"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-printer-fill" viewBox="0 0 16 16">
                            <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1" />
                            <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" />
                          </svg>
                          Cetak Invoice
                        </button>

                        <button
                          onClick={() => handleQrExpired()}
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

                    {dataScan?.status_pesanan === "di-tolak" && (
                      <span className="text-muted" style={{ color: "var(--second-color)" }}>Pesanan Ditolak</span>
                    )}

                    {dataScan?.status_pesanan === "qr-expired" && (
                      <button
                        onClick={() => handleCetakInvoice()}
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
            </tbody>
          </Table>

          {previewImg && (
            <div className="preview-overlay" onClick={() => setPreviewImg(null)}>
              <img src={previewImg} className="preview-img" loading="lazy"/>
            </div>
          )}
        </div>
      )}

      {dataScan && (
        <div className="area-struk">
          <div className="struk">
            <div className="title-struk">
              <img src="./assets/images/logo-2.jpg" alt="Griya Dhahar Suroboyo" loading="lazy"/>
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

            {dataScan.items?.map((item, i) => (
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
              <p>Rp {dataScan.total_harga.toLocaleString("id-ID")}</p>
            </div>
            <div className="row-struk">
              <p>Bayar</p>
              <p>Rp {uangBayar.toLocaleString("id-ID")}</p>
            </div>
            <div className="row-struk">
              <p>Kembali</p>
              <p>Rp {(uangBayar - dataScan.total_harga).toLocaleString("id-ID")}</p>
            </div>

            <hr />

            <p className="penutup-struk">Terima kasih atas kunjungan Anda. Kepuasan Anda adalah kebanggaan kami.</p>
          </div>
        </div>
      )}

      <FooterAdmin />
    </div>
  );
}

export default QRScanner;
