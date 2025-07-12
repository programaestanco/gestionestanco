const BASE_URL = "https://gestionestancobackend.onrender.com/api";

// Obtener todos los paquetes
export const obtenerPaquetes = async (desde = 0) => {
  const res = await fetch(`${BASE_URL}/paquetes?desde=${desde}`);
  if (!res.ok) throw new Error("Error al obtener paquetes");
  return res.json();
};

// Registrar un nuevo paquete
export const registrarPaquete = async (paquete) => {
  const res = await fetch(`${BASE_URL}/paquetes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paquete),
  });
  if (!res.ok) throw new Error("Error al registrar paquete");
  return res.json();
};

// Marcar como entregado
export const entregarPaquete = async (id) => {
  const res = await fetch(`${BASE_URL}/paquetes/entregar/${id}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Error al marcar como entregado");
  return res.json();
};

// Revertir a estado pendiente
export const marcarComoPendiente = async (id) => {
  const res = await fetch(`${BASE_URL}/paquetes/pendiente/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Error al marcar como pendiente");
  return res.json();
};

// Eliminar paquete
export const eliminarPaquete = async (id) => {
  const res = await fetch(`${BASE_URL}/paquetes/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al eliminar paquete");
  return res.json();
};

// Obtener ingresos totales
export const obtenerIngresos = async () => {
  const res = await fetch(`${BASE_URL}/paquetes/ingresos/total`);
  if (!res.ok) throw new Error("Error al obtener ingresos");
  const data = await res.json();
  return data.total;
};

// Editar paquete
export const editarPaquete = async (id, datos) => {
  const res = await fetch(`${BASE_URL}/paquetes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!res.ok) throw new Error("Error al editar paquete");
  return res.json();
};

// Obtener datos de volumen para el gráfico
export const obtenerVolumenPaquetes = async (periodo, fecha = null) => {
  const query = `periodo=${periodo}` + (fecha ? `&fecha=${fecha}` : "");
  const res = await fetch(`${BASE_URL}/stats/volumen?${query}`);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al obtener volumen: ${res.status} ${errorText}`);
  }
  return res.json();
};
// Obtener ingresos por periodo (para gráfico)
export const obtenerIngresosPorPeriodo = async (periodo, fecha = null) => {
  const query = `periodo=${periodo}` + (fecha ? `&fecha=${fecha}` : "");
  const res = await fetch(`${BASE_URL}/stats/ingresos?${query}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al obtener ingresos: ${res.status} - ${text}`);
  }
  return res.json();
};