import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import './tambah-menu.css'
import HeaderAdmin from "../templates/header-admin";
import FooterAdmin from "../templates/footer-admin";
import api from "../../lib/axios";

function TambahMenu() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    gambar: "",
    nama_menu: "",
    harga: "",
    status: "available",
    kategori: "",
  });


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const [menu, setMenu] = useState(false);

  const pilihMenu = (value) => {
    setForm(prev => ({ ...prev, kategori: value }));
    setMenu(false);
  };

  const labelKategori = {
    makanan: "Makanan",
    minuman: "Minuman",
  };

  const [status, setStatus] = useState(false);

  const pilihStatus = (value) => {
    setForm(prev => ({ ...prev, status: value }));
    setStatus(false);
  };

  const labelStatus = {
    available: "Tersedia",
    unvailable: "Tidak Tersedia",
  };

  const handleBack = () => {
    navigate("/kelola-menu"); // kembali-admin ke halaman sebelumnya
  };

  const handleTambahMenu = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("gambar", form.gambar);
      formData.append("nama_menu", form.nama_menu);
      formData.append("harga", form.harga);
      formData.append("kategori", form.kategori);
      formData.append("status", form.status);

      await api.post(
        "/api/tambah-menu",
        formData, {
        headers: {
          "Content-Type": undefined, // ✅ biarkan axios/browser set otomatis dengan boundary
        },
    });

      Swal.fire({
        icon: "success",
        title: "Tambah Menu Berhasil!",
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-confirm-button"
        },
      }).then(() => {
        navigate("/kelola-menu");
      });

    } catch (error) {

      const errors = error.response?.data?.errors;

      if (errors) {
        const firstError = Object.values(errors)[0][0];

        Swal.fire({
          icon: "error",
          title: "Tambah Menu Gagal",
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
          title: "Tambah Menu Gagal",
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
      setIsLoading(false); // 🔑 WAJIB
    }
  };

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
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
        </svg>
        <h1>Tambah Menu</h1>
      </header>
      <form onSubmit={handleTambahMenu} className="form-qr-form form-versi-2">
        <div className="utama-input-qr-form">
          <div className="input-qr-form">
            <label>Gambar Menu :</label>
            <label className="custom-file-container" htmlFor="image">
              <div className="input-file">
                <div className="custom-file-label">Pilih File</div>
                <span className="file-name">
                  {form.gambar ? form.gambar.name : "Unggah File (Maks. 1MB, JPG/PNG)"}
                </span>
              </div>

              <input
                type="file"
                id="image"
                className="custom-file-input"
                onChange={(e) => {
                  const file = e.target.files[0];

                  const isImage = file && file.type.startsWith('image/');

                  const MAX_FILE_SIZE = 1 * 1024 * 1024; // Contoh: 5 MB
                  const isSizeValid = file && file.size <= MAX_FILE_SIZE;

                  if (isImage && isSizeValid) {
                    setForm({
                      ...form,
                      gambar: file,
                    });
                  } else {

                    let errorTitle = "Gagal Unggah!";
                    let errorText = "File yang diunggah harus berupa gambar (JPG, PNG, JPEG) dan berukuran maksimal 1MB.";

                    if (!isImage) {
                      errorTitle = "Tipe File Salah!";
                      errorText = "Hanya file gambar (JPG, PNG, JPEG) yang diizinkan.";
                    } else if (file && !isSizeValid) {
                      errorTitle = "Ukuran File Terlalu Besar!";
                      errorText = "Ukuran file tidak boleh melebihi 1MB.";
                    }

                    Swal.fire({
                      icon: "warning",
                      title: errorTitle,
                      text: errorText,
                      confirmButtonText: "Kembli",
                      customClass: {
                        popup: "custom-swal",
                        title: "custom-title",
                        htmlContainer: "custom-text",
                        confirmButton: "custom-confirm-button",
                      },
                    });
                    e.target.value = null;

                    setForm({
                      ...form,
                      gambar: null,
                    });
                  }
                }}
                accept="image/*"
                required
              />
            </label>
          </div>
          <div className="input-qr-form">
            <label>Nama :</label>
            <input
              type="text"
              name="nama_menu"
              placeholder='Masukkan Nama Menu'
              value={form.nama_menu}
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
              value={form.harga}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-qr-form">
            <label>Kategori :</label>
            <div className="custom-dropdown">
              <div className="dropdown-display" onClick={() => setMenu(!menu)}>
                <span>
                  {form.kategori ? labelKategori[form.kategori] : "Pilih Kategori Menu"}
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
                  {form.status ? labelStatus[form.status] : "Pilih Status Menu"}
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
            disabled={isLoading}
            className={isLoading ? "btn-loading" : ""}
          >
            {isLoading ? (
              <span className="loading-dots">
                Loading<span> . </span><span>. </span><span>. </span>
              </span>
            ) : (
              "Simpan"
            )}
          </button>
        </div>

      </form>


      <FooterAdmin />
    </div>
  )
}

export default TambahMenu
