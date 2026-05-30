import React, { useEffect, useState } from "react";
import { ticketService } from "../services/ticketService";
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
  const [actionError, setActionError] = useState("");
  const [transferTicket, setTransferTicket] = useState(null);

  useEffect(() => {
    ticketService.getMyTickets().then(setTickets).finally(() => setLoading(false));
  }, []);

  async function handleCancel(ticketId) {
    setActionError("");
    try {
      await ticketService.cancel(ticketId);
      setTickets((ts) =>
        ts.map((t) => (t.ID === ticketId ? { ...t, status: "Cancelled" } : t))
      );
    } catch (err) {
      setActionError(err.response?.data?.error || "Error al cancelar la entrada");
    }
  }

  async function handleTransferConfirm(email) {
    setActionError("");
    try {
      await ticketService.transfer(transferTicket.ID, email);
      setTickets((ts) =>
        ts.map((t) => (t.ID === transferTicket.ID ? { ...t, status: "Transferred" } : t))
      );
      setTransferTicket(null);
    } catch (err) {
      setActionError(err.response?.data?.error || "Error al transferir la entrada");
    }
  }

  return (
    <div className="container">
      <div className={styles.page}>
        <h1 className={styles.title}>Mis Entradas</h1>

        {actionError && <p className={styles.error}>{actionError}</p>}

        {loading ? (
          <p className={styles.loading}>Cargando...</p>
        ) : tickets.length === 0 ? (
          <p className={styles.empty}>No tenés entradas aún.</p>
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
                        onClick={() => handleCancel(ticket.ID)}
                      >
                        Cancelar
                      </button>
                      <button
                        className={styles.transferBtn}
                        onClick={() => setTransferTicket(ticket)}
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
