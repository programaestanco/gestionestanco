import React, { useEffect, useState } from "react";
import "../styles/dashboardLayout.css";
import { useUser } from "../context/useUser";
import { obtenerPaquetes } from "../services/paquetesService";
import RegistroPaquete from "./RegistroPaquete";
import ListaPaquetes from "./ListaPaquetes";
import Estanterias from "./Estanterias";
import ResumenIngresos from "./ResumenIngresos";
import DashboardPrincipal from "./DashboardPrincipal";
import PinModal from "./PinModal";
import Devoluciones from "./Devoluciones";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import {
  FaPlus, FaBox, FaThList, FaChartBar,
  FaSignOutAlt, FaTachometerAlt, FaUndoAlt
} from "react-icons/fa";

export default function DashboardLayout() {
  const { logout, user } = useUser();
  const [paquetes, setPaquetes] = useState([]);
  const [mostrarPinModal, setMostrarPinModal] = useState(false);
  const [intentarIrA, setIntentarIrA] = useState(null);
  const [cantidadDevoluciones, setCantidadDevoluciones] = useState(0);
  const [hayDevolucionesNuevas, setHayDevolucionesNuevas] = useState(false);
  const [toastGlobal, setToastGlobal] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const rutaActual = location.pathname;

  const actualizarPaquetes = async () => {
    try {
      const datos = await obtenerPaquetes();
      setPaquetes(datos);
    } catch (error) {
      console.error("Error al obtener paquetes:", error);
    }
  };

  useEffect(() => {
    actualizarPaquetes();
  }, []);

  // Detectar devoluciones vencidas
  useEffect(() => {
    const ahora = new Date();
    const vencidos = paquetes.filter((p) => {
      const fecha = new Date(p.fecha_recibido);
      const dias = (ahora - fecha) / (1000 * 60 * 60 * 24);
      return p.estado === "pendiente" && dias >= 20;
    });
    setCantidadDevoluciones(vencidos.length);

    if (vencidos.length > 0) {
      if (rutaActual !== "/devoluciones") {
        setHayDevolucionesNuevas(true);
        setToastGlobal(`⚠ Hay ${vencidos.length} paquetes con más de 20 días sin recoger.`);
      } else {
        setHayDevolucionesNuevas(false); // ya entró
      }
    }
  }, [paquetes, rutaActual]);

  useEffect(() => {
    if (toastGlobal) {
      const timeout = setTimeout(() => setToastGlobal(""), 6000);
      return () => clearTimeout(timeout);
    }
  }, [toastGlobal]);

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
          <button
            onClick={() => {
              navigate("/devoluciones");
              setHayDevolucionesNuevas(false);
            }}
            className={`sidebar-link ${rutaActual === "/devoluciones" ? "activo" : ""} ${hayDevolucionesNuevas ? "parpadeo" : ""}`}
          >
            <FaUndoAlt /> Devoluciones
            {cantidadDevoluciones > 0 && (
              <span className="badge-alerta-num">{cantidadDevoluciones}</span>
            )}
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
            <PinModal
              onSuccess={handlePinCorrecto}
              onClose={handleCerrarModal}
            />
          )}

          {toastGlobal && (
            <div className="toast-global">
              {toastGlobal}
              <button onClick={() => navigate("/devoluciones")} className="ir-devoluciones">
                Ver
              </button>
            </div>
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
                  <DashboardPrincipal paquetes={paquetes} actualizarPaquetes={actualizarPaquetes} nombreUsuario={user?.username || "Usuario"} />
                } />
                <Route path="/añadir" element={
                  <RegistroPaquete paquetes={paquetes} actualizarPaquetes={actualizarPaquetes} />
                } />
                <Route path="/buscar" element={
                  <ListaPaquetes paquetes={paquetes} actualizarPaquetes={actualizarPaquetes} />
                } />
                <Route path="/estanterias" element={
                  <Estanterias paquetes={paquetes} />
                } />
                <Route path="/ingresos" element={
                  <ResumenIngresos paquetes={paquetes} />
                } />
                <Route path="/devoluciones" element={
                  <Devoluciones paquetes={paquetes} actualizarPaquetes={actualizarPaquetes} />
                } />
                <Route path="*" element={
                  <DashboardPrincipal paquetes={paquetes} actualizarPaquetes={actualizarPaquetes} nombreUsuario={user?.username || "Usuario"} />
                } />
              </Routes>
            </Motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
