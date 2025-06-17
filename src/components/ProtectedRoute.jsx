import { Navigate } from "react-router-dom";
import { useUser } from "../context/useUser";

export default function ProtectedRoute({ children }) {
  const { autenticado } = useUser();
  return autenticado ? children : <Navigate to="/login" />;
}
