import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styles from "./ViewKittenModal.module.css";
import type { RootState } from "../../store";
import type { Kitten } from "../../types";
import { getKittenAgeInWeeks } from "../../utils/kittenAge";
import { getPluralWeeks } from "../../utils/getPluralWeeks";

interface ViewKittenModalProps {
  kitten: Kitten;
  onClose: () => void;
}

const ViewKittenModal: React.FC<ViewKittenModalProps> = ({
  kitten,
  onClose,
}) => {
  const { items: parents } = useSelector((state: RootState) => state.parents);

  // Состояние галереи: null - закрыта, number - индекс открытого фото
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const fatherId = kitten.parentId?.dad;
  const motherId = kitten.parentId?.mom;

  const father = parents.find((p) => p._id === fatherId);
  const mother = parents.find((p) => p._id === motherId);

  const age = kitten.birthDay
    ? getPluralWeeks(getKittenAgeInWeeks(kitten.birthDay))
    : "Unknown";

  // Собираем все фото для галереи
  const allPhotos =
    kitten.images.length > 0
      ? kitten.images.map((img) => img.full || img.mobile)
      : ["placeholder.jpg"];

  const mainPhoto = allPhotos[0];
  // Для превью берем со 2-й по 5-ю фотографию (индексы 1-4)
  const thumbnails = kitten.images.slice(1, 5);

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
          {/* Шапка */}
          <div className={styles.header}>
            <div>
              <h2 className={styles.title}>{kitten.nameEn || kitten.nameUa}</h2>
              <p className={styles.subtitle}>{kitten.breed}</p>
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

          {/* Контент без прокрутки */}
          <div className={styles.content}>
            {/* Секция фото (кликабельная) */}
            <div className={styles.photosSection}>
              <div
                className={styles.mainPhotoWrapper}
                onClick={() => openGallery(0)}
              >
                <img
                  src={mainPhoto}
                  alt={kitten.nameEn}
                  className={styles.photo}
                />
              </div>
              {thumbnails.length > 0 && (
                <div className={styles.thumbnailsColumn}>
                  {thumbnails.map((img, idx) => {
                    const globalIndex = idx + 1; // +1 т.к. 0 - это mainPhoto
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

            {/* Быстрая информация */}
            <div className={styles.quickInfo}>
              <div className={styles.badgeGroup}>
                <span
                  className={`${styles.statusBadge} ${styles[kitten.status?.toLowerCase() || "offline"]}`}
                >
                  {kitten.status || "Available"}
                </span>
                <span className={styles.price}>
                  {kitten.price?.pet
                    ? `$ pet ${kitten.price.pet}`
                    : "Price upon request"}
                </span>
                <span className={styles.price}>
                  {kitten.price?.breeding
                    ? `$ breeding ${kitten.price.breeding}`
                    : "Price upon request"}
                </span>
              </div>
              <div
                className={`${styles.gender} ${kitten.sex === "male" ? styles.male : styles.female}`}
              >
                {kitten.sex === "male" ? "♂ Male" : "♀ Female"}
              </div>
            </div>

            {/* Таблица характеристик */}
            <div className={styles.detailsTable}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Breed</span>
                <span className={styles.detailValue}>{kitten.breed}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Age</span>
                <span className={styles.detailValue}>{age}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Color / Variety</span>
                <span className={styles.detailValue}>{kitten.color}</span>
              </div>
            </div>

            {/* Родители */}
            {father || mother ? (
              <div className={styles.parentsSection}>
                <h4 className={styles.parentsTitle}>PARENTS</h4>
                <div className={styles.parentsGrid}>
                  {father ? (
                    <div className={styles.parentCard}>
                      <img
                        src={father?.images[0]?.thumbnail || "placeholder.jpg"}
                        alt="Sire"
                        className={styles.parentAvatar}
                      />
                      <div className={styles.parentInfo}>
                        <span className={styles.parentTitle}>
                          {father?.nameEn || father?.nameUa || "Unknown"}
                        </span>
                        <span className={styles.parentName}>
                          {father?.breed}
                        </span>
                        <span className={`${styles.parentRole} ${styles.male}`}>
                          ♂ Sire
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.parentCard}>
                      <div className={styles.parentInfo}>
                        <span className={styles.parentName}>
                          {"Отец ушел за хлебом((("}
                        </span>
                      </div>
                    </div>
                  )}

                  {mother ? (
                    <div className={styles.parentCard}>
                      <img
                        src={mother?.images[0]?.thumbnail || "placeholder.jpg"}
                        alt="Dam"
                        className={styles.parentAvatar}
                      />
                      <div className={styles.parentInfo}>
                        <span className={styles.parentTitle}>
                          {mother?.nameEn || mother?.nameUa || "Unknown"}
                        </span>
                        <span className={styles.parentName}>
                          {mother?.breed}
                        </span>
                        <span
                          className={`${styles.parentRole} ${styles.female}`}
                        >
                          ♀ Dam
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.parentCard}>
                      <div className={styles.parentInfo}>
                        <span className={styles.parentName}>
                          {father ? "вместо мамы у нас папа" : "Нерадивая мать"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p>ЭТОТ КОТЕНОК ПРИЕМНЫЙ</p>
            )}
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

export default ViewKittenModal;
