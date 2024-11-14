export enum UserRole {
    ADMIN = 'ADMIN',
    MESS_STAFF = 'MESS_STAFF',
    STUDENT = 'STUDENT'
  }
  
  export interface User {
    id: number;
    email: string;
    password_hash: string;
    role: UserRole;
    name: string;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface FoodItem {
    id: number;
    name: string;
    category: string;
    unit: string;
    created_at: Date;
  }
  
  export interface ConsumptionRecord {
    id: number;
    food_item_id: number;
    quantity: number;
    date: Date;
    meal_type: string;
    recorded_by: number;
    created_at: Date;
  }
  
  export interface Feedback {
    id: number;
    student_id: number;
    meal_date: Date;
    meal_type: string;
    rating: number;
    comment?: string;
    created_at: Date;
  }
  
  export interface HolidaySchedule {
    id: number;
    start_date: Date;
    end_date: Date;
    description?: string;
    created_by: number;
    created_at: Date;
  }

  // types.ts
export interface MenuItem {
  id: number;
  name: string;
  category: string;
  description?: string;
}

export interface Menu {
  date: string;
  breakfast: MenuItem[];
  lunch: MenuItem[];
  dinner: MenuItem[];
}
    