import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { eventService } from "../services/eventService";
import { ticketService } from "../services/ticketService";
import { formatDate, formatPrice } from "../utils/format";
import styles from "./EventDetail.module.css";

export default function EventDetail() {
  const { id } = useParams();
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    eventService.getById(id).then(setEvent).catch(() => navigate("/")).finally(() => setLoading(false));
  }, [id]);

  async function handleBuy() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setBuying(true);
    setError("");
    try {
      await ticketService.purchase(event.ID);
      setSuccess(true);
      setEvent((e) => ({ ...e, available_spots: e.available_spots - 1 }));
    } catch (err) {
      setError(err.response?.data?.error || "Error al comprar la entrada");
    } finally {
      setBuying(false);
    }
  }

  if (loading) return <p className={styles.loading}>Cargando...</p>;
  if (!event) return null;

  return (
    <div className="container">
      <div className={styles.page}>
        <div
          className={styles.banner}
          style={{
            backgroundImage: event.image_url
              ? `url(${event.image_url})`
              : "linear-gradient(135deg, #1a1a2e, #e94560)",
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
                <>
                  {error && <p className={styles.error}>{error}</p>}
                  <button
                    className={styles.buyBtn}
                    onClick={handleBuy}
                    disabled={buying || event.available_spots <= 0}
                  >
                    {buying ? "Procesando..." : "Comprar entrada"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
