import React, { Suspense, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import styles from "./Layout.module.css";

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <h1>Arlen Fluffy Plush</h1>
        </div>
        <button className={styles.burger} onClick={toggleMenu}>
          ☰
        </button>
        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`}>
          <Link
            to="/kittens"
            className={styles.navLink}
            onClick={() => setIsMenuOpen(false)}
          >
            Котята
          </Link>
          <Link
            to="/parents"
            className={styles.navLink}
            onClick={() => setIsMenuOpen(false)}
          >
            Родители
          </Link>
          <Link
            to="/families"
            className={styles.navLink}
            onClick={() => setIsMenuOpen(false)}
          >
            Семьи/Пометы
          </Link>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Выход
          </button>
        </nav>
      </header>
      <main className={styles.main}>
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default Layout;
