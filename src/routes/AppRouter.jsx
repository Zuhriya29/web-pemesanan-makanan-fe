import '../styles/global.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QRScanner from '../pages/qr-scanner/qr-scanner';
import Menu from '../pages/menu/menu';
import DaftarPesanan from '../pages/daftar-pesanan/daftar-pesanan';
import StatusPesanan from '../pages/status-pesanan/status-pesanan';
import Login from '../pages/register/login';
import Signup from '../pages/register/signup';
import BerandaAdmin from '../pages/beranda-admin/beranda-admin';
import KelolaPesanan from '../pages/kelola-pesanan/kelola-pesanan';
import KelolaMenu from '../pages/kelola-menu/kelola-menu';
import KelolaAkunAdmin from '../pages/kelola-akun/kelola-akun-admin';
import KelolaAkunPelanggan from '../pages/kelola-akun/kelola-akun-pelanggan';
import RiwayatPemesanan from '../pages/riwayat-pemesanan/riwayat-pemesanan';
import EditMenu from '../pages/edit-menu/edit-menu';
import TambahMenu from '../pages/tambah-menu/tambah-menu';
import ForgotPassword from '../pages/register/forgot-password';
import ResetPassword from '../pages/register/reset-password';
import ProtectedRoute from '../pages/protected-route/protected-route';
import PublicRoute from '../pages/protected-route/public-route';
import SplashScreen from '../pages/splash-screen/splash-screen';
import { CartProvider } from '../pages/CartContext/CartContext';
import DetailRiwayatPesanan from '../pages/detail-riwayat-pesanan/detail-riwayat-pesanan';
import QROrderForm from '../pages/qr-order-form/qr-order-form';
import TambahAdmin from '../pages/tambah-admin/tambah-admin';
import QrPesanan from '../pages/qr-pesanan/qr-pesanan';
import AuthCallback from '../context/AuthCallback';
import ValidResetRoute from '../pages/protected-route/ValidResetRoute';
import VerifikasiEmail from '../pages/register/verifikasi-email';
import VerifyEmailRoute from '../pages/protected-route/VerifyEmailRoute';

function App() {

  return (
    <>
      <Router>
        <>
          <CartProvider>
            <Routes>
              <Route path="/signup" element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } />
              <Route path="/verifikasi-email" element={
                <PublicRoute>
                  <VerifyEmailRoute>
                    <VerifikasiEmail />
                  </VerifyEmailRoute>
                </PublicRoute>
              } />
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/auth/callback" element={
                <PublicRoute>
                  <AuthCallback />
                </PublicRoute>
              }
              />
              <Route path="/forgot-password" element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } />
              <Route path="/reset-password" element={
                <PublicRoute>
                  <ValidResetRoute>
                    <ResetPassword />
                  </ValidResetRoute>
                </PublicRoute>
              } />
              <Route path="/" element={<SplashScreen />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/daftar-pesanan" element={
                <ProtectedRoute role="user">
                  <DaftarPesanan />
                </ProtectedRoute>
              } />
              <Route path="/qr-order-form" element={
                <ProtectedRoute role="user">
                  <QROrderForm />
                </ProtectedRoute>
              } />
              <Route path="/qr-pesanan/:id" element={
                <ProtectedRoute role="user">
                  <QrPesanan />
                </ProtectedRoute>
              } />
              <Route path="/status-pemesanan" element={
                <ProtectedRoute role="user">
                  <StatusPesanan />
                </ProtectedRoute>
              } />
              <Route path="/riwayat-pemesanan" element={
                <ProtectedRoute role="user">
                  <RiwayatPemesanan />
                </ProtectedRoute>
              } />
              <Route path="/detail-riwayat-pesanan/:id" element={
                <ProtectedRoute role="user">
                  <DetailRiwayatPesanan />
                </ProtectedRoute>
              } />

              <Route path="/beranda-admin" element={
                <ProtectedRoute role="admin">
                  <BerandaAdmin />
                </ProtectedRoute>
              } />
              <Route path="/qr-scanner" element={
                <ProtectedRoute role="admin">
                  <QRScanner />
                </ProtectedRoute>
              } />
              <Route path="/kelola-pesanan" element={
                <ProtectedRoute role="admin">
                  <KelolaPesanan />
                </ProtectedRoute>
              } />
              <Route path="/kelola-menu" element={
                <ProtectedRoute role="admin">
                  <KelolaMenu />
                </ProtectedRoute>
              } />
              <Route path="/tambah-menu" element={
                <ProtectedRoute role="admin">
                  <TambahMenu />
                </ProtectedRoute>
              } />
              <Route path="/edit-menu/:id" element={
                <ProtectedRoute role="admin">
                  <EditMenu />
                </ProtectedRoute>
              } />
              <Route path="/kelola-akun-admin" element={
                <ProtectedRoute role="admin">
                  <KelolaAkunAdmin />
                </ProtectedRoute>
              } />
              <Route path="/tambah-admin" element={
                <ProtectedRoute role="admin">
                  <TambahAdmin />
                </ProtectedRoute>
              } />
              <Route path="/kelola-akun-pelanggan" element={
                <ProtectedRoute role="admin">
                  <KelolaAkunPelanggan />
                </ProtectedRoute>
              } />
            </Routes>
          </CartProvider>
        </>
      </Router>
    </>
  )
}

export default App
