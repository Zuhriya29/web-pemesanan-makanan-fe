import React, { useState, useEffect } from "react";
import './detail-riwayat-pesanan.css'
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/axios";
import PageLoading from "../PageLoading/pageloading";

function DetailRiwayatPesanan() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [DataItemRiwayat, setDataItemRiwayat] = useState([]);

    useEffect(() => {
        const TampilkanDetailRiwayat = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(
                    `/api/detail-riwayat-pesanan/${id}`
                );

                setDataItemRiwayat(response.data.data);

            } catch (error) {
                console.error(error);

                Swal.fire({
                    icon: "error",
                    title: "Gagal mengambil detail riwayat pesanan",
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

        TampilkanDetailRiwayat();
    }, [id]);

    const handleBack = () => {
        navigate("/riwayat-pemesanan"); // kembali ke halaman sebelumnya
    };

    if (isLoading) {
        return <PageLoading />;
    }

    return (
        <div>
            <div onClick={handleBack} className="kembali">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-arrow-left-circle" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
                </svg>
                <p>Riwayat Pemesanan</p>
            </div>
            <div className='utama-detail-riwayat-pesanan'>
                <h1 className='judul-utama'>Detail Pesanan</h1>
                <div className='utama-elemen-detail-riwayat-pesanan'>
                    {DataItemRiwayat?.items?.map((item, index) => (
                        <div
                            key={item.menu_id}
                            className='elemen-detail-riwayat-pesanan'
                            style={{
                                borderBottom: index === DataItemRiwayat.length - 1 ? "none" : "1px solid black"
                            }}
                        >
                            <div className='kiri-elemen-detail-riwayat-pesanan'>
                                <img src={
                                    item.gambar ||
                                    "/assets/images/default.jpg"
                                }
                                    alt={item.nama_menu} 
                                    loading="lazy"/>
                                <div className='text-detail-riwayat-pesanan-1'>
                                    <h1>{item.nama_menu}</h1>
                                    <p>{item.jumlah} Qty</p>
                                </div>
                            </div>
                            <h1 className='total-detail-riwayat-pesanan'>
                                Rp{" "}
                                {Number(
                                    item.subtotal
                                ).toLocaleString("id-ID")}
                            </h1>
                        </div>
                    ))}

                </div>

                <h1 className='judul-detail-riwayat-pesanan'>Total</h1>
                <div className='utama-elemen-detail-riwayat-pesanan'>
                    <h1 style={{ color: "var(--hover-color)" }}>Rp{" "}
                        {Number(
                            DataItemRiwayat?.total_harga || 0
                        ).toLocaleString("id-ID")}</h1>
                </div>

                <p className='tanggal-detail-riwayat-pesanan'>Selesai pada{" "}
                    {new Date(
                        DataItemRiwayat?.updated_at
                    ).toLocaleDateString(
                        "id-ID",
                        {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        }
                    )}</p>
            </div>
        </div>
    )
}

export default DetailRiwayatPesanan
