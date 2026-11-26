import type { AxiosError } from "axios";

/*
 * Бэкенд (NestJS + Mongoose) отвечает ошибками на английском: тексты
 * class-validator («nameUa should not be empty»), ошибки драйвера Mongo
 * («E11000 duplicate key…»), стандартные HTTP-фразы. Показывать это админу
 * нельзя, поэтому здесь единая точка перевода: разбираем ответ, приводим
 * к русскому и только потом отдаём в UI.
 *
 * Правило: если бэкенд уже прислал русский (или украинский) текст — отдаём
 * его как есть, он осмысленнее любого нашего обобщения. Английское сообщение,
 * которое не узнали, заменяем на текст по HTTP-статусу, а оригинал пишем
 * в консоль — чтобы причину можно было найти при отладке.
 */

const CYRILLIC = /[Ѐ-ӿ]/;

// Имена полей из сообщений class-validator → как поле подписано в интерфейсе
const FIELD_LABELS: Record<string, string> = {
  nameua: "Имя (UA)",
  nameen: "Имя (EN)",
  namelang3: "Имя (язык 3)",
  namelang4: "Имя (язык 4)",
  name: "Название",
  slug: "Слаг",
  login: "Логин",
  email: "E-mail",
  password: "Пароль",
  breed: "Порода",
  color: "Окрас",
  sex: "Пол",
  status: "Статус",
  birthday: "Дата рождения",
  breeding: "Цена для разведения",
  pet: "Цена как питомца",
  price: "Цена",
  images: "Фотографии",
  imagesorder: "Порядок фотографий",
  retainedimages: "Сохраняемые фотографии",
  videoid: "Видео",
  kittens: "Котята",
  mom: "Мать",
  dad: "Отец",
  parents: "Родители",
  family: "Семья",
  familyid: "Семья",
  displayorder: "Порядок отображения",
  caption: "Подпись поста",
  announcement: "Анонс",
  text: "Текст",
  id: "Идентификатор",
  _id: "Идентификатор",
};

