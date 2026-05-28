import React, { useEffect, useState, useRef } from "react";
import './menu.css'
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from '../CartContext/UseCart';
import api from "../../lib/axios";
import PageLoading from "../PageLoading/pageloading";
import useAuth from '../../context/useAuth';

function Menu() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [DataMenuMakanan, setDataMenuMakanan] = useState([]);
  const [DataMenuMinuman, setDataMenuMinuman] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleGoToStatusPemesanan = () => {
    navigate("/status-pemesanan");
  };

  const handleGoToRiwayatPemesanan = () => {
    navigate("/riwayat-pemesanan");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Yakin ingin logout?",
      text: "Sesi Anda akan diakhiri.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, logout",
      cancelButtonText: "Batal",
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      customClass: {
        popup: "custom-swal",
        title: "custom-title",
        htmlContainer: "custom-text",
        confirmButton: "custom-confirm-button",
        cancelButton: "custom-cancel-button",
      },
      preConfirm: async () => {
        try {
          await logout();
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("role");
          localStorage.clear();
          sessionStorage.clear();

          Swal.fire({
            icon: "success",
            title: "Berhasil logout",
            text: "Anda telah keluar dari akun.",
            confirmButtonText: "Kembali",
            customClass: {
              popup: "custom-swal",
              title: "custom-title",
              htmlContainer: "custom-text",
              confirmButton: "custom-confirm-button",
            },
          });

          return true;
        } catch {

          Swal.fire({
            icon: "error",
            title: "Logout Gagal",
            text: "Silahkan coba lagi",
            confirmButtonText: "Kembali",
            customClass: {
              popup: "custom-swal",
              title: "custom-title",
              htmlContainer: "custom-text",
              confirmButton: "custom-confirm-button",
            },
          });

          return false;
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/menu", { replace: true });
      }
    });
  };

  const { addToCart, isProcessing } = useCart();

  const TampilkanMenuMakanan = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        "/api/semua-menu-user?kategori=makanan"
      );

      setDataMenuMakanan(response.data.data);

    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Gagal mengambil data menu makanan",
        confirmButtonText: "Kembali",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-confirm-button",
        },

      })
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    TampilkanMenuMakanan();
  }, []);

  // Search filtering (case insensitive)
  const filteredMenuItems = DataMenuMakanan.filter((item) =>
    item.nama_menu?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [currentPage1, setCurrentPage1] = useState(1);
  const itemsPerPage1 = 12;

  // Hitung item yang akan ditampilkan
  const indexOfLastItem1 = currentPage1 * itemsPerPage1;
  const indexOfFirstItem1 = indexOfLastItem1 - itemsPerPage1;
  const currentItems1 = filteredMenuItems.slice(indexOfFirstItem1, indexOfLastItem1);

  const totalPages1 = Math.ceil(filteredMenuItems.length / itemsPerPage1);

  const TampilkanMenuMinuman = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(
        "/api/semua-menu-user?kategori=minuman"
      );

      setDataMenuMinuman(response.data.data);

    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Gagal mengambil data menu minuman",
        confirmButtonText: "Kembali",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-confirm-button",
        },

      })
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    TampilkanMenuMinuman();
  }, []);

  const filteredDrinkItems = DataMenuMinuman.filter((item) =>
    item.nama_menu?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Hitung item yang akan ditampilkan
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDrinkItems.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredDrinkItems.length / itemsPerPage);

  const drinkSectionRef = useRef(null);

  const scrollToDrinks = () => {
    if (drinkSectionRef.current) {
      drinkSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };

  useEffect(() => {
    scrollToDrinks();
  }, [currentPage]);

  const formatRupiah = (angka) => {
    return angka.toLocaleString("id-ID");
  };

  const handleGoToDaftarPemesanan = () => {
    navigate("/daftar-pesanan");
  };

  const [isLoadingId, setIsLoadingId] = useState(null);

  const handleAddToCart = async (menuId) => {
    setIsLoadingId(menuId);
    try {
      await addToCart(menuId);
    } finally {
      setIsLoadingId(null);
    }
  };

  const handleAddClick = (id) => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Harap login terlebih dahulu!",
        text: "Silakan login untuk menambahkan ke keranjang.",
        confirmButtonText: "Login",
        showCancelButton: true,
        cancelButtonText: "Batal",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-confirm-button",
          cancelButton: "custom-cancel-button",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login", { state: { redirect: "/menu" } });
        }
      });

      return;
    }

    handleAddToCart(id);
  };

  const { cartItems } = useCart();

  const totalMenu = Array.isArray(cartItems)
    ? cartItems.length
    : 0;

  const [animate, setAnimate] = useState(false);

  // Jalankan animasi setiap kali totalMenu berubah
  useEffect(() => {
    if (totalMenu > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 400); // animasi 0.4 detik
      return () => clearTimeout(timer);
    }
  }, [totalMenu]);

  const [isAboveFooter, setIsAboveFooter] = useState(true);

  useEffect(() => {
    const footer = document.querySelector("footer");

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAboveFooter(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (footer) observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.reload) {
      TampilkanMenuMinuman();
      TampilkanMenuMakanan();
    }
  }, [location.state]);

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div>
      <div className='utama-menu'>

        <div className='atas-menu'>
          <div className='logo-atas-menu'>
            <img src="/assets/images/logo.jpg" alt="Logo" loading="lazy" />
            <h1>Griya Dhahar Suroboyo</h1>
          </div>
          <div className='atas-menu-kanan'>
            <div className='search-atas-menu'>
              <input
                type="text"
                name="search"
                placeholder='Cari Menu'
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);    // reset page minuman
                  setCurrentPage1(1);   // reset page makanan
                }}
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
              </svg>
            </div>
            <div className='icon-atas-menu'>
              <div onClick={handleGoToStatusPemesanan} className='item-icon-atas-menu'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-bell-fill" viewBox="0 0 16 16">
                  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901" />
                </svg>
                <span className="tooltip-text-item-icon-atas-menu">Status Pemesanan</span>
              </div>
              <div onClick={handleGoToRiwayatPemesanan} className='item-icon-atas-menu'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-clock-fill" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
                </svg>
                <span className="tooltip-text-item-icon-atas-menu">Riwayat Pemesanan</span>
              </div>

              {!user ? (
                <div onClick={handleLogin} className='item-icon-atas-menu'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
                    <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                  </svg>
                  <span className="tooltip-text-item-icon-atas-menu">Login</span>
                </div>
              ) : (
                <div onClick={handleLogout} className='item-icon-atas-menu-logout'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-door-closed-fill" viewBox="0 0 16 16">
                    <path d="M12 1a1 1 0 0 1 1 1v13h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V2a1 1 0 0 1 1-1zm-2 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
                  </svg>
                  <span className="tooltip-text-item-icon-atas-menu-logout">Logout</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='utama-tengah-menu'>

          {filteredMenuItems.length === 0 && filteredDrinkItems.length === 0 && (
            <p className="produk-tidak-ditemukan">
              Produk tidak ditemukan
            </p>
          )}

          {filteredMenuItems.length > 0 && (
            <>
              <h1 className='judul-menu'>Menu Makanan</h1>
              <div className='tengah-menu'>
                {currentItems1.map((item) => (
                  <div className="elemen-tengah-menu" key={item.id}>
                    <img src={`https://lhflkhdvvppiwzplynub.supabase.co/storage/v1/object/public/storage/${item.gambar}`}
                      alt={item.nama_menu}
                      loading="lazy" />
                    <div className="detail-elemen-tengah-menu">
                      <div className="text-detail-elemen-tengah-menu">
                        <h1>{item.nama_menu}</h1>
                        <p>Rp {formatRupiah(item.harga)}</p>
                      </div>

                      <button
                        onClick={() => handleAddClick(item.id)}
                        type="button"
                        disabled={isLoadingId === item.id}
                        className={isLoadingId === item.id ? "btn-loading" : ""}
                        style={{
                          pointerEvents: isProcessing ? "none" : "auto",
                          opacity: isProcessing ? 1 : 1
                        }}
                      >
                        {isLoadingId === item.id ? (
                          <span className="loading-dots">
                            <span> . </span><span>. </span><span>. </span>
                          </span>
                        ) : (
                          <span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              className="bi bi-plus"
                              viewBox="0 0 16 16"
                            >
                              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                            </svg>
                            Tambahkan
                          </span>
                        )}
                      </button>

                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages1 > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage1((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage1 === 1}
                    style={{
                      pointerEvents: isProcessing ? "none" : "auto",
                      opacity: isProcessing ? 1 : 1
                    }}
                  >
                    &lt; Prev
                  </button>

                  {[...Array(totalPages1)].map((_, index) => (
                    <button
                      key={index + 1}
                      className={currentPage1 === index + 1 ? 'active' : ''}
                      onClick={() => setCurrentPage1(index + 1)}
                      style={{
                        pointerEvents: isProcessing ? "none" : "auto",
                        opacity: isProcessing ? 1 : 1
                      }}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage1((prev) => Math.min(prev + 1, totalPages1))}
                    disabled={currentPage1 === totalPages1}
                    style={{
                      pointerEvents: isProcessing ? "none" : "auto",
                      opacity: isProcessing ? 1 : 1
                    }}
                  >
                    Next &gt;
                  </button>
                </div>
              )}
            </>
          )}

          {filteredDrinkItems.length > 0 && (
            <>
              <div ref={drinkSectionRef}>
                <h1 className='judul-menu'>Menu Minuman</h1>
                <div className='tengah-menu'>
                  {currentItems.map((item) => (
                    <div className="elemen-tengah-menu" key={item.id}>
                      <img src={`https://lhflkhdvvppiwzplynub.supabase.co/storage/v1/object/public/storage/${item.gambar}`}
                        alt={item.nama_menu} loading="lazy" />
                      <div className="detail-elemen-tengah-menu">
                        <div className="text-detail-elemen-tengah-menu">
                          <h1>{item.nama_menu}</h1>
                          <p>Rp {formatRupiah(item.harga)}</p>
                        </div>
                        <button
                          onClick={() => handleAddClick(item.id)}
                          type="button"
                          disabled={isLoadingId === item.id}
                          className={isLoadingId === item.id ? "btn-loading" : ""}
                          style={{
                            pointerEvents: isProcessing ? "none" : "auto",
                            opacity: isProcessing ? 1 : 1
                          }}
                        >
                          {isLoadingId === item.id ? (
                            <span className="loading-dots">
                              <span> . </span><span>. </span><span>. </span>
                            </span>
                          ) : (
                            <span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                className="bi bi-plus"
                                viewBox="0 0 16 16"
                              >
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                              </svg>
                              Tambahkan
                            </span>
                          )}
                        </button>

                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{
                      pointerEvents: isProcessing ? "none" : "auto",
                      opacity: isProcessing ? 1 : 1
                    }}
                  >
                    &lt; Prev
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      className={currentPage === index + 1 ? 'active' : ''}
                      onClick={() => setCurrentPage(index + 1)}
                      style={{
                        pointerEvents: isProcessing ? "none" : "auto",
                        opacity: isProcessing ? 1 : 1
                      }}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{
                      pointerEvents: isProcessing ? "none" : "auto",
                      opacity: isProcessing ? 1 : 1
                    }}
                  >
                    Next &gt;
                  </button>
                </div>
              )}

            </>
          )}

        </div>

        <div className={`utama-bawah-menu ${isAboveFooter ? "fixed" : "non-fixed"}`}>
          <div
            onClick={handleGoToDaftarPemesanan}
            className='bawah-menu'
            style={{
              pointerEvents: isProcessing ? "none" : "auto",
              opacity: isProcessing ? 1 : 1
            }}>
            <div className='daftar-menu'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-card-list" viewBox="0 0 16 16">
                <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z" />
                <path d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8m0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-1-5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0M4 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
              </svg>
              <h1>Keranjang Pesanan</h1>
            </div>
            <p className={`jumlah-pesanan ${animate ? "bounce" : ""}`}>{totalMenu}</p>
          </div>
        </div>
      </div>

      {/* <footer class="bg-gray-900 text-gray-300 py-10 mt-10">
        <div class="max-w-7xl mx-auto px-5 grid grid-cols-1 md:grid-cols-4 gap-8">

          <div>
            <h2 class="text-xl font-bold text-white mb-3">Griya Dhahar Suroboyo</h2>
            <p class="text-gray-400 text-sm">
              Layanan pemesanan makanan khas Suroboyo dengan cita rasa asli, cepat, dan higienis.
            </p>
          </div>

          <div>
            <h3 class="font-semibold text-white mb-3">Menu</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-white">Beranda</a></li>
              <li><a href="#" class="hover:text-white">Daftar Menu</a></li>
              <li><a href="#" class="hover:text-white">Cara Pemesanan</a></li>
              <li><a href="#" class="hover:text-white">Hubungi Kami</a></li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold text-white mb-3">Kontak</h3>
            <p class="text-sm">📍 Surabaya, Jawa Timur</p>
            <p class="text-sm">📞 0812-3456-7890</p>
            <p class="text-sm">✉️ griyadhahar@gmail.com</p>
          </div>

          <div>
            <h3 class="font-semibold text-white mb-3">Ikuti Kami</h3>
            <div class="flex space-x-4">
              <a href="#" class="hover:text-white">Instagram</a>
              <a href="#" class="hover:text-white">Facebook</a>
              <a href="#" class="hover:text-white">TikTok</a>
            </div>
          </div>

        </div>

        <div class="text-center text-gray-500 text-sm mt-8 border-t border-gray-700 pt-4">
          © 2025 Griya Dhahar Suroboyo — Semua Hak Dilindungi.
        </div>
      </footer> */}
    </div>
  )
}

export default Menu
