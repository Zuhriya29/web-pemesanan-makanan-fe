import React, { createContext, useState, useEffect } from "react";
import api from "../../lib/axios";
import Swal from "sweetalert2";
import useAuth from "../../context/useAuth"

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState({
    itemId: null,
    type: null,
  });
  const [loadingHapusItem, setLoadingHapusItem] = useState({
    itemId: null
  });
  const [loadinghapuskeranjang, setLoadingHapusKeranjang] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

  // Ambil keranjang dari database saat halaman dibuka
  const fetchCart = async () => {
    
    try {
      const [cartRes, itemsRes] = await Promise.all([
        api.get("/api/keranjang"),          // 🔑 keranjang utama
        api.get("/api/semua-keranjang-item"),    // 🔑 keranjang item
      ]);

      setCart(cartRes.data.data);
      setCartItems(itemsRes.data.data);
    } catch (error) {
      if (error.response?.status !== 401) {
        Swal.fire({
          icon: "error",
          title: "Gagal mengambil data keranjang",
          confirmButtonText: "OK",
          customClass: {
            popup: "custom-swal",
            title: "custom-title",
            htmlContainer: "custom-text",
            confirmButton: "custom-confirm-button",
          },
        });
      }

      setCart(null);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      fetchCart();
    }
  }, [authLoading, user]);

  // TAMBAH KE KERANJANG (API)
  const addToCart = async (menuId) => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      await api.post(
        "/api/tambah-keranjang-item",
        {
          menu_id: menuId,
          jumlah: 1
        },
        { withCredentials: true }
      );

      // refresh cart dari database
      await fetchCart();

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal masuk keranjang",
        text:
          error.response?.data?.message ||
          "Terjadi kesalahan server",
        customClass: {
          popup: "custom-swal",
          title: "custom-title",
          htmlContainer: "custom-text",
          confirmButton: "custom-confirm-button",
        },
      });
      console.error("Gagal tambah ke keranjang", error);
     } finally {
      setIsProcessing(false)
    }
  };

  // UPDATE JUMLAH
  const updateQuantity = async (cartItemId, jumlah, type) => {
    if (isProcessing) return;
    if (jumlah < 1) return;

    setIsProcessing(true);
    setLoadingAction({ itemId: cartItemId, type });

    try {
      await api.put(
        `/api/update-keranjang-item/${cartItemId}`,
        { jumlah }
      );

      await fetchCart();
    } catch (error) {
      console.error("Gagal update quantity", error.response?.data || error);
    } finally {
      setLoadingAction({ itemId: null, type: null });
      setIsProcessing(false)
    }
  };

  // HAPUS ITEM
  const removeFromCart = async (cartItemId) => {
    if(isProcessing) return;

setIsProcessing(true)
    setLoadingHapusItem({ itemId: cartItemId });

    try {
      await api.delete(`/api/hapus-keranjang-item/${cartItemId}`, {
        withCredentials: true,
      });
      fetchCart();
    } catch (error) {
      console.error("Gagal hapus item", error);
    } finally {
      setLoadingHapusItem({ itemId: null });
      setIsProcessing(false)
    }
  };

  // CLEAR CART
  const clearCart = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setLoadingHapusKeranjang(true);

    try {
      await api.delete("/api/hapus-keranjang", {
        withCredentials: true,
      });
      setCartItems([]);
    } catch (error) {
      console.error("Gagal clear cart", error);
    }finally {
      setLoadingHapusKeranjang(false);
      setIsProcessing(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        loading,
        loadingAction,
        loadingHapusItem,
        loadinghapuskeranjang,
        isProcessing,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartContext;
