// services/feedbackService.ts
import { FeedbackData, FeedbackResponse, SubmitFeedbackFn } from '../types';
import {api} from './api';

export const feedbackService = {
  submitFeedback: async (data: FeedbackData): Promise<FeedbackResponse> => {
    const response = await api.post<FeedbackResponse>('/feedback', data);
    return response.data;
  },
};