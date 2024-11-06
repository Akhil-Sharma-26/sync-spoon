// hooks/useFeedback.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackService } from '../services/feedBackService';
import { FeedbackData, FeedbackResponse, ApiError } from '../types';

const QUERY_KEYS = {
  TODAY_MENU: ['todayMenu']
} as const;

export const useFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation<FeedbackResponse, ApiError, FeedbackData>({
    mutationFn: (data) => feedbackService.submitFeedback(data),
    
    onSuccess: () => {
      // Invalidate and refetch menu data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TODAY_MENU });
    },
    
    onError: (error) => {
      console.error('Failed to submit feedback:', error);
    }
  });
};