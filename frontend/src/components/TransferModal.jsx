import React, { useState } from "react";
import styles from "./TransferModal.module.css";

export default function TransferModal({ ticket, onConfirm, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email) return;
    setLoading(true);
    try {
      await onConfirm(email);
    } catch {
      setError("Error al transferir");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>Transferir entrada</h3>
        <p className={styles.subtitle}>
          Evento: <strong>{ticket.event?.title}</strong>
        </p>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label className={styles.label}>Email del destinatario</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@email.com"
            required
          />
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.confirmBtn} disabled={loading}>
              {loading ? "Transfiriendo..." : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
