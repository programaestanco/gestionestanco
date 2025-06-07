const BASE_URL = "https://gestionestancobackend.onrender.com/api";

// Obtener todos los paquetes
export const obtenerPaquetes = async () => {
  const res = await fetch(`${BASE_URL}/paquetes`);
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
    method: "POST",
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
