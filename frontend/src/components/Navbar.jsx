import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <Link to="/">Ticketek</Link>
      </div>
      <div className={styles.links}>
        <Link to="/">Eventos</Link>
        {!isAdmin && (
          <Link to="/profile">Mis Entradas</Link>
        )}
        {isAdmin && <Link to="/admin">Panel Admin</Link>}
        {isAuthenticated ? (
          <div className={styles.userMenu}>
            <span className={styles.userName}>{user?.name}</span>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" className={styles.loginBtn}>Iniciar sesión</Link>
            <Link to="/register" className={styles.registerBtn}>Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}
