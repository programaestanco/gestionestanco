import React, { useState } from "react";
import {
  eliminarPaquete,
  entregarPaquete,
  marcarComoPendiente,
  editarPaquete,
} from "../services/paquetesService";
import "../styles/listaPaquetes.css";

const PAQUETES_POR_PAGINA = 10;

export default function ListaPaquetes({ paquetes, actualizarPaquetes }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroCompania, setFiltroCompania] = useState("");
  const [filtroBalda, setFiltroBalda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("pendiente");
  const [paginaActual, setPaginaActual] = useState(1);
  const [toastMensaje, setToastMensaje] = useState("");
  const [paqueteAEliminar, setPaqueteAEliminar] = useState(null);
  const [paqueteAEditar, setPaqueteAEditar] = useState(null);
  const [formularioEdicion, setFormularioEdicion] = useState({
    cliente: "",
    compania: "",
    compartimento: "",
  });

  const filtrados = paquetes
    .filter((p) => {
      const coincideBusqueda =
        !busqueda || p.cliente.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCompania =
        !filtroCompania || p.compania === filtroCompania;
      const coincideBalda = !filtroBalda || p.compartimento === filtroBalda;
      const coincideEstado =
        filtroEstado === "todos" || p.estado === filtroEstado;
      return coincideBusqueda && coincideCompania && coincideBalda && coincideEstado;
    })
    .sort((a, b) => new Date(b.fecha_recibido) - new Date(a.fecha_recibido));

  const totalPaginas = Math.ceil(filtrados.length / PAQUETES_POR_PAGINA);
  const inicio = (paginaActual - 1) * PAQUETES_POR_PAGINA;
  const paginados = filtrados.slice(inicio, inicio + PAQUETES_POR_PAGINA);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const mostrarToast = (mensaje) => {
    setToastMensaje(mensaje);
    setTimeout(() => setToastMensaje(""), 3000);
  };

  const confirmarEliminar = async () => {
    if (!paqueteAEliminar) return;
    await eliminarPaquete(paqueteAEliminar.id);
    setPaqueteAEliminar(null);
    actualizarPaquetes();
    mostrarToast("¡Paquete eliminado correctamente!");
  };

  const cancelarEliminar = () => {
    setPaqueteAEliminar(null);
  };

  const handleEliminar = (paquete) => {
    setPaqueteAEliminar(paquete);
  };

  const handleEntregar = async (id) => {
    await entregarPaquete(id);
    actualizarPaquetes();
    mostrarToast("¡Paquete marcado como entregado!");
  };

  const handleRevertir = async (id) => {
    await marcarComoPendiente(id);
    actualizarPaquetes();
    mostrarToast("¡Estado revertido a pendiente!");
  };

  const handleEditar = (paquete) => {
    setPaqueteAEditar(paquete);
    setFormularioEdicion({
      cliente: paquete.cliente,
      compania: paquete.compania,
      compartimento: paquete.compartimento,
    });
  };

  const guardarEdicion = async () => {
    await editarPaquete(paqueteAEditar.id, formularioEdicion);
    setPaqueteAEditar(null);
    actualizarPaquetes();
    mostrarToast("¡Paquete actualizado!");
  };

  return (
    <div className="lista-paquetes">
      <h2>
        <i className="fas fa-boxes-stacked"></i> Lista de Paquetes
      </h2>

      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPaginaActual(1);
          }}
        />
        <select
          value={filtroCompania}
          onChange={(e) => {
            setFiltroCompania(e.target.value);
            setPaginaActual(1);
          }}
        >
          <option value="">Todas las compañías</option>
          {[...new Set(paquetes.map((p) => p.compania))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={filtroBalda}
          onChange={(e) => {
            setFiltroBalda(e.target.value);
            setPaginaActual(1);
          }}
        >
          <option value="">Todas las baldas</option>
          {[...new Set(paquetes.map((p) => p.compartimento))].map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => {
            setFiltroEstado(e.target.value);
            setPaginaActual(1);
          }}
        >
          <option value="pendiente">Pendientes</option>
          <option value="entregado">Entregados</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      {paginados.length === 0 ? (
        <p className="sin-paquetes">No hay paquetes que coincidan.</p>
      ) : (
        <>
          <table className="tabla-paquetes">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Compañía</th>
                <th>Balda</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginados.map((p) => (
                <tr
                  key={p.id}
                  className={
                    p.estado === "entregado"
                      ? "estado-entregado fila-hover"
                      : "estado-pendiente fila-hover"
                  }
                >
                  <td data-label="Cliente">{p.cliente}</td>
                  <td data-label="Compañía">{p.compania}</td>
                  <td data-label="Balda">{p.compartimento}</td>
                  <td data-label="Fecha">
                    {new Date(p.fecha_recibido).toLocaleDateString()}
                  </td>
                  <td data-label="Estado">
                    {p.estado === "entregado"
                      ? `Entregado (${p.precio} €)`
                      : "Pendiente"}
                  </td>
                  <td data-label="Acciones">
                    {p.estado === "pendiente" ? (
                      <button
                        className="btn btn-entregar"
                        onClick={() => handleEntregar(p.id)}
                      >
                        <i className="fas fa-check"></i>
                      </button>
                    ) : (
                      <button
                        className="btn btn-revertir"
                        onClick={() => handleRevertir(p.id)}
                      >
                        <i className="fas fa-undo-alt"></i>
                      </button>
                    )}
                    <button
                      className="btn btn-editar"
                      onClick={() => handleEditar(p)}
                    >
                      <i className="fas fa-pen"></i>
                    </button>
                    <button
                      className="btn btn-eliminar"
                      onClick={() => handleEliminar(p)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="paginacion">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
            >
              ◀ Anterior
            </button>
            <span>
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente ▶
            </button>
          </div>
        </>
      )}

      {toastMensaje && (
        <div className="modal-exito">
          <div className="modal-contenido">
            <i className="fas fa-check-circle"></i> {toastMensaje}
          </div>
        </div>
      )}

      {paqueteAEliminar && (
        <div className="modal-confirmacion">
          <div className="modal-overlay" onClick={cancelarEliminar}></div>
          <div className="modal-contenido elegante">
            <div className="modal-icono">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="texto-confirmacion">
              <h3>¿Eliminar paquete?</h3>
              <p>
                Esta acción eliminará el paquete de{" "}
                <strong>{paqueteAEliminar.cliente}</strong>.
              </p>
              <div className="acciones">
                <button className="btn cancelar" onClick={cancelarEliminar}>
                  Cancelar
                </button>
                <button className="btn confirmar" onClick={confirmarEliminar}>
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {paqueteAEditar && (
        <div className="modal-confirmacion">
          <div
            className="modal-overlay"
            onClick={() => setPaqueteAEditar(null)}
          ></div>
          <div className="modal-contenido elegante">
            <div className="texto-confirmacion">
              <h3>Editar paquete</h3>
              <label>
                Cliente:
                <input
                  type="text"
                  value={formularioEdicion.cliente}
                  onChange={(e) =>
                    setFormularioEdicion({
                      ...formularioEdicion,
                      cliente: e.target.value,
                    })
                  }
                />
              </label>
              <label>
  Compañía:
  <select
    value={formularioEdicion.compania}
    onChange={(e) =>
      setFormularioEdicion({
        ...formularioEdicion,
        compania: e.target.value,
      })
    }
  >
    {[...new Set(paquetes.map((p) => p.compania))].map((c) => (
      <option key={c} value={c}>{c}</option>
    ))}
  </select>
</label>

<label>
  Balda:
  <select
    value={formularioEdicion.compartimento}
    onChange={(e) =>
      setFormularioEdicion({
        ...formularioEdicion,
        compartimento: e.target.value,
      })
    }
  >
    {[...new Set(paquetes.map((p) => p.compartimento))].map((b) => (
      <option key={b} value={b}>{b}</option>
    ))}
  </select>
</label>

              <div className="acciones">
                <button
                  className="btn cancelar"
                  onClick={() => setPaqueteAEditar(null)}
                >
                  Cancelar
                </button>
                <button className="btn confirmar" onClick={guardarEdicion}>
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
