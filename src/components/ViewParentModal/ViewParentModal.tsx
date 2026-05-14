import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styles from "./ViewParentModal.module.css";
import type { RootState } from "../../store";
import type { Parent } from "../../types";

interface ViewParentModalProps {
  parent: Parent;
  onClose: () => void;
}

const ViewParentModal: React.FC<ViewParentModalProps> = ({
  parent,
  onClose,
}) => {
  const { items: kittens } = useSelector((state: RootState) => state.kittens);

  // Состояние галереи: null - закрыта, number - индекс открытого фото
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // Блокируем скролл страницы на фоне
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Находим потомство (котят) этого родителя
  const offspring = kittens.filter((k) => {
    if (!k.parentId) return false;
    const momId = k.parentId.mom;
    const dadId = k.parentId.dad;
    return momId === parent._id || dadId === parent._id;
  });

  // Собираем все фото для галереи
  const allPhotos =
    parent.images.length > 0
      ? parent.images.map((img) => img.full || img.mobile)
      : ["placeholder.jpg"];

  const mainPhoto = allPhotos[0];
  const thumbnails = parent.images.slice(1, 3); // Берем еще пару для превью

  // Функции управления галереей
  const openGallery = (index: number) => setActivePhotoIndex(index);
  const closeGallery = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndex(null);
  };
  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex((activePhotoIndex + 1) % allPhotos.length);
    }
  };
  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex(
        (activePhotoIndex - 1 + allPhotos.length) % allPhotos.length,
      );
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Шапка модалки (фиксированная) */}
          <div className={styles.header}>
            <div>
              <div className={styles.titleWrapper}>
                <h2 className={styles.title}>
                  {parent.nameEn || parent.nameUa}
                </h2>
              </div>
              <p className={styles.subtitle}>{parent.breed}</p>
            </div>
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Тело модалки (СКРОЛЛИТСЯ) */}
          <div className={styles.content}>
            {/* Секция фото (кликабельная) */}
            <div className={styles.photosSection}>
              <div
                className={styles.mainPhotoWrapper}
                onClick={() => openGallery(0)}
              >
                <img
                  src={mainPhoto}
                  alt={parent.nameEn}
                  className={styles.photo}
                />
              </div>
              {thumbnails.length > 0 && (
                <div className={styles.thumbnailsColumn}>
                  {thumbnails.map((img, idx) => {
                    const globalIndex = idx + 1;
                    return (
                      <div
                        key={idx}
                        className={styles.thumbWrapper}
                        onClick={() => openGallery(globalIndex)}
                      >
                        <img
                          src={img.thumbnail || img.mobile}
                          alt={`Thumb ${idx}`}
                          className={styles.photo}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Быстрые характеристики (Чипы) */}
            <div className={styles.chipsGroup}>
              <span
                className={`${styles.chip} ${parent.sex === "male" ? styles.chipMale : styles.chipFemale}`}
              >
                {parent.sex === "male" ? "♂ Male" : "♀ Female"}
              </span>
              <span className={`${styles.chip} ${styles.chipPurple}`}>
                {parent.breed}
              </span>
              <span className={`${styles.chip} ${styles.chipGold}`}>
                {parent.color}
              </span>
            </div>

            {/* Таблица данных */}
            <div className={styles.detailsTable}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Пол</span>
                <span
                  className={`${styles.chip} ${parent.sex === "male" ? styles.chipMale : styles.chipFemale}`}
                >
                  {parent.sex === "male" ? "♂ Male" : "♀ Female"}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Порода</span>
                <span className={`${styles.chip} ${styles.chipPurple}`}>
                  {parent.breed}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Цвет</span>
                <span className={`${styles.chip} ${styles.chipGold}`}>
                  {parent.color}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Total kittens</span>
                <span className={styles.detailValue}>{offspring.length}</span>
              </div>
            </div>

            {/* Здоровье */}

            {/* Потомство (Offspring) */}
            <div className={styles.sectionBlock}>
              <h4 className={styles.sectionTitle}>
                OFFSPRING · {offspring.length} KITTENS
              </h4>
              <div className={styles.offspringList}>
                {offspring.length > 0 ? (
                  offspring.map((kitten) => (
                    <div key={kitten._id} className={styles.offspringCard}>
                      <img
                        src={kitten.images[0]?.thumbnail || "placeholder.jpg"}
                        alt={kitten.nameEn}
                        className={styles.offspringAvatar}
                      />
                      <span className={styles.offspringName}>
                        {kitten.nameEn || kitten.nameUa}
                      </span>
                      <span
                        className={`${styles.statusBadge} ${styles[kitten.status?.toLowerCase() || "available"]}`}
                      >
                        {kitten.status || "Available"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className={styles.noOffspring}>
                    No kittens registered yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ГАЛЕРЕЯ (Лайтбокс) */}
      {activePhotoIndex !== null && (
        <div className={styles.galleryOverlay} onClick={closeGallery}>
          <button className={styles.galleryCloseBtn} onClick={closeGallery}>
            ✕
          </button>

          <button
            className={`${styles.galleryNavBtn} ${styles.prevBtn}`}
            onClick={prevPhoto}
          >
            &#10094;
          </button>

          <img
            src={allPhotos[activePhotoIndex]}
            alt="Gallery preview"
            className={styles.galleryImage}
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className={`${styles.galleryNavBtn} ${styles.nextBtn}`}
            onClick={nextPhoto}
          >
            &#10095;
          </button>

          <div className={styles.galleryCounter}>
            {activePhotoIndex + 1} / {allPhotos.length}
          </div>
        </div>
      )}
    </>
  );
};

export default ViewParentModal;
