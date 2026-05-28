import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppRouter from "./routes/AppRouter.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';
import AuthProvider from "../src/context/AuthProvider.jsx";

createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <AppRouter />
    </AuthProvider>
)
