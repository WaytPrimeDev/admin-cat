import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import styles from "./DashboardPage.module.css";
import { useAppDispatch, type RootState } from "../../store";
import { fetchKittens } from "../../store/slices/kittensSlice";
import { fetchParents } from "../../store/slices/parentsSlice";
import { fetchFamilies } from "../../store/slices/familiesSlice";
import { getRandomQuote, type CatQuote } from "../../utils/getRandomQuote"; // Импортируем утилиту

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();

  // Достаем данные из Redux
  const { items: kittens, isLoading: kittensLoading } = useSelector(
    (state: RootState) => state.kittens,
  );
  const { items: parents, isLoading: parentsLoading } = useSelector(
    (state: RootState) => state.parents,
  );
  const { items: families, isLoading: familiesLoading } = useSelector(
    (state: RootState) => state.families,
  );

  // Состояние для цитаты
  const [quote] = useState<CatQuote>(() => getRandomQuote());

  // Запрашиваем данные при загрузке дашборда
  useEffect(() => {
    dispatch(fetchKittens());
    dispatch(fetchParents());
    dispatch(fetchFamilies());
  }, [dispatch]);

  // 1. СТАТИСТИКА (Количество)
  const stats = [
    {
      title: "Total Parents",
      value: parents.length.toString(),
      subtext: "Breeding cats",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      title: "Total Kittens",
      value: kittens.length.toString(),
      subtext: "Registered in system",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3.1-9-7.56c0-1.25.5-2.4 1.1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z"></path>
        </svg>
      ),
    },
    {
      title: "Total Families",
      value: families.length.toString(),
      subtext: "Mating pairs & litters",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      ),
    },
  ];

  // 2. СТАТУСЫ КОТЯТ
  const kittenStatus = useMemo(() => {
    const available = kittens.filter(
      (k) => k.status?.toLowerCase() === "available",
    ).length;
    const reserved = kittens.filter(
      (k) => k.status?.toLowerCase() === "reserved",
    ).length;
    const offlineSold = kittens.filter((k) => {
      const st = k.status?.toLowerCase();
      return st === "offline" || st === "sold";
    }).length;

    return [
      {
        label: "Available",
        count: available,
        colorClass: styles.statusAvailable,
      },
      { label: "Reserved", count: reserved, colorClass: styles.statusReserved },
      {
        label: "Sold / Offline",
        count: offlineSold,
        colorClass: styles.statusSold,
      },
    ];
  }, [kittens]);

  // 3. ПОСЛЕДНЯЯ АКТИВНОСТЬ (Сортировка по createdAt)
  const recentActivity = useMemo(() => {
    const allEvents = [
      ...parents.map((p) => ({
        id: p._id,
        type: "Parent Added",
        title: "New Breeding Parent",
        desc: `${p.nameEn || p.nameUa} (${p.breed || "Breed not specified"})`,
        date: new Date(p.createdAt),
        color: "#cda34f",
      })),
      ...families.map((f) => ({
        id: f._id,
        type: "Family Created",
        title: "New Family Record",
        desc: `Litter name: ${f.name}`,
        date: new Date(f.createdAt),
        color: "#2b1f5c",
      })),
      ...kittens.map((k) => ({
        id: k._id,
        type: "Kitten Added",
        title: "New Kitten Registered",
        desc: `${k.nameEn || k.nameUa} (${k.breed || "Breed not specified"})`,
        date: new Date(k.createdAt),
        color: "#16a34a",
      })),
    ];

    return allEvents
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  }, [parents, families, kittens]);

  const formatDate = (date: Date) => {
    return date.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isLoading = kittensLoading || parentsLoading || familiesLoading;

  return (
    <div className={styles.container}>
      {/* Шапка */}
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Overview of cattery operations</p>
      </div>

      {isLoading ? (
        <p className={styles.loadingText}>Loading data from server...</p>
      ) : (
        <>
          {/* Сетка карточек статистики (4 штуки) */}
          <div className={styles.statsGrid}>
            {/* Первые 3 карточки (данные) */}
            {stats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className={styles.iconWrapper}>{stat.icon}</div>
                </div>
                <div className={styles.statBody}>
                  <h2 className={styles.statValue}>{stat.value}</h2>
                  <span className={styles.statTitle}>{stat.title}</span>
                  <span className={styles.statSubtext}>{stat.subtext}</span>
                </div>
              </div>
            ))}

            {/* 4-я карточка: ЦИТАТА */}
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={styles.iconWrapper}>
                  {/* Иконка сообщения/цитаты */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
              </div>
              <div className={styles.quoteBody}>
                {quote ? (
                  <>
                    <p className={styles.quoteText}>"{quote.text}"</p>
                    <span className={styles.quoteAuthor}>— {quote.author}</span>
                  </>
                ) : (
                  <p className={styles.quoteText}>Loading quote...</p>
                )}
              </div>
            </div>
          </div>

          {/* Основная сетка: Активность (слева) и Статусы (справа) */}
          <div className={styles.mainGrid}>
            {/* Левая колонка: Recent Activity */}
            <div className={styles.activitySection}>
              <h3 className={styles.sectionTitle}>Recent Activity</h3>
              <div className={styles.activityList}>
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div
                      key={`${activity.id}-${activity.type}`}
                      className={styles.activityItem}
                    >
                      <div
                        className={styles.activityDot}
                        style={{ backgroundColor: activity.color }}
                      ></div>
                      <div className={styles.activityContent}>
                        <div className={styles.activityTop}>
                          <span className={styles.activityName}>
                            {activity.title}
                          </span>
                          <span className={styles.activityTime}>
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{
                                marginRight: "4px",
                                verticalAlign: "-1px",
                              }}
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            {formatDate(activity.date)}
                          </span>
                        </div>
                        <div className={styles.activityDesc}>
                          {activity.desc}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.emptyText}>No recent activity found.</p>
                )}
              </div>
            </div>

            {/* Правая колонка: Status */}
            <div className={styles.sideGrid}>
              <div className={styles.sideCard}>
                <h4 className={styles.smallSectionTitle}>KITTEN STATUS</h4>
                <div className={styles.statusList}>
                  {kittenStatus.map((status, index) => (
                    <div key={index} className={styles.statusItem}>
                      <div className={styles.statusLabelGroup}>
                        <span
                          className={`${styles.statusDot} ${status.colorClass}`}
                        ></span>
                        <span className={styles.statusLabel}>
                          {status.label}
                        </span>
                      </div>
                      <span className={styles.statusCount}>{status.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
