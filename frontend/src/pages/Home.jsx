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

  function handleClear() {
    setSearch("");
    setCategory("");
  }

  const isFiltering = search || category;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1>Descubrí los mejores eventos</h1>
        <p>Comprá tus entradas de forma rápida y segura</p>
      </div>

      <div className="container">
        <form className={styles.filters} onSubmit={handleSearch} role="search">
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Buscar por nombre de evento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar eventos"
          />
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filtrar por categoría"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c || "Todas las categorías"}</option>
            ))}
          </select>
          <button className={styles.searchBtn} type="submit">Buscar</button>
          {isFiltering && (
            <button type="button" className={styles.clearBtn} onClick={handleClear} title="Limpiar filtros">
              ✕ Limpiar
            </button>
          )}
        </form>

        {loading && (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} aria-label="Cargando eventos" />
            <p>Cargando eventos...</p>
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyIcon}>🔍</p>
            <p className={styles.emptyText}>
              {isFiltering
                ? "No se encontraron eventos con esos filtros."
                : "No hay eventos disponibles por el momento."}
            </p>
            {isFiltering && (
              <button type="button" className={styles.clearBtn} onClick={handleClear}>
                Ver todos los eventos
              </button>
            )}
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className={styles.grid}>
            {events.map((event) => (
              <Link to={`/events/${event.ID}`} key={event.ID} className={styles.card}>
                <div
                  className={styles.cardImage}
                  style={{
                    backgroundImage: event.image_url
                      ? `url(${event.image_url})`
                      : "linear-gradient(135deg, #1E293B, #2563EB)",
                  }}
                >
                  <span className={styles.category}>{event.category || "General"}</span>
                  {event.available_spots === 0 && (
                    <span className={styles.soldOutBadge}>Agotado</span>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{event.title}</h3>
                  <p className={styles.cardDate}>{formatDate(event.event_date)} · {event.event_time?.slice(0, 5)} hs</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.price}>{formatPrice(event.price)}</span>
                    <span className={event.available_spots > 0 ? styles.spots : styles.spotsOut}>
                      {event.available_spots > 0 ? `${event.available_spots} lugares` : "Sin lugares"}
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
