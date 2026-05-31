import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../services/adminService";
import { eventService } from "../services/eventService";
import { useToast } from "../context/ToastContext";
import { formatDate, formatPrice } from "../utils/format";
import EventFormModal from "../components/EventFormModal";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const data = await eventService.getAll({});
      setEvents(data);
    } catch {
      addToast("No se pudieron cargar los eventos.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(formData) {
    try {
      if (editEvent) {
        await adminService.updateEvent(editEvent.ID, formData);
        // Shneiderman 3 / Nielsen 1 — feedback de éxito
        addToast(`Evento "${formData.title}" actualizado correctamente.`, "success");
      } else {
        await adminService.createEvent(formData);
        addToast(`Evento "${formData.title}" creado correctamente.`, "success");
      }
      setShowModal(false);
      setEditEvent(null);
      fetchEvents();
    } catch (err) {
      const msg = err.response?.data?.error || "Error al guardar el evento";
      addToast(msg, "error");
      throw err;
    }
  }

  async function handleDelete(id, title) {
    // Nielsen 5 / Shneiderman 5 — confirmar antes de eliminar
    if (!window.confirm(`¿Eliminar el evento "${title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await adminService.deleteEvent(id);
      setEvents((es) => es.filter((e) => e.ID !== id));
      addToast(`Evento "${title}" eliminado.`, "info");
    } catch (err) {
      addToast(err.response?.data?.error || "Error al eliminar el evento.", "error");
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
          <button className={styles.createBtn} onClick={openCreate} title="Crear un nuevo evento">
            + Nuevo evento
          </button>
        </div>

        {loading && (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} aria-label="Cargando eventos" />
            <p>Cargando eventos...</p>
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyIcon}>📅</p>
            <p className={styles.emptyText}>No hay eventos creados todavía.</p>
            <button className={styles.createBtn} onClick={openCreate}>Crear el primer evento</button>
          </div>
        )}

        {!loading && events.length > 0 && (
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
                        <Link
                          to={`/admin/events/${event.ID}/report`}
                          className={styles.reportBtn}
                          title="Ver reporte de ventas"
                        >
                          Reporte
                        </Link>
                        <button
                          className={styles.editBtn}
                          onClick={() => openEdit(event)}
                          title="Editar este evento"
                        >
                          Editar
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(event.ID, event.title)}
                          title="Eliminar este evento permanentemente"
                        >
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
