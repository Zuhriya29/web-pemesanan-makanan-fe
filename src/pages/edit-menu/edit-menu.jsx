import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import './edit-menu.css'
import HeaderAdmin from "../templates/header-admin";
import FooterAdmin from "../templates/footer-admin";
import api from "../../lib/axios";
import PageLoading from "../PageLoading/pageloading";

function EditMenu() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [loadingPage, setLoadingPage] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    const [imageName, setImageName] = useState("");

    const [formData, setFormData] = useState({
        image: null,
        nama: "",
        harga: "",
        status: "",
        kategori: "",
    });

    const fetchDataMenu = useCallback(async () => {
        try {
            setLoadingPage(true);
            const res = await api.get(
                `/api/detail-menu/${id}`
            );

            const menu = res.data.menu; // ⬅️ SESUAI RESPONSE

            setFormData({
                image: null,
                imagePreview: `/storage/${menu.gambar}`,
                nama: menu.nama_menu,        // ⬅️ mapping BENAR
                harga: menu.harga,
                kategori: menu.kategori,
                status: menu.status,
            });

            setImageName(menu.gambar);
        } catch {
            Swal.fire({
                icon: "error",
                title: "Data menu tidak bisa ditampilkan",
                confirmButtonText: "OK",
                customClass: {
                    popup: "custom-swal",
                    title: "custom-title",
                    htmlContainer: "custom-text",
                    confirmButton: "custom-confirm-button"
                },
            });
        } finally {
            setLoadingPage(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchDataMenu();
        }
    }, [id, fetchDataMenu]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData(prev => ({ ...prev, image: files[0] }));
            setImageName(files[0].name);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const [menu, setMenu] = useState(false);

    const pilihMenu = (value) => {
        setFormData(prev => ({ ...prev, kategori: value }));
        setMenu(false);
    };

    const labelTampilMenu = {
        makanan: "Makanan",
        minuman: "Minuman",
    };

    const [status, setStatus] = useState(false);

    const pilihStatus = (value) => {
        setFormData(prev => ({ ...prev, status: value }));
        setStatus(false);
    };

    const labelTampilStatus = {
        available: "Tersedia",
        unvailable: "Tidak Tersedia",
    };

    const handleBack = () => {
        navigate("/kelola-menu"); // kembali-admin-admin ke halaman sebelumnya
    };

    const handleEditMenu = async (e) => {
        e.preventDefault();
        setLoadingSubmit(true);

        try {
            const data = new FormData();
            data.append("_method", "PUT"); // 🔑 PENTING
            data.append("nama_menu", formData.nama);
            data.append("harga", formData.harga);
            data.append("status", formData.status);
            data.append("kategori", formData.kategori);

            if (formData.image) {
                data.append("gambar", formData.image);
            }

            await api.post(
                `/api/edit-menu/${id}`,
                data,
    {
        headers: {
            "Content-Type": undefined, // ✅ biarkan browser set otomatis dengan boundary
        },
    }
            );

            Swal.fire({
                icon: "success",
                title: `Ubah Menu ${formData.nama} Berhasil!`,
                confirmButtonText: "OK",
                customClass: {
                    popup: "custom-swal",
                    title: "custom-title",
                    htmlContainer: "custom-text",
                    confirmButton: "custom-confirm-button"
                },
            });

            navigate("/kelola-menu")
        } catch (error) {
            const errors = error.response?.data?.errors;

            if (errors) {
                const firstError = Object.values(errors)[0][0];

                Swal.fire({
                    icon: "error",
                    title: "Edit Menu Gagal",
                    text: firstError,
                    confirmButtonText: "Kembali",
                    customClass: {
                        popup: "custom-swal",
                        title: "custom-title",
                        htmlContainer: "custom-text",
                        confirmButton: "custom-confirm-button",
                    },
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Edit Menu Gagal",
                    text: "Terjadi Kesalahan Server",
                    confirmButtonText: "Kembali",
                    customClass: {
                        popup: "custom-swal",
                        title: "custom-title",
                        htmlContainer: "custom-text",
                        confirmButton: "custom-confirm-button",
                    },
                })
            }

        } finally {
            setLoadingSubmit(false); // 🔑 WAJIB
        }
    };

    if (loadingPage) {
        return <PageLoading />;
    }

    return (
        <div>
            <HeaderAdmin />
            <div onClick={handleBack} className="kembali-admin">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-arrow-left-circle" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
                </svg>
                <p>Kelola Menu</p>
            </div>
            <header className='judul-beranda-admin'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
                </svg>
                <h1>Edit Menu</h1>
            </header>
            <form onSubmit={handleEditMenu} className="form-qr-form form-versi-2">
                <div className="utama-input-qr-form">
                    <div className="input-qr-form">
                        <label>Gambar Menu :</label>
                        <label className="custom-file-container" htmlFor="image">
                            <div className="input-file">
                                <div className="custom-file-label">Pilih File</div>
                                <span className="file-name">
                                    {imageName || "Unggah File (Maks. 1MB, JPG/PNG)"}
                                </span>
                            </div>

                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                className="custom-file-input"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    const MAX_FILE_SIZE = 1 * 1024 * 1024;
                                    const isImage = file.type.startsWith("image/");
                                    const isSizeValid = file.size <= MAX_FILE_SIZE;

                                    if (!isImage || !isSizeValid) {
                                        Swal.fire({
                                            icon: "warning",
                                            title: !isImage ? "Tipe File Salah!" : "Ukuran File Terlalu Besar!",
                                            text: !isImage
                                                ? "Hanya file gambar (JPEG, PNG, dll.) yang diizinkan."
                                                : "Ukuran file tidak boleh melebihi 1MB.",
                                            confirmButtonText: "Tutup",
                                            customClass: {
                                                popup: "custom-swal",
                                                title: "custom-title",
                                                htmlContainer: "custom-text",
                                                confirmButton: "custom-confirm-button",
                                            },
                                        });

                                        e.target.value = null;
                                        setFormData(prev => ({ ...prev, image: null }));
                                        setImageName("");
                                        return;
                                    }

                                    setFormData(prev => ({ ...prev, image: file }));
                                    setImageName(file.name);
                                }}
                            />

                        </label>
                    </div>
                    <div className="input-qr-form">
                        <label>Nama :</label>
                        <input
                            type="text"
                            name="nama"
                            placeholder='Masukkan Nama Menu'
                            value={formData.nama}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="utama-input-qr-form">
                    <div className="input-qr-form">
                        <label>Harga :</label>
                        <input
                            type="number"
                            min="0"
                            name="harga"
                            placeholder='Masukkan Harga Menu'
                            value={formData.harga}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-qr-form">
                        <label>Kategori :</label>
                        <div className="custom-dropdown">
                            <div className="dropdown-display" onClick={() => setMenu(!menu)}>
                                <span>
                                    {formData.kategori
                                        ? labelTampilMenu[formData.kategori]
                                        : "Pilih Kategori Menu"}
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                                </svg>
                            </div>

                            {menu && (
                                <div className="dropdown-list">
                                    <div className="dropdown-item" onClick={() => pilihMenu("makanan")}>
                                        <span>Makanan</span>
                                    </div>

                                    <div className="dropdown-item" onClick={() => pilihMenu("minuman")}>
                                        <span>Minuman</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="utama-input-qr-form form-single">
                    <div className="input-qr-form">
                        <label>Status :</label>
                        <div className="custom-dropdown">
                            <div className="dropdown-display" onClick={() => setStatus(!status)}>
                                <span>
                                    {formData.status
                                        ? labelTampilStatus[formData.status]
                                        : "Pilih Status Menu"}
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                                </svg>
                            </div>

                            {status && (
                                <div className="dropdown-list">
                                    <div className="dropdown-item" onClick={() => pilihStatus("available")}>
                                        <span>Tersedia</span>
                                    </div>

                                    <div className="dropdown-item" onClick={() => pilihStatus("unvailable")}>
                                        <span>Tidak Tersedia</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className='button-register button-utama-2'>
                    <button
                        type="submit"
                        disabled={loadingSubmit}
                        className={loadingSubmit ? "btn-loading" : ""}
                    >
                        {loadingSubmit ? (
                            <span className="loading-dots">
                                Mengubah<span> . </span><span>. </span><span>. </span>
                            </span>
                        ) : (
                            "Ubah"
                        )}
                    </button>
                </div>
            </form>

            <FooterAdmin />
        </div>
    )
}

export default EditMenu
