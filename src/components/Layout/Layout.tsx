import React, { Suspense, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import styles from "./Layout.module.css";

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setIsMenuOpen(false);
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/kittens", label: "Kittens", icon: "🐱" },
    { path: "/parents", label: "Parents", icon: "👥" },
    { path: "/families", label: "Families", icon: "🤍" },
    { path: "/reservations", label: "Reservations", icon: "📅" },
    { path: "/finance", label: "Finance", icon: "💰" },
    { path: "/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className={styles.layout}>
      {/* Мобильная шапка */}
      <header className={styles.mobileHeader}>
        <h1 className={styles.mobileLogo}>Arlen</h1>
        <button
          className={styles.burger}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* Оверлей для закрытия меню кликом по пустому месту */}
      {isMenuOpen && (
        <div className={styles.overlay} onClick={() => setIsMenuOpen(false)} />
      )}

      <aside
        className={`${styles.sidebar} ${isMenuOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.sidebarContent}>
          <div className={styles.logoSection}>
            <h1 className={styles.brandTitle}>Arlen Fluffy Plush</h1>
            <p className={styles.brandSubtitle}>CAT CATTERY</p>
          </div>

          <nav className={styles.nav}>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navLink} ${
                  location.pathname === item.path ? styles.activeLink : ""
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className={styles.icon}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.sidebarFooter}>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
            <p className={styles.copyright}>© 2026 Arlen Fluffy Plush</p>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <Suspense fallback={<div className={styles.loader}>Загрузка...</div>}>
          <div className={styles.pageContainer}>
            <Outlet />
          </div>
        </Suspense>
      </main>
    </div>
  );
};

export default Layout;
