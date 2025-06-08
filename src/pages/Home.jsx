import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import RegistroPaquete from "../components/RegistroPaquete";
import Estanterias from "../components/Estanterias";
import ListaPaquetes from "../components/ListaPaquetes";
import { obtenerPaquetes } from "../services/paquetesService";
import ResumenIngresos from "../components/ResumenIngresos";
import "../styles/home.css";

export default function Home() {
  const { logout } = useUser();
  const navigate = useNavigate();

  const [paquetes, setPaquetes] = useState([]);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [mostrarEstanterias, setMostrarEstanterias] = useState(false);

  const cargarPaquetes = async () => {
    setActualizando(true);
    try {
      const data = await obtenerPaquetes();
      setPaquetes(data);
    } catch (err) {
      console.error("Error al cargar paquetes:", err);
    } finally {
      setActualizando(false);
      setLoadingInicial(false);
    }
  };

  useEffect(() => {
    cargarPaquetes();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="home-container">
      {/* Header fijo con logout */}
      <header className="home-header">
        <div className="navbar">
          <div className="logo-area">
            <i className="fas fa-box-open"></i>
            <span>Tracking Estanco</span>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
        <div className="hero">
          <h1>GESTIÓN DE PAQUETES</h1>
          <p>Control profesional y centralizado de tu recepción de paquetes</p>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="home-main">
        <RegistroPaquete
          paquetes={paquetes}
          actualizarPaquetes={cargarPaquetes}
        />

        <div className="estanterias-toggle-container">
          <button
            className={`toggle-estanterias ${mostrarEstanterias ? "activo" : ""}`}
            onClick={() => setMostrarEstanterias(!mostrarEstanterias)}
          >
            <i className={`fas ${mostrarEstanterias ? "fa-eye-slash" : "fa-eye"}`}></i>{" "}
            {mostrarEstanterias ? "Ocultar estanterías" : "Mostrar estanterías"}
          </button>
        </div>

        <div className={`estanterias-wrapper ${mostrarEstanterias ? "visible" : "oculto"}`}>
          <Estanterias paquetes={paquetes} />
        </div>

        {loadingInicial ? (
          <div className="loading-indicator">Cargando paquetes...</div>
        ) : (
          <>
            <ListaPaquetes
              paquetes={paquetes}
              actualizarPaquetes={cargarPaquetes}
              cargando={actualizando}
            />
            <ResumenIngresos paquetes={paquetes} />
          </>
        )}
      </main>
    </div>
  );
}
