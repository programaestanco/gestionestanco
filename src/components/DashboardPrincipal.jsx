import React, { useState, useEffect } from "react";
import {
  FaBox,
  FaClock,
  FaPlus,
  FaTrophy,
  FaWarehouse,
  FaChartLine,
  FaInbox,
} from "react-icons/fa";
import RegistroPaquete from "./RegistroPaquete";
import VolumenPaquetes from "./VolumenPaquetes";
import "../styles/dashboardPrincipal.css";

export default function DashboardPrincipal({ paquetes, actualizarPaquetes }) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [fechaSeleccionada] = useState(new Date().toISOString().split("T")[0]);
  const [resumen, setResumen] = useState({
    recibidosHoy: 0,
    entregadosHoy: 0,
    ingresoHoy: 0,
    ingresoTotal: 0,
    almacenActual: 0,
    horaPico: "–",
    horaPicoRecibido: "–",
    estantesLlenos: 0,
    mediaDiaria: 0,
    mediaEntregados: 0,
    recordRecibidos: 0,
    recordEntregados: 0,
    recordIngreso: 0
  });

  useEffect(() => {
    const fechaLocalISO = (fechaString) => {
      const fecha = new Date(fechaString);
      const offsetMs = fecha.getTimezoneOffset() * 60000;
      return new Date(fecha.getTime() - offsetMs).toISOString().split("T")[0];
    };

    const hoyISO = fechaLocalISO(new Date());
    const ingresosPorDia = {};
    const recibidosPorDia = {};
    const entregadosPorDia = {};
    const baldas = {};

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
        }
      }

      if (p.estado === "pendiente") {
        almacenActual++;
        if (p.compartimento) {
          baldas[p.compartimento] = (baldas[p.compartimento] || 0) + 1;
        }
      }
    });

    const excluirFecha = "2025-06-07";

    const recordRecibidos = Math.max(
      ...Object.entries(recibidosPorDia).filter(([f]) => f !== excluirFecha).map(([, v]) => v), 0
    );

    const recordEntregados = Math.max(
      ...Object.entries(entregadosPorDia).filter(([f]) => f !== excluirFecha).map(([, v]) => v), 0
    );

    const recordIngreso = Math.max(
      ...Object.entries(ingresosPorDia).filter(([f]) => f !== excluirFecha).map(([, v]) => v), 0
    );

    const historial = {};
    for (const fecha of new Set([...Object.keys(recibidosPorDia), ...Object.keys(entregadosPorDia)])) {
      historial[fecha] = {
        recibidos: recibidosPorDia[fecha] || 0,
        entregados: entregadosPorDia[fecha] || 0
      };
    }

    const historialOrdenado = Object.entries(historial)
      .map(([fecha, datos]) => ({ fecha, ...datos }))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const mediaDiaria = historialOrdenado.length
      ? Math.round(historialOrdenado.reduce((sum, d) => sum + d.recibidos, 0) / historialOrdenado.length)
      : 0;

    const mediaEntregados = historialOrdenado.length
      ? Math.round(historialOrdenado.reduce((sum, d) => sum + d.entregados, 0) / historialOrdenado.length)
      : 0;

    const horaPico = calcularHoraPico(paquetes, "entregado", "fecha_entregado", fechaLocalISO);
    const horaPicoRecibido = calcularHoraPico(paquetes, "pendiente", "fecha_recibido", fechaLocalISO);
    const estantesLlenos = Object.values(baldas).filter((v) => v >= 12).length;

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
      mediaEntregados,
      recordRecibidos,
      recordEntregados,
      recordIngreso
    });
  }, [paquetes]);

  return (
    <div className="dashboard-estadisticas">
      <div className="cabecera-dashboard">
        <h2>Panel de Estadísticas</h2>
        <button className="btn-rapido" onClick={() => setMostrarModal(true)}>
          <FaPlus /> Añadir paquete rápido
        </button>
      </div>

      <div className="bloque-estadisticas">
        <GrupoEstadisticas titulo="Estado del Día" icono={<FaInbox />}>
          <TarjetaDato icono={<FaBox />} label="Recibidos hoy" valor={resumen.recibidosHoy} record={resumen.recordRecibidos} />
          <TarjetaDato icono={<FaBox />} label="Entregados hoy" valor={resumen.entregadosHoy} record={resumen.recordEntregados} />
          <TarjetaDato icono={<FaWarehouse />} label="En almacén" valor={resumen.almacenActual} />
        </GrupoEstadisticas>

        <GrupoEstadisticas titulo="Promedios" icono={<FaChartLine />}>
          <TarjetaDato icono={<FaTrophy />} label="Media recibidos" valor={resumen.mediaDiaria} />
          <TarjetaDato icono={<FaTrophy />} label="Media entregados" valor={resumen.mediaEntregados} />
          <TarjetaDato
            icono={<FaWarehouse />}
            label={<span className="tooltip" data-tooltip="Se considera lleno un estante con 12 o más paquetes pendientes">Estantes llenos</span>}
            valor={`${resumen.estantesLlenos}/25`}
          />
        </GrupoEstadisticas>

        <GrupoEstadisticas titulo="Horarios pico" icono={<FaClock />}>
          <TarjetaDato icono={<FaClock />} label="Entregas" valor={resumen.horaPico} />
          <TarjetaDato icono={<FaClock />} label="Recibidos" valor={resumen.horaPicoRecibido} />
        </GrupoEstadisticas>
      </div>

      <VolumenPaquetes />

{mostrarModal && (
  <div
    className="modal-fondo"
    onMouseDown={(e) => {
      // Solo si el mousedown es en el fondo, marcamos que puede cerrar
      if (e.target === e.currentTarget) {
        e.currentTarget.dataset.cerrar = "true";
      }
    }}
    onMouseUp={(e) => {
      // Si el mouseup también fue en el fondo y se marcó, cerramos
      if (e.target === e.currentTarget && e.currentTarget.dataset.cerrar === "true") {
        setMostrarModal(false);
      }
    }}
  >
    <div className="modal-contenido">
      <button className="cerrar-modal" onClick={() => setMostrarModal(false)}>✕</button>
      <RegistroPaquete paquetes={paquetes} actualizarPaquetes={actualizarPaquetes} />
    </div>
  </div>
)}

    </div>
  );
}