const fieldLabel = (raw: string): string => {
  const key = raw.trim().replace(/[`"']/g, "").toLowerCase();
  return FIELD_LABELS[key] ?? raw.trim();
};

/*
 * Сущности в текстах вида «Kitten not found». Род нужен, чтобы согласовать
 * сказуемое: «Котёнок не найден», но «Семья не найдена».
 */
const ENTITIES: Record<string, { label: string; notFound: string }> = {
  kitten: { label: "Котёнок", notFound: "Котёнок не найден" },
  cat: { label: "Кот", notFound: "Кот не найден" },
  parent: { label: "Родитель", notFound: "Родитель не найден" },
  family: { label: "Семья", notFound: "Семья не найдена" },
  breed: { label: "Порода", notFound: "Порода не найдена" },
  color: { label: "Окрас", notFound: "Окрас не найден" },
  user: { label: "Пользователь", notFound: "Пользователь не найден" },
  admin: { label: "Администратор", notFound: "Администратор не найден" },
  post: { label: "Пост", notFound: "Пост не найден" },
  image: { label: "Изображение", notFound: "Изображение не найдено" },
  photo: { label: "Фотография", notFound: "Фотография не найдена" },
  file: { label: "Файл", notFound: "Файл не найден" },
  announcement: { label: "Анонс", notFound: "Анонс не найден" },
};

const entityLabel = (raw: string): string =>
  ENTITIES[raw.trim().toLowerCase()]?.label ?? raw.trim();

const entityNotFound = (raw: string): string => {
  const entity = ENTITIES[raw.trim().toLowerCase()];
  return entity ? entity.notFound : `Не найдено: ${raw.trim()}`;
};

/*
 * Значения перечислений бэкенда: статус котёнка и пол. Всплывают в тексте
 * «status must be one of the following values: offline, active, …».
 */
const VALUE_LABELS: Record<string, string> = {
  offline: "скрыт",
  active: "в продаже",
  booked: "забронирован",
  out: "уехал",
  male: "кот",
  female: "кошка",
};

// Переводит перечисленные через запятую допустимые значения
const valueList = (raw: string): string =>
  raw
    .split(",")
    .map((value) => {
      const trimmed = value.trim();
      const label = VALUE_LABELS[trimmed.toLowerCase()];
      return label ? `${label} (${trimmed})` : trimmed;
    })
    .join(", ");

// «минимум 2 символа», а не «2 символов»
const symbolsRules = new Intl.PluralRules("ru-RU");
const plSymbols = (count: string): string => {
  switch (symbolsRules.select(Number(count))) {
    case "one":
      return "символ";
    case "few":
      return "символа";
    default:
      return "символов";
  }
};

/*
 * Точные соответствия: нижний регистр без финальной точки.
 * Сюда попадают типовые фразы NestJS, Passport и multer.
 */
const EXACT: Record<string, string> = {
  unauthorized: "Нужно войти в систему заново",
  forbidden: "Недостаточно прав для этого действия",
  "forbidden resource": "Недостаточно прав для этого действия",
  "bad request": "Сервер не принял данные формы",
  "not found": "Запись не найдена",
  conflict: "Запись с такими данными уже существует",
  "internal server error": "Внутренняя ошибка сервера",
  "service unavailable": "Сервер временно недоступен",
  "request timeout": "Сервер не ответил вовремя",
  "payload too large": "Файл слишком большой",
  "unsupported media type": "Неподдерживаемый формат файла",
  "unprocessable entity": "Сервер не смог обработать данные",
  "too many requests": "Слишком много запросов, подождите немного",
  "invalid credentials": "Неверный логин или пароль",
  "invalid login or password": "Неверный логин или пароль",
  "wrong credentials": "Неверный логин или пароль",
  "invalid password": "Неверный пароль",
  "user not found": "Пользователь не найден",
  "invalid token": "Срок действия сессии истёк, войдите заново",
  "jwt expired": "Срок действия сессии истёк, войдите заново",
  "jwt malformed": "Сессия повреждена, войдите заново",
  "token expired": "Срок действия сессии истёк, войдите заново",
  "login failed": "Не удалось войти",
  "validation failed": "Данные формы не прошли проверку",
  "file too large": "Файл слишком большой",
  "unexpected field": "Сервер не ожидал такой файл",
  "too many files": "Слишком много файлов",
  "cast to objectid failed": "Некорректный идентификатор записи",
};

/*
 * Шаблоны. Проверяются по порядку, первое совпадение выигрывает.
 * Большинство — сообщения class-validator, где первое слово — имя поля.
 */
const PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [
  /*
   * Telegram идёт первым: его ответы Telegram Bot API оборачивает в
   * «Bad Request: chat not found», и общее правило про not found иначе
   * разберёт их как имя сущности.
   */
  [/chat not found/i, () => "Telegram: канал не найден"],
  [
    /message is not modified/i,
    () => "Telegram: текст не изменился, правка не требуется",
  ],
  [
    /message to edit not found/i,
    () => "Telegram: сообщение не найдено, возможно его удалили вручную",
  ],
  [/bot was blocked/i, () => "Telegram: бот заблокирован в этом канале"],
  [
    /caption is too long|message is too long/i,
    () => "Telegram: текст слишком длинный",
  ],
  [
    /too many requests|retry after/i,
    () => "Слишком много запросов, подождите немного",
  ],

  // Уникальный индекс Mongo: E11000 duplicate key error ... index: slug_1 ...
  [
    /e11000 duplicate key.*index:\s*([a-z0-9_]+?)_\d/i,
    (m) => `${fieldLabel(m[1])}: такое значение уже занято`,
  ],
  [/e11000 duplicate key/i, () => "Запись с такими данными уже существует"],
  [
    /^(.+?) must be unique$/i,
    (m) => `${fieldLabel(m[1])}: такое значение уже занято`,
  ],
  [
    /^(.+?) already exists$/i,
    (m) => `${entityLabel(m[1])} с такими данными уже существует`,
  ],

  // Обязательные поля
  [/^(.+?) should not be empty$/i, (m) => `Заполните поле «${fieldLabel(m[1])}»`],
  [/^(.+?) is required$/i, (m) => `Заполните поле «${fieldLabel(m[1])}»`],
  [/^(.+?) must not be empty$/i, (m) => `Заполните поле «${fieldLabel(m[1])}»`],
  [
    /^(.+?) should not be null or undefined$/i,
    (m) => `Заполните поле «${fieldLabel(m[1])}»`,
  ],

  // Типы
  [
    /^(.+?) must be a (?:string|number|boolean|date)/i,
    (m) => `Некорректное значение поля «${fieldLabel(m[1])}»`,
  ],
  [
    /^(.+?) must be an? (?:array|object|integer)/i,
    (m) => `Некорректное значение поля «${fieldLabel(m[1])}»`,
  ],
  [
    /^(.+?) must be a mongodb id$/i,
    (m) => `Некорректный идентификатор в поле «${fieldLabel(m[1])}»`,
  ],
  [
    /^(.+?) must be an email$/i,
    (m) => `Поле «${fieldLabel(m[1])}» должно быть e-mail адресом`,
  ],
  [
    /^(.+?) must be a valid (?:iso ?8601 )?date(?: string)?$/i,
    (m) => `Поле «${fieldLabel(m[1])}» должно быть корректной датой`,
  ],
  [
    /^(.+?) must be one of the following values:\s*(.+)$/i,
    (m) =>
      `Недопустимое значение поля «${fieldLabel(m[1])}». Допустимо: ${valueList(m[2])}`,
  ],

  // Длина и диапазоны
  [
    /^(.+?) must be longer than or equal to (\d+) characters?$/i,
    (m) => `«${fieldLabel(m[1])}»: минимум ${m[2]} ${plSymbols(m[2])}`,
  ],
  [
    /^(.+?) must be shorter than or equal to (\d+) characters?$/i,
    (m) => `«${fieldLabel(m[1])}»: максимум ${m[2]} ${plSymbols(m[2])}`,
  ],
  [
    /^(.+?) must not be (?:greater|more) than (\d+)/i,
    (m) => `«${fieldLabel(m[1])}»: не больше ${m[2]}`,
  ],
  [
    /^(.+?) must not be less than (\d+)/i,
    (m) => `«${fieldLabel(m[1])}»: не меньше ${m[2]}`,
  ],
  [
    /^(.+?) must contain at least (\d+) element/i,
    (m) => `«${fieldLabel(m[1])}»: добавьте минимум ${m[2]}`,
  ],
  [
    /^(.+?) must contain not more than (\d+) element/i,
    (m) => `«${fieldLabel(m[1])}»: не больше ${m[2]}`,
  ],

  // Записи
  [/^(.+?) (?:was )?not found$/i, (m) => entityNotFound(m[1])],
  [
    /^(?:cannot|can\x27t) find (.+?)$/i,
    (m) => `Не удалось найти: ${entityLabel(m[1])}`,
  ],
  [
    /cast to objectid failed/i,
    () => "Некорректный идентификатор записи",
  ],

  // Файлы
  [
    /file too large/i,
    () => "Файл слишком большой — уменьшите размер изображения",
  ],
  [/only image/i, () => "Загружать можно только изображения"],
  [/invalid file type|unsupported media type/i, () => "Неподдерживаемый формат файла"],

  // Сеть и инфраструктура
  [/network ?error/i, () => "Нет связи с сервером"],
  [/timeout|etimedout/i, () => "Сервер не ответил вовремя"],
  [/econnrefused/i, () => "Сервер недоступен"],
  [
    /validation (?:failed|error)/i,
    () => "Данные формы не прошли проверку на сервере",
  ],
];

// Текст по HTTP-статусу — последний рубеж, когда само сообщение не узнали
const BY_STATUS: Record<number, string> = {
  400: "Сервер не принял данные формы",
  401: "Нужно войти в систему заново",
  403: "Недостаточно прав для этого действия",
  404: "Запись не найдена",
  405: "Действие не поддерживается сервером",
  408: "Сервер не ответил вовремя",
  409: "Запись с такими данными уже существует",
  413: "Файл слишком большой",
  415: "Неподдерживаемый формат файла",
  422: "Сервер не смог обработать данные",
  429: "Слишком много запросов, подождите немного",
  500: "Внутренняя ошибка сервера",
  502: "Сервер недоступен",
  503: "Сервер временно недоступен",
  504: "Сервер не ответил вовремя",
};

/** Переводит одно сообщение бэкенда. null — если узнать не удалось. */
const translateOne = (raw: string): string | null => {
  const text = raw.trim();
  if (!text) return null;
  // Русский/украинский текст бэкенда осмысленнее любого нашего обобщения
  if (CYRILLIC.test(text)) return text;

  const normalized = text.replace(/\.+$/, "").trim().toLowerCase();
  if (EXACT[normalized]) return EXACT[normalized];

  for (const [pattern, build] of PATTERNS) {
    const match = text.replace(/\.+$/, "").trim().match(pattern);
    if (match) return build(match);
  }
  return null;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

// Раскладывает одно поле ответа в список строк: message у NestJS бывает
// строкой, а при провале class-validator — массивом (по строке на поле)
const flatten = (source: unknown): string[] => {
  if (typeof source === "string") return source.trim() ? [source.trim()] : [];
  if (!Array.isArray(source)) return [];

  const out: string[] = [];
  for (const item of source) {
    if (typeof item === "string" && item.trim()) out.push(item.trim());
    else {
      const message = asRecord(item)?.message;
      if (typeof message === "string" && message.trim())
        out.push(message.trim());
    }
  }
  return out;
};

/*
 * Поля ответа по убыванию полезности. Берём ПЕРВЫЙ уровень, который дал
 * хоть один перевод, и дальше не идём: иначе к разбору validation-ошибок
 * приклеивается бесполезное error: "Bad Request" из того же ответа.
 */
const messageTiers = (error: unknown): string[][] => {
  const data = asRecord((error as AxiosError)?.response?.data);
  return [
    flatten(data?.message),
    [...flatten(data?.errors), ...flatten(data?.error)],
    flatten(asRecord(error)?.message),
  ].filter((tier) => tier.length > 0);
};

/**
 * Единственная функция, через которую ошибка бэкенда попадает в интерфейс.
 *
 * @param error   то, что поймали в catch (ошибка axios или любая другая)
 * @param fallback текст на случай, когда сообщение не узнали и статуса нет
 */
export const apiErrorMessage = (
  error: unknown,
  fallback = "Что-то пошло не так, попробуйте ещё раз",
): string => {
  const axiosError = error as AxiosError | undefined;
  const status = axiosError?.response?.status;

  // Запрос не дошёл до сервера: ответа нет вообще
  if (axiosError && !axiosError.response) {
    const code = axiosError.code ?? "";
    if (code === "ECONNABORTED" || code === "ETIMEDOUT")
      return "Сервер не ответил вовремя — проверьте соединение";
    return "Нет связи с сервером — проверьте интернет и попробуйте снова";
  }

  const tiers = messageTiers(error);
  for (const tier of tiers) {
    const translated = tier
      .map(translateOne)
      .filter((text): text is string => Boolean(text));
    // Дубли бывают, когда одно и то же лежит и в message, и в errors
    if (translated.length > 0) return [...new Set(translated)].join(". ");
  }

  // Сообщение не узнали — оставляем след в консоли и показываем текст по статусу
  if (tiers.length > 0) {
    console.warn("Непереведённая ошибка бэкенда:", tiers.flat());
  }

  if (status && BY_STATUS[status]) return BY_STATUS[status];
  if (status) return `${fallback} (код ${status})`;
  return fallback;
};

export default apiErrorMessage;
