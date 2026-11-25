// Справочники породы и окраса многоязычные: бэкенд отдаёт все языки сразу,
// в формы и фильтры уходит _id, а не название
export interface ReferenceImage {
  full: string;
  thumbnail: string;
  mobile: string;
}

export interface ColorRef {
  _id: string;
  nameUa: string;
  nameEn: string;
  nameLang3?: string | null;
  nameLang4?: string | null;
}

export interface BreedRef extends ColorRef {
  image?: ReferenceImage | null;
  // Второй ключ для публичных URL: /breeds/<slug>. Админка работает по _id
  slug?: string;
}

export interface FilterState {
  breeds: BreedRef[];
  colors: ColorRef[];
  isLoading: boolean;
  errorColor: string | null;
  errorBreed: string | null;
}

export interface GetBreedsResponse {
  data: BreedRef[];
  message?: string;
  status?: string;
}

export interface GetColorsResponse {
  data: ColorRef[];
  message?: string;
  status?: string;
}

export interface AddBreedResponse {
  data: BreedRef;
  message?: string;
  status?: string;
}

export interface AddColorResponse {
  data: ColorRef;
  message?: string;
  status?: string;
}

export interface AddColorRequest {
  nameUa: string;
  nameEn: string;
  nameLang3?: string;
  nameLang4?: string;
}

/*
 * PATCH /filters/color/:id и /filters/breed/:id принимают любые из полей:
 * отсутствие ключа = не трогать, null = очистить необязательный язык.
 * Пустой объект бэкенд отклоняет с 400 «Нет полей для обновления».
 */
export interface UpdateReferenceRequest {
  nameUa?: string;
  nameEn?: string;
  nameLang3?: string | null;
  nameLang4?: string | null;
  slug?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export type KittenStatus = "offline" | "active" | "booked" | "out";
export type KittenSex = "male" | "female";

export interface KittenImage {
  full: string;
  thumbnail: string;
  mobile: string;
  isMain: boolean;
}

export interface KittenPrice {
  breeding: number | null;
  pet: number | null;
}

export interface Kitten {
  _id: string;
  nameUa: string;
  nameEn: string;
  // Второй ключ для публичных URL (/kittens/<slug>); админка работает по _id.
  // У записей, созданных до появления слага, его нет — бэкенд достроит при PATCH
  slug?: string;
  // справочные поля приходят объектами с подставленными названиями;
  // если запись справочника удалили — приходит null
  color: ColorRef | null;
  birthDay: string;
  status: KittenStatus;
  // у нового котёнка семьи ещё нет: бэкенд отдаёт null либо вовсе не присылает поле
  familyId?: string | null;
  breed: BreedRef | null;
  sex: KittenSex;
  price: KittenPrice;
  images: KittenImage[];
  // Видео с YouTube — только идентификатор ролика, сам файл нигде не хранится.
  // null/отсутствие поля = видео нет
  videoId?: string | null;
  parentId: {
    mom: string;
    dad: string;
  };
  createdAt: string;
  // GET /cats/kittens отдаёт состояние поста рядом с флагом публикации
  isTelegramPublished?: boolean;
  hasAnnouncement?: boolean;
  telegramPostUrl?: string | null;
}

export interface KittenResponse {
  message: string;
  data: Kitten[];
}

export interface AddKittenResponse {
  message: string;
  data: Kitten;
}

/*
 * DELETE /cats/kitten/:id заодно снимает пост из Telegram.
 * Отказ Telegram удаление котёнка не блокирует (force: true) — вместо ошибки
 * приходит warning, и его обязательно нужно показать админу: иначе в канале
 * останется объявление о проданном котёнке.
 */
export interface DeleteKittenTelegram {
  hadPost: boolean;
  removed: boolean;
  warning: string | null;
}

export interface DeleteKittenResponse {
  status?: number;
  message?: string;
  telegram?: DeleteKittenTelegram;
}

export interface KittensState {
  items: Kitten[];
  isLoading: boolean;
  error: string | null;
}

export interface Parent {
  _id: string;
  nameUa: string;
  nameEn: string;
  slug?: string;
  color: ColorRef | null;
  status: KittenStatus;
  familyId?: string[] | null;
  breed: BreedRef | null;
  sex: KittenSex;
  images: KittenImage[];
  createdAt: string;
}
export interface GetParentResponse {
  status: string;
  message: string;
  data: Parent[];
}

export interface AddParentResponse {
  status: string;
  data: Parent;
}

export interface ParentsState {
  items: Parent[];
  isLoading: boolean;
  error: string | null;
}

export interface Family {
  _id: string;
  name: string;
  kittens: string[];
  breed: BreedRef | null;
  displayOrder: number;
  parents: {
    mom?: string;
    dad?: string;
  };
  createdAt: string;
}

export interface GetFamilyResponse {
  data: Family[];
  message: string;
  status: string;
}

export interface AddFamilyResponse {
  data: Family;
  message: string;
  status: string;
}

export interface FamiliesState {
  items: Family[];
  isLoading: boolean;
  error: string | null;
}
export interface UpdateKittenRequest {
  retainedImages: string[]; // URLs or IDs of images to keep
  // FormData will include new files as 'photos' and text fields
}

export interface UpdateParentRequest {
  retainedImages: string[]; // Similar to kitten
}

export interface UpdateFamilyRequest {
  name: string;
  breed: string;
  kittens: string[];

  displayOrder?: number;
  dad?: string | null;
  mom?: string | null;
}

export interface MyKnownError {
  message: string;
  success: boolean;
}
