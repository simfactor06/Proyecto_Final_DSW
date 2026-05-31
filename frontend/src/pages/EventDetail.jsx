import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { eventService } from "../services/eventService";
import { ticketService } from "../services/ticketService";
import { formatDate, formatPrice } from "../utils/format";
import styles from "./EventDetail.module.css";

export default function EventDetail() {
  const { id } = useParams();
  const { isAuthenticated, isAdmin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    eventService.getById(id).then(setEvent).catch(() => navigate("/")).finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleBuy() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setBuying(true);
    try {
      await ticketService.purchase(event.ID);
      setSuccess(true);
      setEvent((e) => ({ ...e, available_spots: e.available_spots - 1 }));
      addToast("¡Entrada comprada con éxito! Revisá tus entradas en el perfil.", "success");
    } catch (err) {
      const msg = err.response?.data?.error || "Error al comprar la entrada";
      addToast(msg, "error");
    } finally {
      setBuying(false);
    }
  }

  if (loading) return <p className={styles.loading}>Cargando evento...</p>;
  if (!event) return null;

  return (
    <div className="container">
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} title="Volver a la lista de eventos">
          ← Volver
        </button>

        <div
          className={styles.banner}
          style={{
            backgroundImage: event.image_url
              ? `url(${event.image_url})`
              : "linear-gradient(135deg, #1E293B, #2563EB)",
          }}
        />
        <div className={styles.content}>
          <div className={styles.main}>
            <span className={styles.category}>{event.category || "General"}</span>
            <h1 className={styles.title}>{event.title}</h1>
            <div className={styles.meta}>
              <span>{formatDate(event.event_date)}</span>
              <span>{event.event_time?.slice(0, 5)} hs</span>
              {event.duration > 0 && <span>{event.duration} min</span>}
            </div>
            <p className={styles.description}>{event.description}</p>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.priceBox}>
              <p className={styles.price}>{formatPrice(event.price)}</p>
              <p className={styles.spots}>
                {event.available_spots > 0
                  ? `${event.available_spots} lugares disponibles`
                  : "Entradas agotadas"}
              </p>

              {isAdmin && (
                <p className={styles.adminNote}>Los administradores no pueden comprar entradas.</p>
              )}
              {!isAdmin && success && (
                <div className={styles.success}>¡Compra exitosa! Tu entrada fue generada.</div>
              )}
              {!isAdmin && !success && (
                <button
                  className={styles.buyBtn}
                  onClick={handleBuy}
                  disabled={buying || event.available_spots <= 0}
                  title={event.available_spots <= 0 ? "No quedan lugares disponibles" : "Comprar esta entrada"}
                >
                  {buying ? "Procesando..." : "Comprar entrada"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
