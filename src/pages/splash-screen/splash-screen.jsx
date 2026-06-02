import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './splash-screen.css';
import useAuth from '../../context/useAuth'

function SplashScreen() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // tunggu auth selesai

    const timer = setTimeout(() => {
      if (!user) {
        navigate("/menu");
      } else if (user.role === "admin") {
        navigate("/beranda-admin");
      } 
    }, 5000); // splash tetap muncul

    return () => clearTimeout(timer);
  }, [user, loading, navigate]);

  return (
    <div>
      <div className='utama-splashscreen'>
        <img className='animate__animated animate__backInDown animate__delay-0s' src="/assets/images/logo.jpg" alt="Logo" loading="lazy"/>
        <h1 className='animate__animated animate__fadeIn animate__delay-1s'>Griya Dhahar Suroboyo</h1>
        <div className='detail-splashscreen'>
          <p className='animate__animated animate__bounceIn animate__delay-2s'>Gado-Gado,</p>
          <p className='animate__animated animate__bounceIn animate__delay-3s'>Tahu Campur,</p>
          <p className='animate__animated animate__bounceIn animate__delay-4s'>Lontong Balap</p>
        </div>
      </div>
    </div>
  )
}

export default SplashScreen
