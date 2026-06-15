import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import './tambah-admin.css'
import HeaderAdmin from "../templates/header-admin";
import FooterAdmin from "../templates/footer-admin";
import { Eye, EyeOff } from "lucide-react";
import api from "../../lib/axios";

function TambahAdmin() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const togglePasswordVisibility2 = () => {
    setShowPassword2((prev) => !prev);
  };

  const [isLoading, setIsLoading] = useState(false);


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleTambahAkunAdmin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("password_confirmation", form.password_confirmation);


      const response = await api.post("/api/auth/tambah-akun-admin", formData);
      const token = response.data.token;

      localStorage.setItem("verify_token", token);

      // ✅ Jika password cocok
      Swal.fire({
        icon: "success",
        title: "Registrasi Akun Admin Berhasil!",
        text: "Silakan cek email kamu untuk verifikasi akun",
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-confirm-button",
        },
      }).then(() => {
        navigate("/verifikasi-email");
      });
    } catch (error) {

      const errors = error.response?.data?.errors;

      if (errors) {
        const firstError = Object.values(errors)[0][0];

        Swal.fire({
          icon: "error",
          title: "Tambah Akun Admin Gagal!",
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
          title: "Tambah Akun Admin Gagal!",
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

  const handleBack = () => {
    navigate("/kelola-akun-admin"); // kembali-admin ke halaman sebelumnya
  };

  return (
    <div>
      <HeaderAdmin />
      <div onClick={handleBack} className="kembali-admin">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-arrow-left-circle" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
        </svg>
        <p>Kelola Akun Admin</p>
      </div>
      <header className='judul-beranda-admin'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
        </svg>
        <h1>Tambah Admin</h1>
      </header>
      <form onSubmit={handleTambahAkunAdmin} className="form-qr-form form-versi-2">
        <div className="utama-input-qr-form">
          <div className="input-qr-form">
            <label>Nama :</label>
            <input
              type="text"
              name="name"
              placeholder='Masukkan Nama Admin'
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-qr-form">
            <label>Email :</label>
            <input
              type="email"
              name="email"
              placeholder='Masukkan Alamat Email'
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="utama-input-qr-form">
          <div className="input-qr-form">
            <label>Password :</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder='Password'
                value={form.password}
                onChange={handleChange}
                required
              />
              <span
                onClick={togglePasswordVisibility}
                className="eye-password-2"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </span>
            </div>
          </div>
          <div className="input-qr-form">
            <label>Konfirmasi Password :</label>
            <div className="password-wrapper">
              <input
                type={showPassword2 ? "text" : "password"}
                name="password_confirmation"
                placeholder='Konfirmasi Password'
                value={form.password_confirmation}
                onChange={handleChange}
                required
              />
              <span
                onClick={togglePasswordVisibility2}
                className="eye-password-2"
              >
                {showPassword2 ? <EyeOff /> : <Eye />}
              </span>
            </div>
          </div>
        </div>
        <div className="utama-input-qr-form form-single">
          <div className="input-qr-form">
            <label>Role :</label>
            <input
              type="text"
              name="role"
              placeholder='Admin'
              value={form.role}
              readOnly
            />
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
                Menyimpan<span> . </span><span>. </span><span>. </span>
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

export default TambahAdmin
