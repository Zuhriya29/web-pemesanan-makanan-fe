import React, { useState } from "react";
import './register.css'
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../lib/axios";

function VerifikasiEmail() {

  const [isLoading, setIsLoading] = useState(false);

  const handleVerifikasiEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const showError = (text) => {
      setIsLoading(false);

      Swal.fire({
        icon: "error",
        title: "Verifikasi Email Gagal Dikirim!",
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

    const token = localStorage.getItem("verify_token");

    if (!token) {
      showError("Sesi tidak ditemukan, silakan daftar ulang.");
      return;
    }

    try {

      await api.post(
        "/api/email/verification-notification",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ Jika password cocok
      Swal.fire({
        icon: "success",
        title: " Verifikasi Email Berhasil Dikirim!",
        text: "Silakan periksa email anda untuk melakukan verifikasi email",
        confirmButtonText: "Kembali",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-confirm-button",
        },
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
          <h1 className="text-center">Verifikasi Email Anda</h1>
          <div className='register-signup'>
            <p>Kami telah mengirim link verifikasi ke email kamu.
              Silakan cek inbox atau folder spam.</p>
          </div>
          <form className="form-register" onSubmit={handleVerifikasiEmail}>
            <div className='button-register mt-2 mb-5'>
              <button
                type="submit"
                disabled={isLoading}
                className={isLoading ? "btn-loading" : ""}
              >
                {isLoading ? (
                  <span className="loading-dots">
                    Memproses<span> . </span><span>. </span><span>. </span>
                  </span>
                ) : (
                  "Kirim Ulang Link Verifikasi"
                )}
              </button>
            </div>

            <div className="register-signup">
              <p>Sudah verifikasi?</p>
              <a href="/login">Login Sekarang</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default VerifikasiEmail
