import React, { useState, useEffect } from "react";
import './kelola-menu.css';
import { useNavigate } from "react-router-dom";
import HeaderAdmin from "../templates/header-admin";
import FooterAdmin from '../templates/footer-admin';
import Swal from "sweetalert2";
import { Table } from "react-bootstrap";
import api from "../../lib/axios";
import PageLoading from "../PageLoading/pageloading";

function KelolaMenu() {

  const navigate = useNavigate();

  const [menuData, setMenuData] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [previewImg, setPreviewImg] = useState(null);

  const TampilkanMenu = async () => {
    try {
      const response = await api.get(
        "/api/semua-menu"
      );

      setMenuData(response.data.data);

    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Gagal mengambil data menu",
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
    TampilkanMenu();
  }, []);

  const [openMenu, setOpenMenu] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("all");

  const menuList = [
    { label: "Semua", value: "all" },
    { label: "Makanan", value: "makanan" },
    { label: "Minuman", value: "minuman" },
  ];

  const filteredMenu = (menuData || []).filter((item) => {
    const cocokNama = item.nama_menu
      .toLowerCase()
      .includes(searchName.toLowerCase());

    const cocokKategori =
      selectedMenu === "all" ||
      item.kategori === selectedMenu;

    return cocokNama && cocokKategori;
  });

  const statusLabel = {
    available: "Tersedia",
    unvailable: "Tidak Tersedia",
  };

  const kategoriLabel = {
    makanan: "Makanan",
    minuman: "Minuman",
  };

  const handleTambah = () => {
    navigate("/tambah-menu"); // kembali-admin ke halaman sebelumnya
  };

  const handleEdit = (id) => {
    navigate(`/edit-menu/${id}`); // kembali-admin ke halaman sebelumnya
  };

  const handleDelete = async (id, nama_menu) => {
    Swal.fire({
      icon: "warning",
      title: `Apakah Anda yakin ingin menghapus menu ${nama_menu}?`,
      showDenyButton: true,
      confirmButtonText: "Ya",
      denyButtonText: "Tidak",
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      customClass: {
        popup: "custom-swal",
        title: "custom-title",
        htmlContainer: "custom-text",
        confirmButton: "custom-confirm-button",
        denyButton: "custom-cancel-button"
      },

      preConfirm: async () => {
        try {
          await api.delete(
            `/api/delete-menu/${id}`
          );
          return true;
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: `Menu ${nama_menu} gagal Dihapus.`,
            text: error.response?.data?.message || "Terjadi kesalahan server",
            confirmButtonText: "OK",
            customClass: {
              popup: "custom-swal",
              title: "custom-title",
              htmlContainer: "custom-text",
              confirmButton: "custom-confirm-button",
            },
          });
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: `Menu ${nama_menu} berhasil Dihapus.`,
          confirmButtonText: "OK",
          customClass: {
            popup: "custom-swal",
            title: "custom-title",
            htmlContainer: "custom-text",
            confirmButton: "custom-confirm-button",
          },
        });

        // refresh data
        TampilkanMenu();
      }
    });
  };

  if (isLoading) {
    return <PageLoading />;
  }

  const handleBack = () => {
    navigate("/beranda-admin"); // kembali-admin ke halaman sebelumnya
  };

  return (
    <div>
      <HeaderAdmin />
      <div onClick={handleBack} className="kembali-admin">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-arrow-left-circle" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
        </svg>
        <p>Beranda</p>
      </div>
      <header className='judul-beranda-admin'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-fork-knife" viewBox="0 0 16 16">
          <path d="M13 .5c0-.276-.226-.506-.498-.465-1.703.257-2.94 2.012-3 8.462a.5.5 0 0 0 .498.5c.56.01 1 .13 1 1.003v5.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5zM4.25 0a.25.25 0 0 1 .25.25v5.122a.128.128 0 0 0 .256.006l.233-5.14A.25.25 0 0 1 5.24 0h.522a.25.25 0 0 1 .25.238l.233 5.14a.128.128 0 0 0 .256-.006V.25A.25.25 0 0 1 6.75 0h.29a.5.5 0 0 1 .498.458l.423 5.07a1.69 1.69 0 0 1-1.059 1.711l-.053.022a.92.92 0 0 0-.58.884L6.47 15a.971.971 0 1 1-1.942 0l.202-6.855a.92.92 0 0 0-.58-.884l-.053-.022a1.69 1.69 0 0 1-1.059-1.712L3.462.458A.5.5 0 0 1 3.96 0z" />
        </svg>
        <h1>Kelola Menu</h1>
      </header>
      <div className="utama-filter">
        {/* Menu */}
        <div className="elemen-filter">
          <p>Pilih Kategori : </p>
          <div className="custom-dropdown-2">

            {/* ==== Display Pilihan ==== */}
            <div
              className="dropdown-display"
              onClick={() => setOpenMenu(!openMenu)}
            >
              <span>
                {menuList.find(m => m.value === selectedMenu)?.label || "Pilih Kategori"}
              </span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                className="bi bi-caret-down-fill"
                viewBox="0 0 16 16"
              >
                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1.506 0 0 1-1.506 0z" />
              </svg>
            </div>

            {/* ==== Dropdown List ==== */}
            {openMenu && (
              <div className="dropdown-list">
                {menuList.map((menu) => (
                  <div
                    key={menu.value}
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedMenu(menu.value);
                      setOpenMenu(false);
                    }}
                  >
                    {menu.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Nama */}
        <div className="elemen-filter search-filter">
          <p>Cari Nama : </p>
          <input
            type="text"
            placeholder="Cari menu ..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>

        <button
          onClick={handleTambah}
          className="custom-confirm-button button-filter"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
          </svg>
          Tambah Menu
        </button>
      </div>

      <div className="utama-data-tabel">
        <Table responsive='lg' striped hover>
          <thead style={{ background: "#f0f0f0" }}>
            <tr>
              <th>No</th>
              <th>Gambar</th>
              <th>Nama</th>
              <th>Harga</th>
              <th>Kategori</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredMenu.length === 0 ? (
              <tr>
                <td colSpan={7} className="keterangan-data">
                  Menu tidak ditemukan
                </td>
              </tr>

            ) : (
              filteredMenu.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td><img
                    src={`https://lhflkhdvvppiwzplynub.supabase.co/storage/v1/object/public/storage/${item.gambar}`}
                    alt={item.nama_menu} className="img-tabel"
                    style={{ cursor: "pointer" }}
                    onClick={() => setPreviewImg(item.gambar)}
                    loading="lazy"
                  /></td>
                  <td>{item.nama_menu}</td>
                  <td>Rp {item.harga.toLocaleString("id-ID")}</td>
                  <td> {kategoriLabel[item.kategori]}</td>
                  <td className={item.status === "available" ? "status-available" : "status-unvailable"}>
                    {statusLabel[item.status]}
                  </td>
                  <td className="utama-button-handle">
                    <button onClick={() => handleEdit(item.id)} className="handle-warning">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
                      </svg>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.id, item.nama_menu)} className="handle-danger">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
                        <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                      </svg>
                      Hapus
                    </button>
                  </td>
                </tr>
              )))}
          </tbody>
        </Table>

        {previewImg && (
          <div className="preview-overlay" onClick={() => setPreviewImg(null)}>
            <img src={previewImg} className="preview-img" loading="lazy"/>
          </div>
        )}
      </div>
      <FooterAdmin />
    </div>
  )
}

export default KelolaMenu
