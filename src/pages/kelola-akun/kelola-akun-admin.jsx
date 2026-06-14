import React, { useState, useEffect } from "react";
import './kelola-akun.css';
import { useNavigate } from "react-router-dom";
import HeaderAdmin from "../templates/header-admin";
import FooterAdmin from '../templates/footer-admin';
import Swal from "sweetalert2";
import { Table } from "react-bootstrap";
import api from "../../lib/axios";
import PageLoading from "../PageLoading/pageloading";

function KelolaAkunAdmin() {

  const navigate = useNavigate();

  const [AkunAdminData, setAkunAdminData] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const TampilkanAkunAdmin = async () => {
    try {
      const response = await api.get(
        "/api/semua-admin"
      );

      setAkunAdminData(response.data.data);

    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Gagal mengambil data akun admin",
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
    TampilkanAkunAdmin();
  }, []);

  const filteredAkunAdmin = AkunAdminData.filter((item) =>
    item.name.toLowerCase().includes(searchName.toLowerCase())
  );

  const handleTambah = () => {
    navigate("/tambah-admin"); // kembali-admin ke halaman sebelumnya
  };

  const handleDelete = async (id, name) => {
    Swal.fire({
      icon: "warning",
      title: `Apakah Anda yakin ingin menghapus akun ${name}?`,
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
            `/api/delete-akun-admin/${id}`
          );
          return true;
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: `Akun admin ${name} gagal Dihapus.`,
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
          title: `Akun ${name} berhasil Dihapus.`,
          confirmButtonText: "OK",
          customClass: {
            popup: "custom-swal",
            title: "custom-title",
            htmlContainer: "custom-text",
            confirmButton: "custom-confirm-button",
          },
        });

        // refresh data
        TampilkanAkunAdmin();
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
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-person-check" viewBox="0 0 16 16">
          <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.708l.547.548 1.17-1.951a.5.5 0 1 1 .858.514M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
          <path d="M8.256 14a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1z" />
        </svg>
        <h1>Kelola Akun Admin</h1>
      </header>
      <div className="utama-filter">
        <div className="elemen-filter search-filter">
          <p>Cari nama : </p>
          <input
            type="text"
            placeholder="Ketik nama..."
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
          Tambah Admin
        </button>
      </div>

      <div className="utama-data-tabel">
        <Table responsive='lg' striped hover>
          <thead style={{ background: "#f0f0f0" }}>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredAkunAdmin.length === 0 ? (
              <tr>
                <td colSpan={7} className="keterangan-data">
                  Akun admin tidak ditemukan
                </td>
              </tr>

            ) : (
              filteredAkunAdmin.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.role}</td>
                  <td className="utama-button-handle">
                    <button onClick={() => handleDelete(item.id, item.name)} className="handle-danger">
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
      </div>
      <FooterAdmin />
    </div>
  )
}

export default KelolaAkunAdmin
