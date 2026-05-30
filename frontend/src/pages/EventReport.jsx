import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { adminService } from "../services/adminService";
import styles from "./EventReport.module.css";

const COLORS = ["#e94560", "#e3f2fd"];

export default function EventReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getReport(id).then(setReport).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className={styles.loading}>Cargando reporte...</p>;
  if (!report) return <p className={styles.loading}>No se pudo cargar el reporte.</p>;

  const pieData = [
    { name: "Vendidas", value: Number(report.sold_tickets) },
    { name: "Disponibles", value: report.available_spots },
  ];

  return (
    <div className="container">
      <div className={styles.page}>
        <Link to="/admin" className={styles.back}>← Volver al panel</Link>
        <h1 className={styles.title}>{report.title}</h1>
        <p className={styles.subtitle}>Reporte de ocupación</p>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{report.capacity}</span>
            <span className={styles.statLabel}>Capacidad total</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{report.sold_tickets}</span>
            <span className={styles.statLabel}>Entradas vendidas</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{report.available_spots}</span>
            <span className={styles.statLabel}>Lugares disponibles</span>
          </div>
          <div className={styles.stat}>
            <span className={`${styles.statValue} ${styles.accent}`}>
              {report.occupancy_rate.toFixed(1)}%
            </span>
            <span className={styles.statLabel}>Ocupación</span>
          </div>
        </div>

        <div className={styles.chartSection}>
          <h2 className={styles.sectionTitle}>Distribución de capacidad</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.buyersSection}>
          <h2 className={styles.sectionTitle}>Compradores ({report.buyers?.length || 0})</h2>
          {!report.buyers || report.buyers.length === 0 ? (
            <p className={styles.empty}>No hay compradores activos.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Estado entrada</th>
                  </tr>
                </thead>
                <tbody>
                  {report.buyers.map((ticket, i) => (
                    <tr key={ticket.ID}>
                      <td>{i + 1}</td>
                      <td>{ticket.user?.name || "-"}</td>
                      <td>{ticket.user?.email || "-"}</td>
                      <td>{ticket.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
