import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import styles from "./Auth.module.css";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", dni: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (!form.dni.trim()) {
      setError("El DNI es requerido");
      return;
    }
    setLoading(true);
    try {
      const data = await authService.register(form);
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Crear cuenta</h2>
        {error && <p className={styles.error}>{error}</p>}

        <label className={styles.label} htmlFor="name">Nombre</label>
        <input
          id="name"
          className={styles.input}
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Tu nombre completo"
          required
        />

        <label className={styles.label} htmlFor="dni">DNI</label>
        <input
          id="dni"
          className={styles.input}
          type="text"
          name="dni"
          value={form.dni}
          onChange={handleChange}
          placeholder="Ej: 40123456"
          required
        />

        <label className={styles.label} htmlFor="email">Email</label>
        <input
          id="email"
          className={styles.input}
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="tu@email.com"
          required
        />

        <label className={styles.label} htmlFor="password">Contraseña</label>
        <input
          id="password"
          className={styles.input}
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Mínimo 6 caracteres"
          required
        />

        <button className={styles.btn} type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>
        <p className={styles.footer}>
          ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
        </p>
      </form>
    </div>
  );
}
