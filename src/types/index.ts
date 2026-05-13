interface Filter {
  name: string;
  _id: string;
}

export interface FilterState {
  breeds: Filter[];
  colors: Filter[];
  isLoading: boolean;
  error: string | null;
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
  color: string;
  birthDay: string;
  status: KittenStatus;
  familyId: string;
  breed: string;
  sex: KittenSex;
  price: KittenPrice;
  images: KittenImage[];
  parentId: {
    mom: string;
    dad: string;
  };
}

export interface KittenResponse {
  message: string;
  data: Kitten[];
}

export interface AddKittenResponse {
  message: string;
  data: Kitten;
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
  color: string;
  status: KittenStatus;
  familyId: string[];
  breed: string;
  sex: KittenSex;
  images: KittenImage[];
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
  displayOrder: number;
  parents: {
    mom?: string;
    dad?: string;
  };
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
  displayOrder: number;
  parentIds: string[];
  kittensIds: string[];
}
