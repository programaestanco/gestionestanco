import React, { useState } from "react";
import "../styles/PinModal.css";

export default function PinModal({ onSuccess, onClose }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const verificarPin = () => {
    if (pin === "0000") {
      setError(false);
      onSuccess();
    } else {
      setError(true);
    }
  };

  const manejarCierreClickFondo = (e) => {
    if (e.target.classList.contains("pin-modal-overlay")) {
      onClose();
    }
  };

  return (
    <div className="pin-modal-overlay" onClick={manejarCierreClickFondo}>
      <div className="pin-modal">
        <h2>Área privada</h2>
        <p>Introduce el PIN de 4 dígitos:</p>
<input
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  autoComplete="off"
  maxLength="4"
  value={pin}
  onChange={(e) => setPin(e.target.value)}
  className={`pin-oculto ${error ? "input-error" : ""}`}
  autoFocus
/>
        {error && <p className="pin-error">PIN incorrecto</p>}
        <div className="pin-modal-buttons">
          <button onClick={verificarPin}>Acceder</button>
          <button onClick={onClose} className="btn-cancelar">Cancelar</button>
        </div>
      </div>
    </div>
  );
}
