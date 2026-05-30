import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventService } from "../services/eventService";
import { formatDate, formatPrice } from "../utils/format";
import styles from "./Home.module.css";

const CATEGORIES = ["", "Música", "Deportes", "Teatro", "Arte", "Tecnología", "Otro"];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetchEvents();
  }, [category]);

  async function fetchEvents() {
    setLoading(true);
    try {
      const data = await eventService.getAll({ category, search });
      setEvents(data);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchEvents();
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1>Descubrí los mejores eventos</h1>
        <p>Comprá tus entradas de forma rápida y segura</p>
      </div>

      <div className="container">
        <form className={styles.filters} onSubmit={handleSearch}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar evento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c || "Todas las categorías"}</option>
            ))}
          </select>
          <button className={styles.searchBtn} type="submit">Buscar</button>
        </form>

        {loading ? (
          <p className={styles.loading}>Cargando eventos...</p>
        ) : events.length === 0 ? (
          <p className={styles.empty}>No se encontraron eventos.</p>
        ) : (
          <div className={styles.grid}>
            {events.map((event) => (
              <Link to={`/events/${event.ID}`} key={event.ID} className={styles.card}>
                <div
                  className={styles.cardImage}
                  style={{
                    backgroundImage: event.image_url
                      ? `url(${event.image_url})`
                      : "linear-gradient(135deg, #1a1a2e, #e94560)",
                  }}
                >
                  <span className={styles.category}>{event.category || "General"}</span>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{event.title}</h3>
                  <p className={styles.cardDate}>{formatDate(event.event_date)} · {event.event_time?.slice(0, 5)}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.price}>{formatPrice(event.price)}</span>
                    <span className={styles.spots}>
                      {event.available_spots > 0
                        ? `${event.available_spots} lugares`
                        : "Agotado"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
