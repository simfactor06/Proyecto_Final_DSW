import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventService } from "../services/eventService";
import { formatDate, formatPrice } from "../utils/format";
import styles from "./Home.module.css";

// Nielsen 6 / Shneiderman 8 â€” reconocimiento: las categorÃ­as coinciden con las del formulario admin
const CATEGORIES = ["", "MÃºsica", "Deportes", "Teatro", "Arte", "TecnologÃ­a", "Otro"];

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
        <h1>DescubrÃ­ los mejores eventos</h1>
        <p>ComprÃ¡ tus entradas de forma rÃ¡pida y segura</p>
      </div>

      <div className="container">
        {/* Nielsen 7 / Shneiderman 8 â€” bÃºsqueda eficiente con filtros claros */}
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
            aria-label="Filtrar por categorÃ­a"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c || "Todas las categorÃ­as"}</option>
            ))}
          </select>
          <button className={styles.searchBtn} type="submit">Buscar</button>
          {isFiltering && (
            <button type="button" className={styles.clearBtn} onClick={handleClear} title="Limpiar filtros">
              âœ• Limpiar
            </button>
          )}
        </form>

        {/* Nielsen 1 â€” visibilidad del estado del sistema */}
        {loading && (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} aria-label="Cargando eventos" />
            <p>Cargando eventos...</p>
          </div>
        )}

        {/* Nielsen 9 â€” estado vacÃ­o con guÃ­a de recuperaciÃ³n */}
        {!loading && events.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyIcon}>ðŸ”</p>
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
                  <p className={styles.cardDate}>{formatDate(event.event_date)} Â· {event.event_time?.slice(0, 5)} hs</p>
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
