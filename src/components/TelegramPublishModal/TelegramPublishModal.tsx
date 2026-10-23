import React, { useEffect, useState } from "react";
import styles from "./TelegramPublishModal.module.css";
import type { Kitten, KittenStatus } from "../../types";
import { buildTelegramPost } from "../../utils/buildTelegramPost";
import api from "../../api/axiosInstance";

// Объявление по уже опубликованному котёнку: text встаёт в верх подписи
// существующего поста и уходит сообщением-ответом, status — опционально
const announceRoute = (kittenId: string) => `/tgbot/${kittenId}/announce`;

const STATUS_OPTIONS: KittenStatus[] = ["offline", "active", "booked", "out"];

interface TelegramPublishModalProps {
  kitten: Kitten;
  isPublished: boolean;
  onClose: () => void;
  onPublished: () => void;
}

const TelegramPublishModal: React.FC<TelegramPublishModalProps> = ({
  kitten,
  isPublished,
  onClose,
  onPublished,
}) => {
  // Текст первой публикации — стандартный пост, его можно поправить
  const [postText, setPostText] = useState(() => buildTelegramPost(kitten));
  // Новая фраза для уже опубликованного котёнка — всегда пустая, старый текст не трогаем
  const [message, setMessage] = useState("");
  // Пустая строка = статус не меняем
  const [status, setStatus] = useState<KittenStatus | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(postText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post(`/tgbot/${kitten._id}`, { text: postText });
      onPublished();
      onClose();
    } catch (e) {
      console.error(e);
      setError("Не удалось опубликовать. Попробуйте ещё раз.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post(announceRoute(kitten._id), {
        text: message,
        ...(status ? { status } : {}),
      });
      setIsSent(true);
      setMessage("");
    } catch (e) {
      console.error(e);
      setError("Не удалось отправить объявление. Попробуйте ещё раз.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>
              {isPublished ? "Объявление в Telegram" : "Публикация в Telegram"}
            </h2>
            <p className={styles.subtitle}>{kitten.nameUa || kitten.nameEn}</p>
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

        <div className={styles.content}>
          {isPublished ? (
            <>
              <div className={styles.publishedBox}>
                <span>✅</span>
                <span>
                  Котёнок уже в Telegram. Текст встанет в самый верх подписи
                  существующего поста и уйдёт сообщением-ответом — старый текст
                  не меняется.
                </span>
              </div>
              <p className={styles.hint}>Текст объявления:</p>
              <textarea
                className={styles.message}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="🔔 РЕЗЕРВ м.Котоленд!"
                spellCheck={false}
              />
              <label className={styles.statusRow}>
                <span className={styles.hint}>Статус (необязательно):</span>
                <select
                  className={styles.select}
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as KittenStatus | "")
                  }
                >
                  <option value="">Не менять ({kitten.status})</option>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <>
              <p className={styles.hint}>
                Котёнок ещё не публиковался. Проверьте текст поста — при
                необходимости отредактируйте его перед отправкой.
              </p>
              <textarea
                className={styles.preview}
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                spellCheck={false}
              />
            </>
          )}
          {error && <p className={styles.error}>{error}</p>}
          {isSent && <p className={styles.success}>Объявление отправлено</p>}
        </div>

        <div className={styles.footer}>
          <button
            className={`${styles.btn} ${styles.secondary}`}
            onClick={onClose}
          >
            {isPublished ? "Закрыть" : "Отмена"}
          </button>
          {isPublished ? (
            <button
              className={`${styles.btn} ${styles.primary}`}
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? "Отправляем…" : "Отправить объявление"}
            </button>
          ) : (
            <>
              <button
                className={`${styles.btn} ${styles.secondary}`}
                onClick={handleCopy}
              >
                {copied ? "Скопировано" : "Копировать текст"}
              </button>
              <button
                className={`${styles.btn} ${styles.primary}`}
                onClick={handlePublish}
                disabled={isLoading || !postText.trim()}
              >
                {isLoading ? "Публикуем…" : "Опубликовать"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TelegramPublishModal;
