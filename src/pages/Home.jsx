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
  const [loading, setLoading] = useState(true);
  const [mostrarEstanterias, setMostrarEstanterias] = useState(false);

  const cargarPaquetes = async () => {
    setLoading(true);
    try {
      const data = await obtenerPaquetes();
      setPaquetes(data);
    } catch (err) {
      console.error("Error al cargar paquetes:", err);
    } finally {
      setLoading(false);
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
      <div className="logout-container">
        <button className="logout-button" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Cerrar sesión
        </button>
      </div>

      <header className="home-header">
        <div className="header-content">
          <h1 className="header-title">Gestión de Paquetes</h1>
          <p className="header-subtitle">
            Organiza y controla todos los paquetes desde un único lugar.
          </p>
        </div>
      </header>

      <main className="home-main">
        {loading ? (
          <div className="loading-indicator">Cargando paquetes...</div>
        ) : (
          <>
            <RegistroPaquete
              paquetes={paquetes}
              actualizarPaquetes={cargarPaquetes}
            />

            <div className="estanterias-toggle-container">
              <button
                className={`toggle-estanterias ${
                  mostrarEstanterias ? "activo" : ""
                }`}
                onClick={() => setMostrarEstanterias(!mostrarEstanterias)}
              >
                <i
                  className={`fas ${
                    mostrarEstanterias ? "fa-eye-slash" : "fa-eye"
                  }`}
                ></i>{" "}
                {mostrarEstanterias
                  ? "Ocultar estanterías"
                  : "Mostrar estanterías"}
              </button>
            </div>

            <div
              className={`estanterias-wrapper ${
                mostrarEstanterias ? "visible" : "oculto"
              }`}
            >
              <Estanterias paquetes={paquetes} />
            </div>

            <ListaPaquetes
              paquetes={paquetes}
              actualizarPaquetes={cargarPaquetes}
            />

            <ResumenIngresos paquetes={paquetes} />
          </>
        )}
      </main>
    </div>
  );
}
