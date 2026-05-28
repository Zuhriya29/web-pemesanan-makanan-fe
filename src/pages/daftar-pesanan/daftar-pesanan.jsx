import React from "react";
import "./daftar-pesanan.css";
import { useCart } from "../CartContext/UseCart";
import { useNavigate } from "react-router-dom";
import PageLoading from "../PageLoading/pageloading";

function DaftarPesanan() {

  const {
    cart,
    cartItems,
    loading,
    updateQuantity,
    loadingAction,
    removeFromCart,
    loadingHapusItem,
    clearCart,
    loadinghapuskeranjang,
    isProcessing
  } = useCart();

  const navigate = useNavigate();

  if (loading) {
    return <PageLoading />;
  }

  const handleBack = () => {
    if (isProcessing) return;
    navigate("/menu"); // kembali ke halaman sebelumnya
  };

  const handleToForm = () => {
    if (isProcessing) return;
    navigate("/qr-order-form"); // kembali ke halaman sebelumnya
  };

  return (
    <div>
      <div
        onClick={handleBack}
        disabled={isProcessing} style={{
          pointerEvents: isProcessing ? "none" : "auto",
          opacity: isProcessing ? 0.5 : 1
        }}
        className="kembali">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-arrow-left-circle" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
        </svg>
        <p>Menu</p>
      </div>
      <div className="utama-daftar-pesanan">
        <h1 className="judul-utama">Daftar Pesanan</h1>
        <div
          className={`hapus-semua-daftar-pesanan ${loadinghapuskeranjang ? "btn-loading" : ""}`}
          onClick={!isProcessing ? clearCart : null}
          style={{ pointerEvents: isProcessing ? "none" : "auto", opacity: isProcessing && !loadinghapuskeranjang ? 0.5 : 1 }}
        >
          {loadinghapuskeranjang ? (
            <span className="loading-dots">
              Menghapus<span> . </span><span>. </span><span>. </span>
            </span>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16"> <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" /> <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" /> </svg>
              Hapus Semua
            </>
          )}
        </div>
        {cartItems.length === 0 ? (
          <p className="produk-tidak-ditemukan">Belum ada pesanan</p>
        ) : (
          <>
            <div className="utama-item-daftar-pesanan">
              {cartItems.map((item) => (
                <div key={item.id} className="item-daftar-pesanan">
                  <img
                    src={`https://lhflkhdvvppiwzplynub.supabase.co/storage/v1/object/public/storage/${item.menu.gambar}`}
                    alt={item.menu.nama_menu}
                    loading="lazy"
                  />

                  <div className="detail-item-daftar-pesanan">
                    <div className="text-item-daftar-pesanan">
                      <h1>{item.menu.nama_menu}</h1>
                      <p>Rp {Number(item.harga).toLocaleString("id-ID")}</p>
                    </div>

                    <div className="qty-control-item-daftar-pesanan">
                      {loadingAction.itemId === item.id ? (
                        <span className="loading-dots-dp">
                          <span>.</span><span>.</span><span>.</span>
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => updateQuantity(item.id, item.jumlah - 1)}
                            disabled={item.jumlah === 1 && isProcessing}
                          >
                            -
                          </button>

                          <span>{item.jumlah}</span>

                          <button
                            onClick={() => updateQuantity(item.id, item.jumlah + 1)}
                            disabled={isProcessing}
                          >+</button>
                        </>
                      )}
                    </div>

                    {loadingHapusItem.itemId === item.id ? (
                      <span className="loading-dots-dp-hapus-item">
                        <span>.</span><span>.</span><span>.</span>
                      </span>
                    ) : (
                      <>
                        <div className="hapus-item-wrapper">
                          {loadingHapusItem.itemId === item.id ? (
                            <span className="loading-dots-dp-hapus-item">
                              <span>.</span><span>.</span><span>.</span>
                            </span>
                          ) : (
                            <div
                              onClick={!isProcessing ? () => removeFromCart(item.id) : null}
                              className="button-hapus-item-daftar-pesanan"
                              style={{
                                pointerEvents: isProcessing ? "none" : "auto",
                                opacity: isProcessing && loadingHapusItem.itemId !== item.id ? 0.5 : 1
                              }}
                            >
                              Hapus
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="utama-total-daftar-pesanan">
              <div className="total-daftar-pesanan">
                <h1>Total : Rp {Number(cart?.total_harga || 0).toLocaleString("id-ID")}</h1>
              </div>
              <p
                onClick={handleToForm}
                style={{
                  pointerEvents: isProcessing ? "none" : "auto",
                  opacity: isProcessing ? 1 : 1
                }}
                className="button-total-daftar-pesanan"
              >
                Lanjutkan Order
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DaftarPesanan;
