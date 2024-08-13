/*users */

export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: UserRole;
}
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

/* products*/
export interface IProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: {
    rate: number;
    count: number;
  };
}
/* pagination and filter */
export interface ProductQueryParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// src/types/IAppointment.ts
export interface IAppointment {
  customerName: string;
  email: string;
  phone: string; // Novo campo adicionado
  date: string; // Mantendo como string para facilitar o manuseio no formulário
  time: string;
  service: string;
  barber: string;
  notes?: string;
}
