import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLoading from '../pages/PageLoading/pageloading'
import useAuth from './useAuth';

export default function AuthCallback() {
    const navigate = useNavigate();
    const { fetchUser } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')
        const error = params.get('error')

        if (error) {
            navigate('/login?error=' + error)
            return
        }

        if (token) {
            // Simpan token
            localStorage.setItem('token', token)

            // Ambil data user dari Laravel
            fetchUser().then(() => {
                const role = localStorage.getItem('role');

                if (role?.toLowerCase() === 'admin') {
                    navigate('/beranda-admin');
                } else {
                    navigate('/menu');
                }
            });
        } else {
            navigate('/login');
        }
    });

    return <PageLoading />;
}