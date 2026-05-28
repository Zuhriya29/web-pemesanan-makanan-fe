import React, { useState, useEffect } from "react";
import './kelola-akun.css';
import { useNavigate } from "react-router-dom";
import HeaderAdmin from "../templates/header-admin";
import FooterAdmin from '../templates/footer-admin';
import Swal from "sweetalert2";
import { Table } from "react-bootstrap";
import api from "../../lib/axios";
import PageLoading from "../PageLoading/pageloading";

function KelolaAkunPelanggan() {

  const navigate = useNavigate();

  const [AkunUserData, setAkunUserData] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const TampilkanAkunUser = async () => {
    try {
      const response = await api.get(
        "/api/semua-user"
      );

      setAkunUserData(response.data.data);

    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Gagal mengambil data akun user",
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
    TampilkanAkunUser();
  }, []);

  const filteredAkunUser = AkunUserData.filter((item) =>
    item.name.toLowerCase().includes(searchName.toLowerCase())
  );

  const handleBack = () => {
    navigate("/beranda-admin"); // kembali-admin ke halaman sebelumnya
  };

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div>
      <HeaderAdmin />
      <div onClick={handleBack} className="kembali-admin">
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-arrow-left-circle" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
        </svg>
        <p>Beranda</p>
      </div>
      <header className='judul-beranda-admin'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-people" viewBox="0 0 16 16">
          <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
        </svg>
        <h1>Kelola Akun Pelanggan</h1>
      </header>
      <div className="utama-filter">
        <div className="elemen-filter search-filter">
          <p>Cari Nama : </p>
          <input
            type="text"
            placeholder="Ketik nama..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
      </div>

      <div className="utama-data-tabel">
        <Table responsive='lg' striped hover>
          <thead style={{ background: "#f0f0f0" }}>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Nomor HP</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {filteredAkunUser.length === 0 ? (
              <tr>
                <td colSpan={7} className="keterangan-data">
                  Akun admin tidak ditemukan
                </td>
              </tr>

            ) : (
              filteredAkunUser.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.nohp}</td>
                  <td>{item.role}</td>
                </tr>
              )))}
          </tbody>
        </Table>
      </div>
      <FooterAdmin />
    </div>
  )
}

export default KelolaAkunPelanggan
