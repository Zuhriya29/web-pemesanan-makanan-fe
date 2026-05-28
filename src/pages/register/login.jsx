import React, { useEffect, useState } from "react";
import './register.css'
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import useAuth from "../../context/useAuth";
import api from "../../lib/axios";

function Login() {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get("verified");
    const reason = params.get("reason");

    if (verified === "true") {
      Swal.fire({
        icon: "success",
        title: "Email Berhasil Diverifikasi!",
        text: "Silakan login untuk melanjutkan.",
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-confirm-button",
        },
      });
    } else if (verified === "already") {
      Swal.fire({
        icon: "info",
        title: "Email Sudah Diverifikasi",
        text: "Silakan login.",
        confirmButtonText: "OK",
      });
    } else if (verified === "false") {
      const reasonText = {
        expired: "Link verifikasi sudah kedaluwarsa.",
        invalid_hash: "Link verifikasi tidak valid.",
        user_not_found: "Akun tidak ditemukan.",
      };
      Swal.fire({
        icon: "error",
        title: "Verifikasi Gagal!",
        text: reasonText[reason] || "Terjadi kesalahan.",
        confirmButtonText: "OK",
      });
    }
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1️⃣ Ambil CSRF cookie (WAJIB untuk Sanctum)
      const response = await api.post("/api/login", {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      await fetchUser();

      // ✅ Jika password cocok
      Swal.fire({
        icon: "success",
        title: "Login Berhasil!",
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-confirm-button",
        },
      }).then(() => {
        if (response.data.role === "admin") {
          navigate("/beranda-admin");
        } else {
          navigate("/menu");
        }
      });
    } catch (error) {

       const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 403 && error.response?.data?.verified === false) {
        Swal.fire({
          icon: "warning",
          title: "Email Belum Diverifikasi!",
          text: message,
          confirmButtonText: "OK",
          customClass: {
            popup: "custom-swal",
            title: "custom-title",
            htmlContainer: "custom-text",
            confirmButton: "custom-cancel-button",
          },
        });
        return;
      }

      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0][0];

        Swal.fire({
          icon: "error",
          title: "Login Gagal!",
          text: firstError,
          confirmButtonText: "Kembali",
          customClass: {
            popup: "custom-swal",
            title: "custom-title",
            htmlContainer: "custom-text",
            confirmButton: "custom-cancel-button",
          },
        })
        return;
      }

      if (error.response?.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Login Gagal!",
          text: error.response.data.message,
          confirmButtonText: "Kembali",
          customClass: {
            popup: "custom-swal",
            title: "custom-title",
            htmlContainer: "custom-text",
            confirmButton: "custom-cancel-button",
          },
        })
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Login Gagal!",
        text: "Terjadi Kesalahan Server",
        confirmButtonText: "Kembali",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-cancel-button",
        },
      })
    } finally {
      setIsLoading(false); // 🔑 WAJIB
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`
  }

  return (
    <div>
      <div className="utama-form-register">
        <div className="gambar-register">
          <img src="/assets/images/animasi-registrasi.png" alt="" loading="lazy" />
        </div>
        <div className='utama-form'>
          <h1>Selamat Datang!</h1>
          <form className="form-register" onSubmit={handleLogin}>
            <div className="input-register">
              <div className="icon-input-register">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-envelope-at" viewBox="0 0 16 16">
                  <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2zm3.708 6.208L1 11.105V5.383zM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2z" />
                  <path d="M14.247 14.269c1.01 0 1.587-.857 1.587-2.025v-.21C15.834 10.43 14.64 9 12.52 9h-.035C10.42 9 9 10.36 9 12.432v.214C9 14.82 10.438 16 12.358 16h.044c.594 0 1.018-.074 1.237-.175v-.73c-.245.11-.673.18-1.18.18h-.044c-1.334 0-2.571-.788-2.571-2.655v-.157c0-1.657 1.058-2.724 2.64-2.724h.04c1.535 0 2.484 1.05 2.484 2.326v.118c0 .975-.324 1.39-.639 1.39-.232 0-.41-.148-.41-.42v-2.19h-.906v.569h-.03c-.084-.298-.368-.63-.954-.63-.778 0-1.259.555-1.259 1.4v.528c0 .892.49 1.434 1.26 1.434.471 0 .896-.227 1.014-.643h.043c.118.42.617.648 1.12.648m-2.453-1.588v-.227c0-.546.227-.791.573-.791.297 0 .572.192.572.708v.367c0 .573-.253.744-.564.744-.354 0-.581-.215-.581-.8Z" />
                </svg>
              </div>
              <input
                type="email"
                name="email"
                placeholder='Email'
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-register">
              <div className="icon-input-register">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-lock" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4M4.5 7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7zM8 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3" />
                </svg>
              </div>
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
                className="eye-password"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </span>
            </div>
            <a href="/forgot-password">Lupa Password?</a>
            <div className="button-register">
              <button
                type="submit"
                disabled={isLoading}
                className={isLoading ? "btn-loading" : ""}
              >
                {isLoading ? (
                  <span className="loading-dots">
                    Sedang Masuk<span> . </span><span>. </span><span>. </span>
                  </span>
                ) : (
                  "Masuk"
                )}
              </button>
            </div>
            <div className="utama-auth">
              <div className="garis-auth">
                <div className="elemen-garis-auth"></div>
                <p>Atau</p>
                <div className="elemen-garis-auth"></div>
              </div>
              <div className="button-register-2">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                >
                  <div className="button-auth">
                    <img src="/assets/images/google.png" alt="" loading="lazy" />
                    <p>Masuk Dengan Google</p>
                  </div>
                </button>
              </div>
            </div>
            <div className='register-signup'>
              <p>Belum punya akun?</p>
              <a href="/signup">Daftar</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
