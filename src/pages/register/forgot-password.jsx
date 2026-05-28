
import React, { useState } from "react";
import './register.css'
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import api from "../../lib/axios";

function ForgotPassword() {

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {

      await api.post("/api/forget-password", { email });

      Swal.fire({
        icon: "success",
        title: "Tautan reset dikirim!",
        text: "Cek email kamu untuk mengatur ulang kata sandi.",
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-confirm-button"
        },
      }).then(() => {
        navigate('/login');
      });
    } catch (error) {

      let message = "Terjadi Kesalahan Server";

      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        message = Object.values(errors)[0][0];
      } else if (error.response?.status === 401) {
        message = error.response.data.message;
      }

      Swal.fire({
        icon: "error",
        title: "Form Gagal Dikirim!",
        text: message,
        confirmButtonText: "Kembali",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-cancel-button",
        },
      });
    }
    finally {
      setIsLoading(false); // 🔑 WAJIB
    }
  };

  const handleBack = () => {
    navigate("/login");
  };

  return (
    <div>
      <div onClick={handleBack} className="kembali">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-arrow-left-circle" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
        </svg>
        <p>Login</p>
      </div>
      <div className="utama-form-register">
        <div className="gambar-register">
          <img src="/assets/images/animasi-registrasi.png" alt="" loading="lazy" />
        </div>
        <div className='utama-form'>
          <h1>Lupa Password</h1>
          <div className='register-signup'>
            <p>Masukkan alamat email dibawah ini untuk mendapatkan link verifikasi</p>
          </div>
          <form className="form-register" onSubmit={handleSubmit}>
            <div className="input-register">
              <div className="icon-input-register">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-envelope-at" viewBox="0 0 16 16">
                  <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2zm3.708 6.208L1 11.105V5.383zM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2z" />
                  <path d="M14.247 14.269c1.01 0 1.587-.857 1.587-2.025v-.21C15.834 10.43 14.64 9 12.52 9h-.035C10.42 9 9 10.36 9 12.432v.214C9 14.82 10.438 16 12.358 16h.044c.594 0 1.018-.074 1.237-.175v-.73c-.245.11-.673.18-1.18.18h-.044c-1.334 0-2.571-.788-2.571-2.655v-.157c0-1.657 1.058-2.724 2.64-2.724h.04c1.535 0 2.484 1.05 2.484 2.326v.118c0 .975-.324 1.39-.639 1.39-.232 0-.41-.148-.41-.42v-2.19h-.906v.569h-.03c-.084-.298-.368-.63-.954-.63-.778 0-1.259.555-1.259 1.4v.528c0 .892.49 1.434 1.26 1.434.471 0 .896-.227 1.014-.643h.043c.118.42.617.648 1.12.648m-2.453-1.588v-.227c0-.546.227-.791.573-.791.297 0 .572.192.572.708v.367c0 .573-.253.744-.564.744-.354 0-.581-.215-.581-.8Z" />
                </svg>
              </div>
              <input
                type="email"
                name="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Alamat Email'
                required
                style={{ width: "100%", padding: "8px", borderRadius: "5px" }}
              />
            </div>
            <div className='button-register mt-5 mb-5'>
              <button
                type="submit"
                disabled={isLoading}
                className={isLoading ? "btn-loading" : ""}
              >
                {isLoading ? (
                  <span className="loading-dots">
                    Menunggu<span> . </span><span>. </span><span>. </span>
                  </span>
                ) : (
                  "Selanjutnya"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
