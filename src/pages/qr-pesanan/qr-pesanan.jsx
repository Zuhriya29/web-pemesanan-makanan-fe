import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../lib/axios";
import './qr-pesanan.css';

function QrPesanan() {
  const [isLoading, setIsLoading] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const QR_EXPIRE_TIME = 15 * 60; // 15 menit (detik)

  const [timeLeft, setTimeLeft] = useState(null);

  const handleCetak = async (force = false) => {
    setIsLoading(true);
    try {

      const response = await api.post(
        `/api/cetak-qr/${id}${force ? "?force=1" : ""}`
      );

      setQrImageUrl(response.data.qr_path);

      if (response.data.expired_at) {
        const expired = new Date(response.data.expired_at).getTime();
        const now = Date.now();
        const diff = Math.floor((expired - now) / 1000);
        setTimeLeft(diff > 0 ? diff : 0);
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "QR Code berhasil dibuat.",
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-confirm-button",
        },
      })
    } catch (error) {

      if (error.response?.status === 400 &&
        error.response?.data?.qr_path) {

        setQrImageUrl(error.response.data.qr_path);

        const expired = new Date(error.response.data.expired_at).getTime();
        const now = Date.now();
        const diff = Math.floor((expired - now) / 1000);
        setTimeLeft(diff > 0 ? diff : 0);

        Swal.fire({
          icon: "info",
          title: "QR Masih Aktif",
          text: "Menggunakan QR sebelumnya",
          timer: 1500,
          showConfirmButton: false
        });

      } else {
        const message = error.response?.data?.message || "Terjadi kesalahan server";

        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: message,
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: "custom-swal",
            title: "custom-title",
            htmlContainer: "custom-text",
            confirmButton: "custom-confirm-button",
          },
        });
      }

    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const menit = Math.floor(seconds / 60);
    const detik = seconds % 60;

    if (menit > 0) {
      return `${menit} Menit ${detik} Detik`;
    }

    return `${detik} Detik`;
  };

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const cekStatusPesanan = async () => {
      try {
        const res = await api.get(`/api/show-qr/${id}`);

        if (!isMounted) return;

        const status = res.data?.status_pesanan;

        if (["qr-expired", "di-tolak"].includes(status)) {
          await Swal.fire({
            icon: "info",
            title: "QR Code tidak dapat diakses",
            text: "QR Code sudah digunakan atau dibatalkan",
            showConfirmButton: true,
            confirmButton: "Kembali",
            customClass: {
              popup: "custom-swal",
              title: "custom-title",
              htmlContainer: "custom-text",
              confirmButton: "custom-confirm-button",
            },
          });

          navigate("/status-pemesanan", { replace: true, state: { reload: true } });
        }

      } catch(error) {
        const message = error.response?.data?.message || "Terjadi kesalahan server";

        await Swal.fire({
            icon: "warning",
            title: "QR Code tidak dapat diakses",
            text: message,
            showConfirmButton: true,
            confirmButton: "Kembali",
            customClass: {
              popup: "custom-swal",
              title: "custom-title",
              htmlContainer: "custom-text",
              confirmButton: "custom-confirm-button",
            },
          });

        navigate("/menu", { replace: true });
      }
    };

    cekStatusPesanan();

    return () => {
      isMounted = false;
    };

  }, [id, navigate]);

  const handleBack = () => {
    navigate("/status-pemesanan"); // kembali ke halaman sebelumnya
  };

  return (
    <div>
      <div onClick={handleBack} className="kembali">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-arrow-left-circle" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
        </svg>
        <p>Status Pemesanan</p>
      </div>
      {!qrImageUrl ? (
        <div className='utama-qr-pesanan'>
          <p>QR-Code ini hanya aktif selama 15 menit. Pastikan Anda sudah di restoran sebelum melakukan cetak</p>
          <div className="button-qr-pesanan">
            <button
              onClick={() => handleCetak()}
              disabled={isLoading}
              className={isLoading ? "btn-loading-qr-pesanan" : "button-cetak-qr"}
            >
              {isLoading ? (
                <span className="loading-dots-qr-pesanan">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              ) : (
                "Cetak QR Order Code"
              )}
            </button>
            <button
              onClick={() => navigate("/status-pemesanan")}
              className="button-kembali-qr"
            >
              Kembali
            </button>
          </div>
        </div>
      ) : (
        <div className="hasil-qr-pesanan">

          {qrImageUrl && timeLeft > 0 && (
            <>
              <h1>QR Order Code</h1>

              <img
                src={qrImageUrl}
                alt="QR Order"
                style={{ width: "200px", marginBottom: "10px" }}
                loading="lazy"
              />

              <p className="text-hasil-qr">
                Silakan tunjukkan QR Code ini kepada staff saat mengambil pesanan
              </p>

              <div className="qr-timer">
                <p className="utama-qr-time">Berakhir dalam :</p>
                <p className="second-qr-time"><b>{formatTime(timeLeft)}</b></p>
              </div>

            </>
          )}

          {/* BUTTON MUNCUL SETELAH HABIS */}
          {timeLeft === 0 && (
            <>
              <div className="informasi-expired">
                <p>Oops! Sesi kamu sudah habis nih. Yuk, cetak ulang QR Order Code</p>
              </div>

              <div className="button-qr-pesanan">
                <button
                  onClick={() => handleCetak(true)}
                  className="button-cetak-qr"
                >
                  {isLoading ? (
                    <span className="loading-dots-qr-pesanan">
                      <span>.</span><span>.</span><span>.</span>
                    </span>
                  ) : (
                    "Buat Ulang"
                  )}
                </button>
              </div>

            </>
          )}
        </div>
      )}
    </div>
  );
}

export default QrPesanan;