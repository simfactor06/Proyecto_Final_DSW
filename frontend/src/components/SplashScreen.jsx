import React, { useEffect, useState } from "react";
import styles from "./SplashScreen.module.css";

export default function SplashScreen({ onDismiss }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    function handleKey() {
      if (!leaving) trigger();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [leaving]);

  function trigger() {
    setLeaving(true);
    setTimeout(onDismiss, 600);
  }

  return (
    <div className={`${styles.overlay} ${leaving ? styles.leaving : ""}`} onClick={trigger}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🎟</span>
          <h1 className={styles.brand}>EventPass</h1>
        </div>
        <p className={styles.tagline}>Tu destino para los mejores eventos</p>
        <p className={styles.hint}>Presioná cualquier tecla o hacé clic para ingresar</p>
      </div>
    </div>
  );
}
