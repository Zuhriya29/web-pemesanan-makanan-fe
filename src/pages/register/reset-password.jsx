import React, { useState } from "react";
import './register.css'
import { Eye, EyeOff } from "lucide-react";
import { useSearchParams, useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import api from "../../lib/axios";

function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [searchParams] = useSearchParams();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const togglePasswordVisibility2 = () => {
    setShowPassword2((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const token = searchParams.get('token');
    const emailFromUrl = searchParams.get('email');

    if (!token || !emailFromUrl) {
      Swal.fire({
        icon: "error",
        title: "Link Tidak Valid!",
        text: "Link reset password tidak valid atau sudah kedaluwarsa.",
        confirmButtonText: "Kembali",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-cancel-button",
        },
      });
      setIsLoading(false);
      return;
    }

    const showError = (text) => {
      Swal.fire({
        icon: "error",
        title: "Ubah Password Gagal!",
        text,
        confirmButtonText: "Kembali",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-cancel-button",
        },
      });
    };

    try {

      await api.post("/api/reset-password", {
        token,
        email: emailFromUrl,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      // ✅ Jika password cocok
      Swal.fire({
        icon: "success",
        title: "Ubah Password Berhasil!",
        text: "Silakan login untuk melanjutkan pemesanan.",
        confirmButtonText: "Login",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-confirm-button",
        },
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      const errors = error.response?.data?.errors;
      const message = error.response?.data?.message;

      if (errors) {
        showError(Object.values(errors)[0][0]);
      } else {
        showError(message || "Terjadi Kesalahan Server");
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div>
      <div className="utama-form-register">
        <div className="gambar-register">
          <img src="/assets/images/animasi-registrasi.png" alt="" loading="lazy" />
        </div>
        <div className='utama-form'>
          <h1>Reset Password</h1>
          <form className="form-register" onSubmit={handleResetPassword}>
            <div className="input-register">
              <div className="icon-input-register">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-lock" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4M4.5 7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7zM8 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3" />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder='Password Baru'
                value={form.password}
                onChange={handleChange}
                required
              />
              <span
                onClick={togglePasswordVisibility}
                className="eye-password"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </span>
            </div>
            <div className="input-register">
              <div className="icon-input-register">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-lock" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4M4.5 7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7zM8 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3" />
                </svg>
              </div>
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
                className="eye-password"
              >
                {showPassword2 ? <EyeOff /> : <Eye />}
              </span>
            </div>
            <div className='button-register mt-2 mb-5'>
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
                  "Ubah"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
