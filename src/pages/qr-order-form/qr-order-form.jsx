// QROrderForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext/UseCart";
import './qr-order-form.css'
import Swal from "sweetalert2";
import api from "../../lib/axios";

function QROrderForm() {
  const [form, setFormData] = useState({
    nama_pemesan: "",
    nohp: "",
    catatan: null,
    jenis_pemesanan: "",
    bukti_pembayaran: null,
  });

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleFormPesanan = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const cek = await api.get("/api/pesanan-saya");

      const adaPesananAktif = cek.data.data.some(p =>
        ["pending", "di-proses", "selesai"].includes(p.status_pesanan)
      );

      if (adaPesananAktif) {
        Swal.fire({
          icon: "warning",
          title: "Tidak bisa lanjut",
          text: "Mohon selesaikan pesanan anda sebelumnya",
          confirmButtonText: "OK",
          customClass: {
            popup: "custom-swal",
            title: "custom-title",
            htmlContainer: "custom-text",
            confirmButton: "custom-confirm-button",
          },
        });

        setIsLoading(false);
        return;
      }

      const formData = new FormData();

      formData.append("nama_pemesan", form.nama_pemesan);
      formData.append("nohp", form.nohp);
      formData.append("catatan", form.catatan);
      formData.append("jenis_pemesanan", form.jenis_pemesanan);

      if (form.bukti_pembayaran) {
        formData.append("bukti_pembayaran", form.bukti_pembayaran);
      }


      const response = await api.post(
        "/api/qr-order-form",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const pesananId = response.data.pesanan_id;

      // ✅ Jika password cocok
      Swal.fire({
        icon: "success",
        title: "Pemesanan Berhasil!",
        text: "Data pemesanan berhasil disimpan",
        confirmButtonText: "Kembali",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-confirm-button",
        },
      }).then(() => {
        navigate(`/qr-pesanan/${pesananId}`);
      });
    } catch (error) {

      const errors = error.response?.data?.errors;

      if (errors) {
        const firstError = Object.values(errors)[0][0];

        Swal.fire({
          icon: "error",
          title: "Pemesanan Gagal!",
          text: firstError,
          confirmButtonText: "Kembali",
          customClass: {
            popup: "custom-swal",
            title: "custom-title",
            htmlContainer: "custom-text",
            confirmButton: "custom-cancel-button",
          },
        })
      } else {
        Swal.fire({
          icon: "error",
          title: "Pemesanan Gagal!",
          text: "Terjadi Kesalahan Server",
          confirmButtonText: "Kembali",
          customClass: {
            popup: "custom-swal",
            title: "custom-title",
            htmlContainer: "custom-text",
            confirmButton: "custom-cancel-button",
          },
        })
      }

    } finally {
      setIsLoading(false); // 🔑 WAJIB
    }
  };

  const [open, setOpen] = useState(false);

  const pilih = (value) => {
    setFormData(prev => ({ ...prev, jenis_pemesanan: value }));
    setOpen(false);
  };

  const labelTampil = {
    "dine-in": "Makan di Tempat",
    "take-away": "Dibawa Pulang",
  };


  const { cart, cartItems } = useCart();

  const handleBack = () => {
    navigate("/daftar-pesanan"); // kembali ke halaman sebelumnya
  };

  return (
    <div>
      <div onClick={handleBack} className="kembali">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-arrow-left-circle" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
        </svg>
        <p>Daftar Pesanan</p>
      </div>

      <h1 className="judul-utama">Form Pemesanan</h1>

      <form onSubmit={handleFormPesanan} className="form-qr-form">
        <div className="utama-input-qr-form">
          <div className="input-qr-form">
            <label><span style={{ color: "var(--second-color)" }}>* </span>Nama :</label>
            <input
              type="text"
              name="nama_pemesan"
              placeholder='Masukkan Nama'
              value={form.nama_pemesan}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-qr-form">
            <label><span style={{ color: "var(--second-color)" }}>* </span>Jenis Pemesanan :</label>
            <div className="custom-dropdown">
              <div className="dropdown-display" onClick={() => setOpen(!open)}>
                <span>
                  {form.jenis_pemesanan
                    ? labelTampil[form.jenis_pemesanan]
                    : "Pilih Jenis Pemesanan"}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                  <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                </svg>
              </div>

              {open && (
                <div className="dropdown-list">
                  <div className="dropdown-item" onClick={() => pilih("dine-in")}>
                    <span>Makan di Tempat</span>
                  </div>

                  <div className="dropdown-item" onClick={() => pilih("take-away")}>
                    <span>Dibawa Pulang</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="utama-input-qr-form">
          <div className="input-qr-form">
            <label><span style={{ color: "var(--second-color)" }}>* </span>Nomor HP :</label>
            <input
              type="text"
              name="nohp"
              placeholder='Masukkan Nomor HP'
              value={form.nohp}
               onChange={(e) => {
      const onlyNumbers = e.target.value.replace(/\D/g, '');
      setForm({ ...form, nohp: onlyNumbers });
    }}
    inputMode="numeric"
    pattern="[0-9]*"
              required
            />
          </div>
          <div className="input-qr-form">
            <label>Catatan :</label>
            <input
              type="text"
              name="catatan"
              placeholder='Tuliskan catatan khusus (opsional)...'
              value={form.catatan}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="utama-input-qr-form input-bukti-pembayaran">
          <img style={{ cursor: "pointer" }}
            onClick={() => setPreviewImg("/assets/images/qr.jpeg")} src="/assets/images/qr.jpeg" alt="" loading="lazy"/>
          <div className="input-qr-form">
            <label><span style={{ color: "var(--second-color)" }}>* </span>Bukti Pembayaran :</label>
            <label className="custom-file-container" htmlFor="bukti_pembayaran">
              <div className="input-file">
                <div className="custom-file-label">Pilih File</div>
                <span className="file-name">
                  {form.bukti_pembayaran ? form.bukti_pembayaran.name : "Unggah File (Maks. 1MB, JPG/PNG)"}
                </span>
              </div>

              <input
                type="file"
                id="bukti_pembayaran"
                name="bukti_pembayaran"
                className="custom-file-input"
                onChange={(e) => {
                  const file = e.target.files[0];

                  const isImage = file && file.type.startsWith('image/');

                  const MAX_FILE_SIZE = 1 * 1024 * 1024; // Contoh: 5 MB
                  const isSizeValid = file && file.size <= MAX_FILE_SIZE;

                  if (isImage && isSizeValid) {
                    setFormData({
                      ...form,
                      bukti_pembayaran: file,
                    });
                  } else {

                    let errorTitle = "Gagal Unggah!";
                    let errorText = "File yang diunggah harus berupa gambar (JPEG, PNG, GIF, dll.) dan berukuran maksimal 1MB.";

                    if (!isImage) {
                      errorTitle = "Tipe File Salah!";
                      errorText = "Hanya file gambar (JPEG, PNG, GIF, dll.) yang diizinkan.";
                    } else if (file && !isSizeValid) {
                      errorTitle = "Ukuran File Terlalu Besar!";
                      errorText = "Ukuran file tidak boleh melebihi 1MB.";
                    }

                    Swal.fire({
                      icon: "warning",
                      title: errorTitle,
                      text: errorText,
                      confirmButtonText: "Tutup", // Ubah sesuai konteks, misalnya "Tutup"
                      confirmButtonColor: "#d33",
                      customClass: {
                        popup: "custom-swal",
                        title: "custom-title",
                        htmlContainer: "custom-text",
                        confirmButton: "custom-confirm-button",
                      },
                    });
                    e.target.value = null;

                    setFormData({
                      ...form,
                      bukti_pembayaran: null,
                    });
                  }
                }}
                accept="image/*"
                required
              />
            </label>
          </div>
        </div>
      </form>

      <div className="utama-item-qr-form">
        {cartItems.map((item) => (
          <div key={item.id} className="item-qr-form">
            <img
              src={`https://lhflkhdvvppiwzplynub.supabase.co/storage/v1/object/public/storage/${item.menu.gambar}`}
              alt={item.menu.nama_menu}
              loading="lazy"
            />

            <div className="detail-item-qr-form">
              <div className="text-item-qr-form">
                <h1>{item.menu.nama_menu}</h1>
                <div className="utama-qty-qof">
                  <p>Rp {Number(item.harga).toLocaleString("id-ID")}</p>
                  <div className="item-qty-qof">
                    <p style={{ fontWeight: "bold" }}>X</p>
                    <p>jml : {item.jumlah}</p>
                  </div>
                </div>
              </div>
              <div className="qty-control-item-qr-form">
                <span>Rp {Number(item.subtotal).toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="informasi-qof">
        <p className="utama-informasi-qof">PERHATIAN!</p>
        <p className="second-informasi-qof">Harap periksa kembali pesanan Anda. Pesanan yang telah dikonfirmasi tidak dapat diubah atau dibatalkan dengan alasan apa pun</p>
      </div>

      <div className="utama-total-qr-form">
        <div className="total-qr-form">
          <h1>Total : Rp {Number(cart?.total_harga || 0).toLocaleString("id-ID")}</h1>
        </div>

        <button
          type="button"
          onClick={handleFormPesanan}
          disabled={isLoading}
          className={`button-total-qr-form ${isLoading ? "btn-loading-qof" : ""}`}
        >
          {isLoading ? (
            <span className="loading-dots-qof">
              <span>.</span><span>.</span><span>.</span>
            </span>
          ) : (
            "Lanjutkan"
          )}
        </button>

      </div>

      {previewImg && (
        <div className="preview-overlay" onClick={() => setPreviewImg(null)}>
          <img src={previewImg} className="preview-img" loading="lazy"/>
        </div>
      )}

    </div>
  );
}

export default QROrderForm;
