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