function calcularHoraPico(paquetes, estado, campo, normalizarFecha) {
  const horasPorDia = {};
  paquetes.forEach((p) => {
    if (p.estado === estado && p[campo]) {
      const fecha = normalizarFecha(p[campo]);
      const hora = new Date(p[campo]).getHours();
      if (!horasPorDia[fecha]) horasPorDia[fecha] = {};
      horasPorDia[fecha][hora] = (horasPorDia[fecha][hora] || 0) + 1;
    }
  });
  const picos = Object.values(horasPorDia).map((horas) => {
    const [horaPico] = Object.entries(horas).sort((a, b) => b[1] - a[1])[0];
    return parseInt(horaPico);
  });
  return picos.length > 0 ? `${Math.round(picos.reduce((a, b) => a + b, 0) / picos.length)}:00` : "–";
}

function GrupoEstadisticas({ titulo, icono, children }) {
  return (
    <section className="grupo-estadisticas">
      <h3 className="titulo-grupo">{icono} {titulo}</h3>
      <div className="contenedor-tarjetas">{children}</div>
    </section>
  );
}

function TarjetaDato({ icono, label, valor, record }) {
  const superaRecord = record !== undefined && valor >= record;
  return (
    <div className={`tarjeta-dato ${superaRecord ? "record" : ""}`}>
      <div className="icono">{icono}</div>
      <div className="contenido">
        <strong>{valor}</strong>
        <span>{label}</span>
        {record !== undefined && (
          <div className="subdato">
            <FaTrophy className="icono-record" /> Récord: {record}
          </div>
        )}
      </div>
    </div>
  );
}
