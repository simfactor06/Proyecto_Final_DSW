import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ticketService } from "../services/ticketService";
import { useToast } from "../context/ToastContext";
import { formatDate, formatPrice } from "../utils/format";
import TransferModal from "../components/TransferModal";
import styles from "./Profile.module.css";

const STATUS_LABELS = {
  Active: "Activa",
  Cancelled: "Cancelada",
  Transferred: "Transferida",
};

export default function Profile() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferTicket, setTransferTicket] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    ticketService.getMyTickets().then(setTickets).finally(() => setLoading(false));
  }, []);

  async function handleCancel(ticketId, eventTitle) {
    // Nielsen 5 / Shneiderman 5 — confirmar antes de acción irreversible
    if (!window.confirm(`¿Cancelar la entrada para "${eventTitle}"? Esta acción no se puede deshacer.`)) return;
    try {
      await ticketService.cancel(ticketId);
      setTickets((ts) => ts.filter((t) => t.ID !== ticketId));
      addToast("Entrada cancelada correctamente.", "info");
    } catch (err) {
      addToast(err.response?.data?.error || "Error al cancelar la entrada.", "error");
    }
  }

  async function handleTransferConfirm(dni) {
    try {
      await ticketService.transfer(transferTicket.ID, dni);
      setTickets((ts) =>
        ts.map((t) => (t.ID === transferTicket.ID ? { ...t, status: "Transferred" } : t))
      );
      setTransferTicket(null);
      addToast("Entrada transferida correctamente.", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Error al transferir. Verificá que el DNI esté registrado.", "error");
      throw err;
    }
  }

  return (
    <div className="container">
      <div className={styles.page}>
        <h1 className={styles.title}>Mis Entradas</h1>

        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} role="status" aria-label="Cargando entradas" />
            <p>Cargando tus entradas...</p>
          </div>
        ) : tickets.length === 0 ? (
          // Nielsen 6 / Shneiderman 8 — estado vacío informativo
          <div className={styles.empty}>
            <p className={styles.emptyIcon}>🎟</p>
            <p className={styles.emptyText}>No tenés entradas aún.</p>
            <p className={styles.emptyHint}>
              Explorá los <Link to="/" className={styles.emptyLink}>eventos disponibles</Link> y comprá tu primera entrada.
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {tickets.map((ticket) => (
              <div key={ticket.ID} className={styles.card}>
                <div className={styles.cardLeft}>
                  <h3 className={styles.eventTitle}>{ticket.event?.title || "Evento"}</h3>
                  <p className={styles.detail}>
                    {formatDate(ticket.event?.event_date)} · {ticket.event?.event_time?.slice(0, 5)} hs
                  </p>
                  <p className={styles.detail}>
                    Precio: {formatPrice(ticket.event?.price)}
                  </p>
                  <p className={styles.purchaseDate}>
                    Comprada el {new Date(ticket.purchase_date || ticket.CreatedAt).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <div className={styles.cardRight}>
                  <span className={`${styles.badge} ${styles[`badge${ticket.status}`]}`}>
                    {STATUS_LABELS[ticket.status] || ticket.status}
                  </span>
                  {ticket.status === "Active" && (
                    <div className={styles.actions}>
                      <button
                        className={styles.cancelBtn}
                        onClick={() => handleCancel(ticket.ID, ticket.event?.title)}
                        title="Cancelar esta entrada (acción irreversible)"
                      >
                        Cancelar
                      </button>
                      <button
                        className={styles.transferBtn}
                        onClick={() => setTransferTicket(ticket)}
                        title="Transferir esta entrada a otro usuario"
                      >
                        Transferir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {transferTicket && (
          <TransferModal
            ticket={transferTicket}
            onConfirm={handleTransferConfirm}
            onClose={() => setTransferTicket(null)}
          />
        )}
      </div>
    </div>
  );
}
