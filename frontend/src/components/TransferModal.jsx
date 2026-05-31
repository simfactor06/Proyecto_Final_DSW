import React, { useState, useEffect } from "react";
import styles from "./TransferModal.module.css";

export default function TransferModal({ ticket, onConfirm, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Nielsen 3 / Shneiderman 2 — Escape cierra el modal
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setError("");
    setLoading(true);
    try {
      await onConfirm(email);
    } catch {
      setError("No se encontró un usuario con ese email. Verificá que esté registrado.");
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
        <p className={styles.hint}>Ingresá el email de la persona que recibirá la entrada. Esta acción no se puede deshacer.</p>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="transfer-email">Email del destinatario</label>
          <input
            id="transfer-email"
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@email.com"
            required
            autoFocus
          />
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.confirmBtn} disabled={loading || !email}>
              {loading ? "Transfiriendo..." : "Confirmar transferencia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
