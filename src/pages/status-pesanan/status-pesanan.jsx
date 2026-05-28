import React, { useEffect, useState } from 'react'
import './status-pesanan.css'
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../lib/axios";
import Swal from 'sweetalert2';
import PageLoading from "../PageLoading/pageloading";

function StatusPesanan() {

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [dataStatus, setDataStatus] = useState([]);

    const TampilkanStatusPesanan = async (showLoading = false) => {

        if (showLoading) setIsLoading(true);

        try {

            const response = await api.get(`/api/pesanan-saya`);

            setDataStatus(response.data.data);

        } catch (error) {

            Swal.fire({
                icon: "error",
                title: "Status Pesanan Tidak Valid",
                text: error.response?.data?.message,
                confirmButtonText: "Kembali",
                customClass: {
                    popup: "custom-swal",
                    title: "custom-title",
                    htmlContainer: "custom-text",
                    confirmButton: "custom-confirm-button",
                },
            })

        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            TampilkanStatusPesanan(false);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const truncateOrderText = (text, maxLength = 60) => {
        const items = text.split(", "); // pecah berdasarkan item
        let result = [];

        for (let item of items) {
            const currentText = result.join(", ");
            if ((currentText + (currentText ? ", " : "") + item).length > maxLength) {
                break;
            }
            result.push(item);
        }

        return result.join(", ") + (result.length < items.length ? " ..." : "");
    };

    const statusConfig = {
        pending: {
            label: "Pesanan Diterima",
        },
        "di-proses": {
            label: "Pesanan Diproses",
            color: "var(--primary-color)"
        },
        selesai: {
            label: "Pesanan Selesai",
            color: "var(--third-color)"
        },
        "qr-expired": {
            label: "Pesanan Diambil",
        },
        "di-tolak": {
            label: "Pesanan Ditolak",
            color: "var(--second-color)"
        }
    };

    const handleBack = () => {
        navigate("/menu", { replace: true, state: { reload: true } });
    };

    const handleHasilQR = (id) => {
        navigate(`/qr-pesanan/${id}`); // kembali ke halaman sebelumnya
    };

    useEffect(() => {
        TampilkanStatusPesanan(true);
    }, []);

    const location = useLocation();

    useEffect(() => {
        if (location.state?.reload) {
            TampilkanStatusPesanan();
        }
    }, [location.state]);

    if (isLoading) {
        return <PageLoading />;
    }

    return (
        <div>
            <div onClick={handleBack} className="kembali">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-arrow-left-circle" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
                </svg>
                <p>Menu</p>
            </div>
            <div className='utama-status-pesanan'>
                <h1 className='judul-utama'>Status Pesanan</h1>
                {dataStatus.map((pesanan) => {

                    const status = statusConfig[pesanan.status_pesanan] || {
                        label: pesanan.status_pesanan,
                        color: "#000"
                    };

                    const firstMenu = pesanan.items?.[0]?.menu;
                    const imageUrl = firstMenu?.gambar
                        ? firstMenu.gambar
                        : "/assets/images/default.jpg";

                        console.log(firstMenu?.gambar);

                    const orderText = pesanan.items
                        ?.map(item => `${item.menu.nama_menu} ${item.jumlah}pcs`)
                        .join(", ");

                    const isBlocked =
                        pesanan.status_pesanan === "di-tolak" ||
                        pesanan.status_pesanan === "qr-expired";

                    return (
                        <div key={pesanan.id}
                            onClick={() => {
                                if (!isBlocked) handleHasilQR(pesanan.id);
                            }}
                            style={{
                                cursor: isBlocked ? "not-allowed" : "pointer",
                                opacity: isBlocked ? 0.6 : 1
                            }} className='elemen-status-pesanan'>
                            <img src={imageUrl} alt={firstMenu?.nama_menu || "Menu"} loading="lazy"/>
                            <div className='text-status-pesanan'>
                                <h1 style={{ color: status.color }}>
                                    {status.label}
                                </h1>
                                <p>{truncateOrderText(orderText)}</p>

                                {!isBlocked && (
                                    <div className="detail-status-pesanan">
                                        <p>Lihat QR Order Code</p>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default StatusPesanan
