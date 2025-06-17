// src/context/UserProvider.jsx
import React, { useState } from "react";
import { UserContext } from "./UserContext";

export const UserProvider = ({ children }) => {
  const [autenticado, setAutenticado] = useState(() => {
    return localStorage.getItem("logeado") === "true";
  });

  const login = (usuario, clave) => {
    const u = import.meta.env.VITE_USUARIO;
    const c = import.meta.env.VITE_CLAVE;
    if (usuario === u && clave === c) {
      localStorage.setItem("logeado", "true");
      setAutenticado(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("logeado");
    setAutenticado(false);
  };

  return (
    <UserContext.Provider value={{ autenticado, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
