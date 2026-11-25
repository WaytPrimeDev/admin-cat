import type { InputHTMLAttributes } from "react";

import styles from "./VideoLinkField.module.css";
import {
  parseYoutubeId,
  youtubeThumb,
  youtubeWatchUrl,
} from "../../utils/youtube";

interface VideoLinkFieldProps {
  id: string;
  // Текущее значение инпута — ссылка в том виде, в каком её ввёл админ
  value: string;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  onClear: () => void;
  error?: string;
}

/*
 * Необязательное видео котёнка. Сам ролик остаётся на YouTube: в базу уедет
 * только идентификатор, который бэкенд достанет из этой ссылки.
 * Превью-кадр — проверка «то ли это видео»: по кличке в URL не видно ничего.
 */
const VideoLinkField = ({
  id,
  value,
  inputProps,
  onClear,
  error,
}: VideoLinkFieldProps) => {
  const videoId = parseYoutubeId(value);

  return (
    <div className={styles.field}>
      <label htmlFor={id}>Видео с YouTube (необязательно)</label>
      <div className={styles.inputRow}>
        <input
          id={id}
          className={styles.input}
          placeholder="https://www.youtube.com/watch?v=..."
          aria-invalid={Boolean(error)}
          {...inputProps}
        />
        {value.trim() !== "" && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={onClear}
            title="Отвязать видео от котёнка"
          >
            Убрать видео
          </button>
        )}
      </div>
      <p className={styles.hint}>
        Вставьте ссылку на ролик — подойдёт любая форма: watch, youtu.be,
        shorts. Видео никуда не загружается, оно остаётся на YouTube.
      </p>

      {videoId && (
        <div className={styles.preview}>
          <img
            src={youtubeThumb(videoId)}
            alt="Кадр из видео"
            className={styles.thumb}
            width={160}
            loading="lazy"
          />
          <div className={styles.previewInfo}>
            <span className={styles.previewTitle}>Проверьте, то ли видео</span>
            <a
              className={styles.previewLink}
              href={youtubeWatchUrl(videoId)}
              target="_blank"
              rel="noreferrer noopener"
            >
              Открыть на YouTube
            </a>
          </div>
        </div>
      )}

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default VideoLinkField;
