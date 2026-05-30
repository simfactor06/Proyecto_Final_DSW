import React, { useState, useEffect, useRef } from "react";
import { adminService } from "../services/adminService";
import styles from "./EventFormModal.module.css";

const CATEGORIES = ["Música", "Deportes", "Teatro", "Arte", "Tecnología", "Otro"];

const EMPTY = {
  title: "", description: "", category: "", event_date: "",
  event_time: "", duration: "", capacity: "", image_url: "", price: "",
};

export default function EventFormModal({ event, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || "",
        description: event.description || "",
        category: event.category || "",
        event_date: event.event_date?.split("T")[0] || "",
        event_time: event.event_time?.slice(0, 5) || "",
        duration: event.duration || "",
        capacity: event.capacity || "",
        image_url: event.image_url || "",
        price: event.price || "",
      });
    }
  }, [event]);

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "El título es obligatorio";
    if (!form.event_date) e.event_date = "La fecha es obligatoria";
    if (!form.event_time) e.event_time = "El horario es obligatorio";
    if (!form.capacity || Number(form.capacity) < 1) e.capacity = "Capacidad mínima: 1";
    if (form.price !== "" && Number(form.price) < 0) e.price = "El precio no puede ser negativo";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await adminService.uploadImage(file);
      setForm((f) => ({ ...f, image_url: url }));
    } catch {
      // user can type URL manually as fallback
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({
        ...form,
        duration: form.duration ? Number(form.duration) : 0,
        capacity: Number(form.capacity),
        price: form.price !== "" ? Number(form.price) : 0,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{event ? "Editar evento" : "Nuevo evento"}</h3>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Título *</label>
              <input name="title" value={form.title} onChange={handleChange} />
              {errors.title && <span className={styles.err}>{errors.title}</span>}
            </div>
            <div className={styles.field}>
              <label>Categoría</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="">Sin categoría</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label>Descripción</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Fecha *</label>
              <input type="date" name="event_date" value={form.event_date} onChange={handleChange} min={new Date().toISOString().split("T")[0]} />
              {errors.event_date && <span className={styles.err}>{errors.event_date}</span>}
            </div>
            <div className={styles.field}>
              <label>Horario *</label>
              <input type="time" name="event_time" value={form.event_time} onChange={handleChange} />
              {errors.event_time && <span className={styles.err}>{errors.event_time}</span>}
            </div>
            <div className={styles.field}>
              <label>Duración (min)</label>
              <input type="number" name="duration" value={form.duration} onChange={handleChange} min="0" />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Capacidad *</label>
              <input type="number" name="capacity" value={form.capacity} onChange={handleChange} min="1" />
              {errors.capacity && <span className={styles.err}>{errors.capacity}</span>}
            </div>
            <div className={styles.field}>
              <label>Precio ($)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.01" />
              {errors.price && <span className={styles.err}>{errors.price}</span>}
            </div>
          </div>

          <div className={styles.field}>
            <label>Imagen</label>
            <div className={styles.imageRow}>
              <input
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://... o elegí un archivo"
                className={styles.imageInput}
              />
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              <button
                type="button"
                className={styles.uploadBtn}
                onClick={() => fileInputRef.current.click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? "Subiendo..." : "Elegir archivo"}
              </button>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.saveBtn} disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
