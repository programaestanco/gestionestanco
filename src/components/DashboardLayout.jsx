import React, { useEffect, useState } from "react";
import "../styles/dashboardLayout.css";
import { useUser } from "../context/useUser";
import { obtenerPaquetes, buscarPaquetesPorCliente } from "../services/paquetesService";
import RegistroPaquete from "./RegistroPaquete";
import ListaPaquetes from "./ListaPaquetes";
import Estanterias from "./Estanterias";
import ResumenIngresos from "./ResumenIngresos";
import DashboardPrincipal from "./DashboardPrincipal";
import PinModal from "./PinModal";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import {
  FaPlus, FaBox, FaThList, FaChartBar,
  FaSignOutAlt, FaTachometerAlt, FaUndoAlt
} from "react-icons/fa";

export default function DashboardLayout() {
  const { logout, user } = useUser();
  const [paquetes, setPaquetes] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [total, setTotal] = useState(0);
  const [cargandoMas, setCargandoMas] = useState(false);

  const [mostrarPinModal, setMostrarPinModal] = useState(false);
  const [intentarIrA, setIntentarIrA] = useState(null);
  const [modoBusqueda, setModoBusqueda] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const rutaActual = location.pathname;

  const actualizarPaquetes = async (pagina = 0, resetear = false, nuevosDatos = null) => {
    try {
      if (nuevosDatos) {
        setPaquetes(nuevosDatos);
        setModoBusqueda(true);
      } else {
        const { data, total } = await obtenerPaquetes(pagina * 500);
        setPaquetes(prev => resetear ? data : [...prev, ...data]);
        setTotal(total);
        setModoBusqueda(false);
      }
    } catch (error) {
      console.error("Error al obtener paquetes:", error);
    }
  };

  useEffect(() => {
    actualizarPaquetes(0, true);
  }, []);

  const cargarSiguientePagina = () => {
    const siguiente = pagina + 1;
    if ((siguiente * 500) < total) {
      setPagina(siguiente);
      setCargandoMas(true);
      actualizarPaquetes(siguiente);
      setCargandoMas(false);
    }
  };

  const manejarAccesoConPin = (ruta) => {
    setIntentarIrA(ruta);
    setMostrarPinModal(true);
  };

  const handlePinCorrecto = () => {
    setMostrarPinModal(false);
    if (intentarIrA) {
      navigate(intentarIrA);
      setIntentarIrA(null);
    }
  };

  const handleCerrarModal = () => {
    setMostrarPinModal(false);
    setIntentarIrA(null);
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo clickable-logo" onClick={() => navigate("/")}>
          <img src="/easypack.png" alt="EasyPack Logo" className="logo-img" />
          <div className="linea-separadora"></div>
        </div>

        <div className="sidebar-menu">
          <button onClick={() => navigate("/añadir")} className={rutaActual === "/añadir" ? "activo" : ""}>
            <FaPlus /> Añadir
          </button>
          <button onClick={() => navigate("/buscar")} className={rutaActual === "/buscar" ? "activo" : ""}>
            <FaThList /> Búsqueda
          </button>
          <button onClick={() => navigate("/estanterias")} className={rutaActual === "/estanterias" ? "activo" : ""}>
            <FaBox /> Estantes
          </button>
        </div>
      </aside>

      <div className="main-layout">
        <header className="navbar-superior">
          <div className="navbar-izquierda">
            <button
              className={`btn-navbar ${rutaActual === "/" ? "activo" : ""}`}
              onClick={() => navigate("/")}
            >
              <FaTachometerAlt /> Dashboard
            </button>
            <button
              className={`btn-navbar ${rutaActual === "/ingresos" ? "activo" : ""}`}
              onClick={() => manejarAccesoConPin("/ingresos")}
            >
              <FaChartBar /> Área Personal
            </button>
          </div>
          <div className="usuario-area">
            <button className="btn-logout" onClick={logout}>
              <FaSignOutAlt /> Cerrar sesión
            </button>
          </div>
        </header>

        <main className={`dashboard-content ${mostrarPinModal ? "blurred" : ""}`}>
          {mostrarPinModal && (
            <PinModal onSuccess={handlePinCorrecto} onClose={handleCerrarModal} />
          )}

          <AnimatePresence mode="wait">
            <Motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={
                  <DashboardPrincipal
                    paquetes={paquetes}
                    actualizarPaquetes={() => actualizarPaquetes(0, true)}
                    nombreUsuario={user?.username || "Usuario"}
                  />
                } />
                <Route path="/añadir" element={
                  <RegistroPaquete
                    paquetes={paquetes}
                    actualizarPaquetes={() => actualizarPaquetes(0, true)}
                  />
                } />
                <Route path="/buscar" element={
                  <>
                    <ListaPaquetes
                      paquetes={paquetes}
                      actualizarPaquetes={(datos) => actualizarPaquetes(0, true, datos)}
                    />
                    {!modoBusqueda && paquetes.length < total && (
                      <div style={{ textAlign: "center", marginTop: "1rem" }}>
                        <button onClick={cargarSiguientePagina} disabled={cargandoMas}>
                          {cargandoMas ? "Cargando más..." : "Cargar más resultados"}
                        </button>
                      </div>
                    )}
                  </>
                } />
                <Route path="/estanterias" element={<Estanterias paquetes={paquetes} />} />
                <Route path="/ingresos" element={<ResumenIngresos paquetes={paquetes} />} />
                <Route path="*" element={
                  <DashboardPrincipal
                    paquetes={paquetes}
                    actualizarPaquetes={() => actualizarPaquetes(0, true)}
                    nombreUsuario={user?.username || "Usuario"}
                  />
                } />
              </Routes>
            </Motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
