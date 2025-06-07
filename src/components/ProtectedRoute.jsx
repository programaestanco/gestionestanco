import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function ProtectedRoute({ children }) {
  const { autenticado } = useUser();
  return autenticado ? children : <Navigate to="/login" />;
}
