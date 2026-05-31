import React, { useState, useEffect, useRef } from "react";
import { adminService } from "../services/adminService";
import styles from "./EventFormModal.module.css";

const CATEGORIES = ["Música", "Deportes", "Teatro", "Arte", "Tecnología", "Otro"];
const DESC_MAX = 500;
const TODAY = new Date().toISOString().split("T")[0];

const EMPTY = {
  title: "", description: "", category: "", event_date: "",
  event_time: "", duration: "", capacity: "", image_url: "", price: "",
};

export default function EventFormModal({ event, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Nielsen 3 / Shneiderman 2 — Escape cierra el modal
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

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

  function validateField(name, value) {
    if (name === "title" && !value.trim()) return "El título es obligatorio";
    if (name === "event_date" && !value) return "La fecha es obligatoria";
    if (name === "event_time" && !value) return "El horario es obligatorio";
    if (name === "capacity" && (!value || Number(value) < 1)) return "Capacidad mínima: 1";
    if (name === "price" && value !== "" && Number(value) < 0) return "El precio no puede ser negativo";
    return "";
  }

  function validate() {
    const fields = ["title", "event_date", "event_time", "capacity", "price"];
    const e = {};
    fields.forEach((f) => {
      const msg = validateField(f, form[f]);
      if (msg) e[f] = msg;
    });
    setErrors(e);
    setTouched(Object.fromEntries(fields.map((f) => [f, true])));
    return Object.keys(e).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "description" && value.length > DESC_MAX) return;
    setForm((f) => ({ ...f, [name]: value }));
    if (touched[name]) {
      const msg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: msg || undefined }));
    }
  }

  // Nielsen 5 / Shneiderman 5 — validación en blur (al salir del campo)
  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    const msg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: msg || undefined }));
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await adminService.uploadImage(file);
      setForm((f) => ({ ...f, image_url: url }));
    } catch {
      // fallback: usuario puede escribir URL manualmente
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
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label={event ? "Editar evento" : "Nuevo evento"}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{event ? "Editar evento" : "Nuevo evento"}</h3>
        <p className={styles.hint}>Los campos marcados con * son obligatorios. Presioná Escape para cerrar.</p>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="title">Título *</label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej: Rock en el Parque 2026"
                aria-describedby={errors.title ? "title-err" : undefined}
              />
              {errors.title && <span id="title-err" className={styles.err} role="alert">{errors.title}</span>}
            </div>
            <div className={styles.field}>
              <label htmlFor="category">Categoría</label>
              <select id="category" name="category" value={form.category} onChange={handleChange}>
                <option value="">Sin categoría</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="description">
              Descripción
              <span className={styles.charCount}>{form.description.length}/{DESC_MAX}</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describí el evento brevemente..."
              maxLength={DESC_MAX}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="event_date">Fecha *</label>
              <input
                id="event_date"
                type="date"
                name="event_date"
                value={form.event_date}
                onChange={handleChange}
                onBlur={handleBlur}
                min={TODAY}
                aria-describedby={errors.event_date ? "date-err" : undefined}
              />
              {errors.event_date && <span id="date-err" className={styles.err} role="alert">{errors.event_date}</span>}
            </div>
            <div className={styles.field}>
              <label htmlFor="event_time">Horario *</label>
              <input
                id="event_time"
                type="time"
                name="event_time"
                value={form.event_time}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-describedby={errors.event_time ? "time-err" : undefined}
              />
              {errors.event_time && <span id="time-err" className={styles.err} role="alert">{errors.event_time}</span>}
            </div>
            <div className={styles.field}>
              <label htmlFor="duration">Duración (min)</label>
              <input
                id="duration"
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                min="0"
                placeholder="Ej: 120"
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="capacity">Capacidad *</label>
              <input
                id="capacity"
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                onBlur={handleBlur}
                min="1"
                placeholder="Ej: 500"
                aria-describedby={errors.capacity ? "cap-err" : undefined}
              />
              {errors.capacity && <span id="cap-err" className={styles.err} role="alert">{errors.capacity}</span>}
            </div>
            <div className={styles.field}>
              <label htmlFor="price">Precio ($)</label>
              <input
                id="price"
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                onBlur={handleBlur}
                min="0"
                step="0.01"
                placeholder="0 = Gratis"
                aria-describedby={errors.price ? "price-err" : undefined}
              />
              {errors.price && <span id="price-err" className={styles.err} role="alert">{errors.price}</span>}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="image_url">Imagen</label>
            <div className={styles.imageRow}>
              <input
                id="image_url"
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://... o elegí un archivo local"
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
                title="Elegir imagen desde tus archivos"
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
