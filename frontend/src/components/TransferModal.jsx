import React, { useState, useEffect } from "react";
import styles from "./TransferModal.module.css";

export default function TransferModal({ ticket, onConfirm, onClose }) {
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!dni.trim()) return;
    setError("");
    setLoading(true);
    try {
      await onConfirm(dni.trim());
    } catch {
      setError("No se encontró un usuario con ese DNI. Verificá que esté registrado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h3 className={styles.title}>Transferir entrada</h3>
        <p className={styles.subtitle}>
          Evento: <strong>{ticket.event?.title}</strong>
        </p>
        <p className={styles.hint}>Ingresá el DNI de quien va a recibir la entrada. Esta acción no se puede deshacer.</p>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="transfer-dni">DNI del destinatario</label>
          <input
            id="transfer-dni"
            className={styles.input}
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="Ej: 40123456"
            required
            autoFocus
          />
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.confirmBtn} disabled={loading || !dni.trim()}>
              {loading ? "Transfiriendo..." : "Confirmar transferencia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
