// types.ts

// Menu and MenuItem types
// types/index.ts
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
  
  export interface FeedbackData {
    meal_date: string;
    meal_type: string;
    rating: number;
    comment: string;
  }
  
  export interface FeedbackResponse {
    id: number;
    rating: number;
    feedback: string;
    menuId: number;
    userId: number;
    createdAt: string; // ISO date string
    // Add any other relevant fields
  }
  
  // Error type
  export interface ApiError {
    message: string;
    code?: string;
    // Add any other relevant error fields
  }
  
  // Service function return types
  export type GetTodayMenuFn = () => Promise<Menu>;
  export type SubmitFeedbackFn = (data: FeedbackData) => Promise<FeedbackResponse>;
  
  // React Query hook return types
  export interface UseMenuResult {
    data: Menu | undefined;
    isLoading: boolean;
    error: ApiError | null;
    // Add other relevant fields from useQuery result
  }
  
  export interface UseFeedbackResult {
    mutate: (data: FeedbackData) => void;
    isLoading: boolean;
    error: ApiError | null;
    // Add other relevant fields from useMutation result
  }
  
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

  export interface RegisterCredentials{
    email: string;
    name: string;
    password: string;
    role: UserRole;
  }

  export interface LoginCredentials{
    email: string;
    password: string;
}

export interface ConsumptionData {
  food_item_id: number; // Assuming food item ID is a number
  quantity: number; // Quantity should be a number
  date: string; // Date in YYYY-MM-DD format
  meal_type: string; // Meal type as a string
}

export interface FoodItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  created_at: Date;
}

export interface FeedbackData {
  meal_date: string;
  meal_type: string;
  rating: number;
  comment: string;
}

export interface HolidaySchedule {
  start_date: string;
  end_date: string;
  description: string;
}