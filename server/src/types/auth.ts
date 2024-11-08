export enum UserRole {
    ADMIN = 'ADMIN',
    MESS_STAFF = 'MESS_STAFF',
    STUDENT = 'STUDENT'
  }
  
  export interface User {
    id: number;
    email: string;
    name: string;
    password_hash: string;
    role: UserRole;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface AuthPayload {
    id: number;
    email: string;
    role: UserRole;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterCredentials extends LoginCredentials {
    name: string;
    role: UserRole;
  }
  
  export interface AuthResponse {
    token: string;
    user: {
      id: number;
      email: string;
      name: string;
      role: UserRole;
    };
  }