import React, { useEffect, useState } from 'react'
import './riwayat-pemesanan.css'
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../lib/axios";
import Swal from 'sweetalert2';
import PageLoading from "../PageLoading/pageloading";

function RiwayatPemesanan() {

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [dataStatus, setDataStatus] = useState([]);

  const TampilkanRiwayatPesanan = async (showLoading = false) => {

    if (showLoading) setIsLoading(true);

    try {

      const response = await api.get(`/api/pesanan-saya-riwayat`);

      setDataStatus(response.data.data);

    } catch (error) {

      if (showLoading) {
        Swal.fire({
          icon: "error",
          title: "Riwayat Pesanan Tidak Valid",
          text: error.response?.data?.message,
          confirmButtonText: "Kembali",
          customClass: {
            popup: "custom-swal",
            title: "custom-title",
            htmlContainer: "custom-text",
            confirmButton: "custom-confirm-button",
          },
        });
      }

    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load pertama
    TampilkanRiwayatPesanan(true);

    // Auto refresh tiap 5 detik
    const interval = setInterval(() => {
        TampilkanRiwayatPesanan(false);
    }, 5000);

    return () => clearInterval(interval);
}, []);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.reload) {
      TampilkanRiwayatPesanan();
    }
  }, [location.state]);

  const statusConfig = {
    "qr-expired": {
      label: "Pesanan Sudah Diambil",
      color: "var(--third-color)"
    },
  };

  if (isLoading) {
    return <PageLoading />;
  }

  const handleBack = () => {
    navigate("/menu"); // kembali ke halaman sebelumnya
  };

 const Selengkapnya = (pesananId) => {
  navigate(`/detail-riwayat-pesanan/${pesananId}`);
};

  return (
    <div>
      <div onClick={handleBack} className="kembali">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-arrow-left-circle" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
        </svg>
        <p>Menu</p>
      </div>
      <div className='utama-riwayat-pemesanan'>
        <h1 className='judul-utama'>Riwayat Pemesanan</h1>
        {dataStatus.map((pesanan) => {

          const status = statusConfig[pesanan.status_pesanan] || {
            label: pesanan.status_pesanan,
            color: "#000"
          };

          const imageUrl = pesanan.menu_pertama?.gambar
            ? pesanan.menu_pertama.gambar
            : "/assets/images/default.jpg";

          console.log(pesanan.menu_pertama?.gambar);

          return (
            <div key={pesanan.pesanan_id} onClick={() => Selengkapnya(pesanan.pesanan_id)} className='elemen-riwayat-pemesanan'>
              <div className='kiri-elemen-riwayat-pemesanan'>
                <img src={imageUrl} alt={pesanan.menu_pertama?.nama_menu || "Menu"} loading="lazy"/>
                <div className='text-status-pesanan'>
                  <h1 style={{ color: status.color }}>
                    {status.label}
                  </h1>
                  <p>
                    {new Date(pesanan.updated_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}
                  </p>
                </div>
              </div>
              <div className='text-riwayat-pemesanan-2'>
                <h1>Rp {Number(pesanan.total_harga).toLocaleString("id-ID")}</h1>
                <p>Total : {pesanan.total_jumlah} pcs</p>
                <div className='selengkapnya'>
                  <p>Selengkapnya</p>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-arrow-right-short" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default RiwayatPemesanan
