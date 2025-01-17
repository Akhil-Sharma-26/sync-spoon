import api from "./api";
import { FoodItem, HolidaySchedule, UserRole } from "../types";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Report {
  id: number;
  report_name: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface FeedbackData {
  meal_date: string;
  meal_type: string;
  rating: number;
  comment: string;
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
  user: User;
  token: string;
}

export interface ConsumptionRecord {
  food_item_id: number;
  quantity: number;
  date: string; // Format: YYYY-MM-DD
  meal_type: string; // e.g., "breakfast", "lunch", "dinner"
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(`/auth/login`, credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      `/auth/register`,
      credentials
    );
    return response.data;
  },

  async getUserProfile(): Promise<User> {
    const response = await api.get<User>(`/auth/profile`);
    return response.data;
  },

  async recordConsumption(
    consumptionData: ConsumptionRecord
  ): Promise<ConsumptionRecord> {
    const response = await api.post<ConsumptionRecord>(
      `/consumption`,
      consumptionData
    );
    return response.data;
  },

  getFoodItems: async () => {
    const response = await api.get("/food-items"); // Adjust the endpoint as necessary
    if (!response.data) {
      throw new Error("Failed to fetch food items");
    }
    console.log(response.data);
    return response.data; // Ensure this returns an array of FoodItem objects
  },

  submitFeedback: async (feedbackData: FeedbackData) => {
    const response = await api.post("/feedback", feedbackData);
    if (!response.data) {
      throw new Error("Failed to submit feedback");
    }
    return response.data;
  },

  getMenuItems: async (date: string, mealType: string) => {
    const response = await api.get(
      `/menu-items?date=${date}&mealType=${mealType}`
    );
    if (!response.data) {
      throw new Error("Failed to fetch menu items");
    }
    return response.data;
  },

  createHolidaySchedule: async (holidayData: HolidaySchedule) => {
    const response = await api.post("/holiday-schedule", holidayData);
    if (!response.data) {
      throw new Error("Failed to create holiday schedule");
    }
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout"); // Assuming there's an endpoint for logging out
    localStorage.removeItem("auth");
    window.location.reload(); // So that every component can re-render
    window.location.href = "/";
  },

  getConsumptionRecords: async (): Promise<ConsumptionRecord[]> => {
    const response = await api.get(`/consumption`);
    if (!response.data) {
      throw new Error("Failed to fetch consumption records");
    }
    return response.data;
  },

  getFeedbacks: async (
    start_date: string,
    end_date: string,
    meal_type?: string,
    student_id?: string
  ): Promise<FeedbackData[]> => {
    // Create an array to hold query parameters
    const params: any = {};

    // Add parameters only if they are provided
    if (start_date) {
      params.start_date = start_date;
    }
    if (end_date) {
      params.end_date = end_date;
    }
    if (meal_type) {
      params.meal_type = meal_type;
    }
    if (student_id) {
      params.student_id = student_id;
    }

    // Make the API call with query parameters
    const response = await api.get(`/feedback`, { params });

    if (!response.data) {
      throw new Error("Failed to fetch feedback");
    }
    return response.data;
  },

  getReports: async (params?: {
    start_date?: string;
    end_date?: string;
    report_name?: string;
  }): Promise<Report[]> => {
    const response = await api.get("/reports", { params });
    return response.data;
  },

  // Download a specific report
  downloadReport: async (reportId: number): Promise<Blob> => {
    try {
      const response = await api.get(`/reports/${reportId}/download`, {
        responseType: "blob",
        // Remove the Accept header as it might be causing issues
        // headers: {
        //   Accept: 'application/pdf',
        // },
      });

      // Get the content type from the response
      const contentType =
        response.headers?.["content-type"] ||
        response.headers?.["Content-Type"];
      console.log("Response Content-Type:", contentType);
      console.log("Response data:", response.data);

      // If we got a JSON response (error message)
      if (contentType?.includes("application/json")) {
        // Convert blob to text to read the error message
        const text = await response.data.text();
        const error = JSON.parse(text);
        throw new Error(error.message || "Server returned JSON instead of PDF");
      }

      // Create blob regardless of content type
      const blob = new Blob([response.data]);

      // Log blob details for debugging
      console.log("Created blob:", {
        size: blob.size,
        type: blob.type,
      });

      return blob;
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    }
  },
};
