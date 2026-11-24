import React, { useCallback, useEffect, useState } from "react";
import styles from "./TelegramPublishModal.module.css";
import type { Kitten, KittenStatus } from "../../types";
import { buildTelegramPost } from "../../utils/buildTelegramPost";
import api from "../../api/axiosInstance";
import type { AxiosError } from "axios";

// ---------------------------------------------------------------------------
// Роуты бота. :id везде — id котёнка.
//   GET    /tgbot/:id            — состояние поста
//   POST   /tgbot/:id            — первая публикация
//   PATCH  /tgbot/:id            — правка подписи поста
//   DELETE /tgbot/:id            — удалить пост целиком
//   POST   /tgbot/:id/announce   — создать анонс
//   PATCH  /tgbot/:id/announce   — правка анонса (тот же обработчик, что POST)
//   DELETE /tgbot/:id/announce   — удалить только анонс
// ---------------------------------------------------------------------------
const postRoute = (kittenId: string) => `/tgbot/${kittenId}`;
const announceRoute = (kittenId: string) => `/tgbot/${kittenId}/announce`;

const STATUS_OPTIONS: KittenStatus[] = ["offline", "active", "booked", "out"];

interface TelegramPublishModalProps {
  kitten: Kitten;
  isPublished: boolean;
  onClose: () => void;
  onPublished: () => void;
  onUnpublished?: () => void;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

const asString = (value: unknown): string =>
  typeof value === "string" ? value : "";

/*
 * Ошибки бэкенда несут осмысленный текст в message — лимит символов с фактической
 * длиной, «Пост не найден», причину отказа Telegram на 409. Показываем его как есть,
 * на свой обобщённый текст откатываемся только если message не пришёл.
 */
const serverMessage = (e: unknown, fallback: string): string => {
  const data = asRecord((e as AxiosError)?.response?.data);
  const message = asString(data?.message).trim();
  return message || fallback;
};

const statusOf = (e: unknown): number | undefined =>
  (e as AxiosError)?.response?.status;

interface PublishedPost {
  caption: string;
  announcement: string;
  hasAnnouncement: boolean;
  postUrl: string;
}

const EMPTY_POST: PublishedPost = {
  caption: "",
  announcement: "",
  hasAnnouncement: false,
  postUrl: "",
};

/*
 * GET /tgbot/:id отдаёт { data: { caption, announcement, hasAnnouncement, postUrl, ... } }.
 * caption — подпись без анонса, announcement — текст анонса либо null.
 */
const parsePublishedPost = (payload: unknown): PublishedPost => {
  const data = asRecord(asRecord(payload)?.data) ?? asRecord(payload);
  const announcement = asString(data?.announcement);
  return {
    caption: asString(data?.caption),
    announcement,
    hasAnnouncement:
      data?.hasAnnouncement === true || Boolean(announcement.trim()),
    postUrl: asString(data?.postUrl),
  };
};

const TelegramPublishModal: React.FC<TelegramPublishModalProps> = ({
  kitten,
  isPublished,
  onClose,
  onPublished,
  onUnpublished,
}) => {
  // Опубликован ли котёнок прямо сейчас: после полного удаления станет false
  // и модалка снова предложит отправить пост с нуля
  const [published, setPublished] = useState(isPublished);
  // Текст первой публикации — стандартный пост, его можно поправить
  const [postText, setPostText] = useState(() => buildTelegramPost(kitten));
  // Что реально висит в Telegram
  const [publishedPost, setPublishedPost] = useState<PublishedPost>({
    ...EMPTY_POST,
    postUrl: kitten.telegramPostUrl ?? "",
  });
  // Оба textarea предзаполняются из GET: подпись и анонс правятся на месте
  const [captionDraft, setCaptionDraft] = useState("");
  const [announceDraft, setAnnounceDraft] = useState("");
  const [isFetching, setIsFetching] = useState(isPublished);
  // Текст причины отказа GET-запроса: без него непонятно,
  // это ошибка бэкенда или пост пришёл без подписи
  const [fetchFailed, setFetchFailed] = useState<string | null>(null);
  // Пустая строка = статус не меняем
  const [status, setStatus] = useState<KittenStatus | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  // Полное удаление подтверждаем вторым нажатием
  const [confirmFullDelete, setConfirmFullDelete] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Перезагрузка поста идёт через счётчик: setState внутри эффекта только
  // после await, иначе линтер ловит каскадные рендеры
  const reloadPublishedPost = useCallback(
    () => setReloadKey((key) => key + 1),
    [],
  );

  useEffect(() => {
    if (!published) return;
    let cancelled = false;
    void (async () => {
      try {
        const { data } = await api.get(postRoute(kitten._id));
        if (cancelled) return;
        const parsed = parsePublishedPost(data);
        setPublishedPost(parsed);
        setCaptionDraft(parsed.caption);
        setAnnounceDraft(parsed.announcement);
        setFetchFailed(null);
      } catch (e) {
        console.error(e);
        if (cancelled) return;
        // 404 «Пост не найден» — не ошибка: котёнок помечен опубликованным,
        // а поста в канале уже нет. Возвращаемся к форме первой публикации
        if (statusOf(e) === 404) {
          setPublished(false);
          setPublishedPost(EMPTY_POST);
          setPostText(buildTelegramPost(kitten));
          onUnpublished?.();
          setNotice("Поста в Telegram нет — можно опубликовать заново.");
          return;
        }
        setFetchFailed(
          serverMessage(
            e,
            statusOf(e)
              ? `сервер ответил ${statusOf(e)}`
              : "запрос не дошёл до сервера (сеть или CORS)",
          ),
        );
        setPublishedPost(EMPTY_POST);
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // onUnpublished приходит из родителя и в зависимостях вызвал бы лишние GET
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [published, kitten._id, reloadKey]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post(postRoute(kitten._id), { text: postText });
      onPublished();
      setIsFetching(true);
      setPublished(true);
      setNotice("Пост опубликован");
    } catch (e) {
      console.error(e);
      setError(serverMessage(e, "Не удалось опубликовать. Попробуйте ещё раз."));
    } finally {
      setIsLoading(false);
    }
  };

  // PATCH /tgbot/:id — меняется только подпись. Анонс, если есть, бэкенд
  // сам оставляет сверху, лимит 1024 символа считается по сумме с анонсом
  const handleSaveCaption = async () => {
    setIsLoading(true);
    setError(null);
    setNotice(null);
    try {
      await api.patch(postRoute(kitten._id), { text: captionDraft });
      setNotice("Пост обновлён");
      reloadPublishedPost();
    } catch (e) {
      console.error(e);
      setError(serverMessage(e, "Не удалось обновить пост."));
    } finally {
      setIsLoading(false);
    }
  };

  // Анонса ещё нет — POST создаёт сообщение-ответ;
  // анонс есть — PATCH правит подпись и уже отправленное сообщение
  const handleSaveAnnounce = async () => {
    setIsLoading(true);
    setError(null);
    setNotice(null);
    const body = {
      text: announceDraft,
      ...(status ? { status } : {}),
    };
    try {
      if (publishedPost.hasAnnouncement) {
        await api.patch(announceRoute(kitten._id), body);
        setNotice("Объявление обновлено");
      } else {
        await api.post(announceRoute(kitten._id), body);
        setNotice("Объявление отправлено");
      }
      setStatus("");
      reloadPublishedPost();
    } catch (e) {
      console.error(e);
      setError(serverMessage(e, "Не удалось отправить объявление."));
    } finally {
      setIsLoading(false);
    }
  };

  // Удаляем только анонс — пост остаётся, подпись возвращается к исходной.
  // Статус котёнка бэкенд не откатывает
  const handleDeleteAnnounce = async () => {
    setIsLoading(true);
    setError(null);
    setNotice(null);
    try {
      await api.delete(announceRoute(kitten._id));
      setAnnounceDraft("");
      setNotice("Объявление удалено");
      reloadPublishedPost();
    } catch (e) {
      console.error(e);
      setError(serverMessage(e, "Не удалось удалить объявление."));
    } finally {
      setIsLoading(false);
    }
  };

  // Полное удаление: пост вместе с анонсом, после чего снова показываем
  // форму первой публикации
  const handleDeletePost = async () => {
    if (!confirmFullDelete) {
      setConfirmFullDelete(true);
      return;
    }
    setIsLoading(true);
    setError(null);
    setNotice(null);
    try {
      const { data } = await api.delete(postRoute(kitten._id));
      setConfirmFullDelete(false);
      setPublishedPost(EMPTY_POST);
      setCaptionDraft("");
      setAnnounceDraft("");
      setPostText(buildTelegramPost(kitten));
      setStatus("");
      setPublished(false);
      onUnpublished?.();
      // partial: true — пост старого формата, в канале могли остаться
      // фотографии из альбома, кроме первой
      setNotice(
        asRecord(data)?.partial === true
          ? "Пост удалён частично: удалены первое фото и анонс. Остальные фото альбома проверьте в канале вручную."
          : "Пост удалён. Можно опубликовать заново.",
      );
    } catch (e) {
      console.error(e);
      setError(serverMessage(e, "Не удалось удалить пост."));
    } finally {
      setIsLoading(false);
    }
  };

  const captionChanged = captionDraft !== publishedPost.caption;
  const announceChanged = announceDraft !== publishedPost.announcement;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>
              {published ? "Пост в Telegram" : "Публикация в Telegram"}
            </h2>
            <p className={styles.subtitle}>{kitten.nameUa || kitten.nameEn}</p>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Закрыть"
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
          {published ? (
            <>
              <div className={styles.publishedBox}>
                <span>✅</span>
                <span>Котёнок уже в Telegram — ниже текущий пост.</span>
                {publishedPost.postUrl && (
                  <a
                    href={publishedPost.postUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Открыть пост
                  </a>
                )}
              </div>

              {/* Подпись поста: правится на месте через PATCH /tgbot/:id */}
              <div className={styles.section}>
                <div className={styles.sectionHead}>
                  <p className={styles.hint}>Текст поста:</p>
                  <div className={styles.sectionActions}>
                    <button
                      className={`${styles.btnSm} ${styles.secondary}`}
                      onClick={() => handleCopy(captionDraft)}
                      disabled={!captionDraft.trim()}
                    >
                      {copied ? "Скопировано" : "Копировать"}
                    </button>
                    <button
                      className={`${styles.btnSm} ${styles.secondary}`}
                      onClick={() => setCaptionDraft(publishedPost.caption)}
                      disabled={isLoading || !captionChanged}
                      title="Вернуть текст, который сейчас в канале"
                    >
                      Сбросить
                    </button>
                    <button
                      className={`${styles.btnSm} ${styles.primary}`}
                      onClick={handleSaveCaption}
                      disabled={
                        isLoading || !captionChanged || !captionDraft.trim()
                      }
                      title="Сохранить новую подпись поста"
                    >
                      {isLoading ? "Сохраняем…" : "Изменить пост"}
                    </button>
                  </div>
                </div>
                {isFetching ? (
                  <p className={styles.loadingText}>Загружаем пост…</p>
                ) : fetchFailed ? (
                  <p className={styles.loadingText}>
                    Не удалось загрузить текст поста: {fetchFailed}.
                  </p>
                ) : (
                  <>
                    <textarea
                      className={styles.preview}
                      value={captionDraft}
                      onChange={(e) => setCaptionDraft(e.target.value)}
                      spellCheck={false}
                    />
                    <p className={styles.hint}>
                      Готовый HTML. Анонс, если он есть, остаётся сверху — лимит
                      1024 видимых символа считается вместе с ним. Фотографии
                      этим не меняются: для другого набора фото нужно удалить
                      пост и опубликовать заново.
                    </p>
                  </>
                )}
              </div>

              {/* Анонс: создаётся POST-ом, правится PATCH-ем, удаляется отдельно */}
              <div className={styles.section}>
                <div className={styles.sectionHead}>
                  <p className={styles.hint}>Объявление:</p>
                  {publishedPost.hasAnnouncement && (
                    <div className={styles.sectionActions}>
                      <button
                        className={`${styles.btnSm} ${styles.danger}`}
                        onClick={handleDeleteAnnounce}
                        disabled={isLoading}
                      >
                        {isLoading ? "Удаляем…" : "Удалить анонс"}
                      </button>
                    </div>
                  )}
                </div>
                {isFetching ? (
                  <p className={styles.loadingText}>Загружаем объявление…</p>
                ) : (
                  <>
                    <textarea
                      className={styles.message}
                      value={announceDraft}
                      onChange={(e) => setAnnounceDraft(e.target.value)}
                      placeholder="🔔 РЕЗЕРВ м.Котоленд!"
                      spellCheck={false}
                    />
                    <p className={styles.hint}>
                      {publishedPost.hasAnnouncement
                        ? "Правка меняет и подпись поста, и уже отправленное сообщение-ответ — новых сообщений в канале не появится."
                        : "Текст встанет в самый верх подписи существующего поста и уйдёт сообщением-ответом — старый текст не меняется."}
                    </p>
                    <label className={styles.statusRow}>
                      <span className={styles.hint}>
                        Статус (необязательно):
                      </span>
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
                    <div className={styles.sectionActions}>
                      <button
                        className={`${styles.btnSm} ${styles.primary}`}
                        onClick={handleSaveAnnounce}
                        disabled={
                          isLoading ||
                          !announceDraft.trim() ||
                          (publishedPost.hasAnnouncement &&
                            !announceChanged &&
                            !status)
                        }
                      >
                        {isLoading
                          ? "Отправляем…"
                          : publishedPost.hasAnnouncement
                            ? "Сохранить объявление"
                            : "Создать объявление"}
                      </button>
                    </div>
                  </>
                )}
              </div>
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
          {notice && <p className={styles.success}>{notice}</p>}
          {confirmFullDelete && (
            <p className={styles.error}>
              Пост будет удалён полностью, вместе с объявлением. Нажмите
              «Удалить пост полностью» ещё раз для подтверждения.
            </p>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={`${styles.btn} ${styles.secondary}`}
            onClick={onClose}
          >
            {published ? "Закрыть" : "Отмена"}
          </button>
          {published ? (
            <button
              className={`${styles.btn} ${styles.danger}`}
              onClick={handleDeletePost}
              disabled={isLoading}
            >
              {isLoading && confirmFullDelete
                ? "Удаляем…"
                : confirmFullDelete
                  ? "Подтвердить удаление"
                  : "Удалить пост полностью"}
            </button>
          ) : (
            <>
              <button
                className={`${styles.btn} ${styles.secondary}`}
                onClick={() => handleCopy(postText)}
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
