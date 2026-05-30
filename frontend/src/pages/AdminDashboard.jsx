import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../services/adminService";
import { eventService } from "../services/eventService";
import { formatDate, formatPrice } from "../utils/format";
import EventFormModal from "../components/EventFormModal";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const data = await eventService.getAll({});
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(formData) {
    setError("");
    try {
      if (editEvent) {
        await adminService.updateEvent(editEvent.ID, formData);
      } else {
        await adminService.createEvent(formData);
      }
      setShowModal(false);
      setEditEvent(null);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
      throw err;
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return;
    setError("");
    try {
      await adminService.deleteEvent(id);
      setEvents((es) => es.filter((e) => e.ID !== id));
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar");
    }
  }

  function openCreate() {
    setEditEvent(null);
    setShowModal(true);
  }

  function openEdit(event) {
    setEditEvent(event);
    setShowModal(true);
  }

  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Panel de Administración</h1>
          <button className={styles.createBtn} onClick={openCreate}>+ Nuevo evento</button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <p className={styles.loading}>Cargando eventos...</p>
        ) : events.length === 0 ? (
          <p className={styles.empty}>No hay eventos creados.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Fecha</th>
                  <th>Precio</th>
                  <th>Capacidad</th>
                  <th>Disponibles</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.ID}>
                    <td className={styles.titleCell}>{event.title}</td>
                    <td>{event.category || "-"}</td>
                    <td>{formatDate(event.event_date)}</td>
                    <td>{formatPrice(event.price)}</td>
                    <td>{event.capacity}</td>
                    <td>
                      <span className={event.available_spots === 0 ? styles.soldOut : ""}>
                        {event.available_spots}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link to={`/admin/events/${event.ID}/report`} className={styles.reportBtn}>
                          Reporte
                        </Link>
                        <button className={styles.editBtn} onClick={() => openEdit(event)}>
                          Editar
                        </button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(event.ID)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <EventFormModal
            event={editEvent}
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditEvent(null); }}
          />
        )}
      </div>
    </div>
  );
}
