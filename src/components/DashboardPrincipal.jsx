import React, { useState, useEffect } from "react";
import {
  FaBox, FaClock, FaPlus, FaEuroSign, FaWarehouse, FaTrophy,
  FaEye, FaEyeSlash, FaCalendarAlt
} from "react-icons/fa";
import RegistroPaquete from "./RegistroPaquete";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import "../styles/dashboardPrincipal.css";

export default function DashboardPrincipal({ paquetes, actualizarPaquetes }) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarIngresos, setMostrarIngresos] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split("T")[0]);
  const [resumen, setResumen] = useState({
    recibidosHoy: 0,
    entregadosHoy: 0,
    ingresoHoy: 0,
    ingresoTotal: 0,
    almacenActual: 0,
    horaPico: "–",
    estantesLlenos: 0,
    mediaDiaria: 0,
    recordRecibidos: 0,
    recordEntregados: 0,
    recordIngreso: 0
  });
  const [historial, setHistorial] = useState([]);
  const [mejorDia, setMejorDia] = useState(null);

  const fechaLocalISO = (fechaString) => {
    const fecha = new Date(fechaString);
    const offsetMs = fecha.getTimezoneOffset() * 60000;
    return new Date(fecha.getTime() - offsetMs).toISOString().split("T")[0];
  };

  useEffect(() => {
    const hoyISO = fechaLocalISO(new Date());
    const horasEntregas = {};
    const ingresosPorDia = {};
    const baldas = {};
    const recibidosPorDia = {};
    const entregadosPorDia = {};

    let ingresoHoy = 0;
    let ingresoTotal = 0;
    let recibidosHoy = 0;
    let entregadosHoy = 0;
    let almacenActual = 0;

    paquetes.forEach((p) => {
      const recibidoISO = fechaLocalISO(p.fecha_recibido);
      const entregadoISO = p.fecha_entregado ? fechaLocalISO(p.fecha_entregado) : null;

      recibidosPorDia[recibidoISO] = (recibidosPorDia[recibidoISO] || 0) + 1;
      if (recibidoISO === hoyISO) recibidosHoy++;

      if (p.estado === "entregado" && entregadoISO) {
        ingresoTotal += Number(p.precio || 0);
        ingresosPorDia[entregadoISO] = (ingresosPorDia[entregadoISO] || 0) + Number(p.precio || 0);
        entregadosPorDia[entregadoISO] = (entregadosPorDia[entregadoISO] || 0) + 1;

        if (entregadoISO === hoyISO) {
          entregadosHoy++;
          ingresoHoy += Number(p.precio || 0);
          const hora = new Date(p.fecha_entregado).getHours();
          horasEntregas[hora] = (horasEntregas[hora] || 0) + 1;
        }
      }

      if (p.estado === "pendiente") almacenActual++;

      // SOLO contar baldas con nombre válido
      if (p.compartimento) {
        baldas[p.compartimento] = (baldas[p.compartimento] || 0) + 1;
      }
    });

    const excluirFecha = "2025-06-07";

    const recordRecibidos = Object.entries(recibidosPorDia)
      .filter(([fecha]) => fecha !== excluirFecha)
      .map(([, total]) => total)
      .reduce((max, n) => Math.max(max, n), 0);

    const recordEntregados = Object.entries(entregadosPorDia)
      .filter(([fecha]) => fecha !== excluirFecha)
      .map(([, total]) => total)
      .reduce((max, n) => Math.max(max, n), 0);

    const recordIngreso = Object.entries(ingresosPorDia)
      .filter(([fecha]) => fecha !== excluirFecha)
      .map(([, total]) => total)
      .reduce((max, n) => Math.max(max, n), 0);

    const historico = {};
    Object.keys(recibidosPorDia).forEach((fecha) => {
      historico[fecha] = historico[fecha] || { recibidos: 0, entregados: 0 };
      historico[fecha].recibidos = recibidosPorDia[fecha];
    });
    Object.keys(entregadosPorDia).forEach((fecha) => {
      historico[fecha] = historico[fecha] || { recibidos: 0, entregados: 0 };
      historico[fecha].entregados = entregadosPorDia[fecha];
    });

    const historialOrdenado = Object.entries(historico)
      .map(([fecha, datos]) => ({ fecha, ...datos }))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const mejor = historialOrdenado.reduce(
      (a, b) => (b.entregados > a.entregados ? b : a),
      { entregados: 0 }
    );

    const horasPorDia = {};
    paquetes.forEach((p) => {
      if (p.estado === "entregado" && p.fecha_entregado) {
        const fecha = fechaLocalISO(p.fecha_entregado);
        const hora = new Date(p.fecha_entregado).getHours();
        if (!horasPorDia[fecha]) horasPorDia[fecha] = {};
        horasPorDia[fecha][hora] = (horasPorDia[fecha][hora] || 0) + 1;
      }
    });

    const picosPorDia = Object.values(horasPorDia).map((horas) => {
      const [horaPico] = Object.entries(horas).sort((a, b) => b[1] - a[1])[0];
      return parseInt(horaPico);
    });

    const mediaHoraPico = picosPorDia.length > 0
      ? Math.round(picosPorDia.reduce((sum, h) => sum + h, 0) / picosPorDia.length)
      : null;

    const horaPico = mediaHoraPico !== null ? `${mediaHoraPico}:00` : "–";

    const horasRecibidosPorDia = {};
    paquetes.forEach((p) => {
      if (p.estado === "pendiente" && p.fecha_recibido) {
        const fecha = fechaLocalISO(p.fecha_recibido);
        const hora = new Date(p.fecha_recibido).getHours();
        if (!horasRecibidosPorDia[fecha]) horasRecibidosPorDia[fecha] = {};
        horasRecibidosPorDia[fecha][hora] = (horasRecibidosPorDia[fecha][hora] || 0) + 1;
      }
    });

    const picosRecibidosPorDia = Object.values(horasRecibidosPorDia).map((horas) => {
      const [horaPico] = Object.entries(horas).sort((a, b) => b[1] - a[1])[0];
      return parseInt(horaPico);
    });

    const mediaHoraRecibido = picosRecibidosPorDia.length > 0
      ? Math.round(picosRecibidosPorDia.reduce((sum, h) => sum + h, 0) / picosRecibidosPorDia.length)
      : null;

    const horaPicoRecibido = mediaHoraRecibido !== null ? `${mediaHoraRecibido}:00` : "–";

    const estantesLlenos = Object.values(baldas).filter((cantidad) => cantidad > 12).length;

    const mediaDiaria = historialOrdenado.length > 0
      ? Math.round(historialOrdenado.reduce((sum, d) => sum + d.recibidos, 0) / historialOrdenado.length)
      : 0;

    setResumen({
      recibidosHoy,
      entregadosHoy,
      ingresoHoy,
      ingresoTotal,
      almacenActual,
      horaPico,
      horaPicoRecibido,
      estantesLlenos,
      mediaDiaria,
      recordRecibidos,
      recordEntregados,
      recordIngreso
    });

    setHistorial(historialOrdenado);
    setMejorDia(mejor?.fecha || null);
  }, [paquetes]);

  const datosGrafico = Array.from({ length: 24 }, (_, h) => ({
    hora: `${h}:00`,
    entregas: paquetes.filter((p) => {
      if (p.estado !== "entregado" || !p.fecha_entregado) return false;
      const fecha = new Date(p.fecha_entregado);
      return (
        fechaLocalISO(p.fecha_entregado) === fechaSeleccionada &&
        fecha.getHours() === h
      );
    }).length,
  }));

  const formatoIngresos = (valor) => mostrarIngresos ? `${valor.toFixed(2)}€` : "****";

  return (
    <div className="dashboard-principal">
      <h2>Hola, Estanco Benidoleig</h2>
      <button className="btn-rapido" onClick={() => setMostrarModal(true)}>
        <FaPlus /> Añadir paquete rápido
      </button>

      <div className="grupo-resumen">
        <div className="card-doble">
          <div className="card-doble-icon"><FaBox /></div>
          <div className="card-doble-contenido">
            <div className="linea-dato">
              <span>Recibidos hoy</span>
              <strong className="valor azul">{resumen.recibidosHoy}</strong>
              <span className="badge-record">
                <FaTrophy style={{ marginRight: "6px", color: "#0d6efd" }} />
                Récord diario: {resumen.recordRecibidos}
              </span>
            </div>
            <div className="linea-dato">
              <span>Entregados hoy</span>
              <strong className={`valor ${resumen.entregadosHoy > resumen.recibidosHoy ? "verde" : "gris"}`}>
                {resumen.entregadosHoy} {resumen.entregadosHoy > resumen.recibidosHoy && "✅"}
              </strong>
              <span className="badge-record">
                <FaTrophy style={{ marginRight: "6px", color: "#0d6efd" }} />
                Récord diario: {resumen.recordEntregados}
              </span>
            </div>
          </div>
        </div>

        <ResumenCard icon={<FaClock />} label="Hora pico recibidos" valor={resumen.horaPicoRecibido} />
        <ResumenCard icon={<FaTrophy />} label="Media recibidos" valor={resumen.mediaDiaria} />
        <ResumenCard icon={<FaWarehouse />} label="Estantes llenos" valor={`${resumen.estantesLlenos}/25`} />
        <ResumenCard icon={<FaBox />} label="En almacén" valor={resumen.almacenActual} />
      </div>

      <div className="grafico-horas">
        <h3><FaCalendarAlt /> Entregas por Hora</h3>
        <input
          type="date"
          className="selector-fecha"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
        />
        <BarChart width={600} height={250} data={datosGrafico}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hora" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="entregas" fill="#3b82f6" />
        </BarChart>
      </div>

      <div className="historial-logros">
        <div className="resumen-dia">
          {historial.map((h) => {
            if (h.fecha !== fechaSeleccionada) return null;
            return (
              <div key={h.fecha} className={`dia-card ${mejorDia === h.fecha ? "mejor-dia" : ""}`}>
                <h4>{new Date(h.fecha).toLocaleDateString()}</h4>
                <p>Recibidos: {h.recibidos}</p>
                <p>Entregados: {h.entregados}</p>
              </div>
            );
          })}
        </div>
      </div>

      {mostrarModal && (
        <div className="modal-fondo">
          <div className="modal-contenido">
            <RegistroPaquete paquetes={paquetes} actualizarPaquetes={actualizarPaquetes} />
            <button className="cerrar-modal" onClick={() => setMostrarModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ResumenCard({ icon, label, valor }) {
  return (
    <div className="resumen-card">
      {icon}
      <div>
        <strong>{valor}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
