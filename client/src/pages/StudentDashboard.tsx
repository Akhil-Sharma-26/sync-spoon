import React, { useState, FormEvent } from "react";
import { useMenu } from "../hooks/useMenu";
import { useFeedback } from "../hooks/useFeedback";
import { FeedbackData } from "../types";
import ShowTodayMenu from "../components/ShowTodayMenu";
import { useAuthMiddleware } from "../middleware/useAuthMiddleware";
import { AlertCircle } from "lucide-react";

const StudentDashboard: React.FC = () => {
  const { user } = useAuthMiddleware();
  if (!user) return <div>You are not signed in</div>;

  const [comment, setComment] = useState<string>("");
  const [rating, setRating] = useState<number | null>(null);
  const [mealType, setMealType] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  const { data: todayMenu } = useMenu();
  const feedbackMutation = useFeedback();

  const handleFeedbackSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset previous errors
    setErrors([]);
    
    // Validation checks
    const newErrors: string[] = [];

    if (!todayMenu?.date) {
      newErrors.push("No menu available for today.");
    }

    if (!mealType) {
      newErrors.push("Please select a meal type.");
    }

    if (rating === null) {
      newErrors.push("Please provide a rating.");
    }

    if (!comment.trim()) {
      newErrors.push("Please write a comment.");
    }

    // If there are errors, don't submit
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const feedbackData: FeedbackData = {
      meal_date: todayMenu!.date,
      meal_type: mealType,
      rating: rating!,
      comment,
    };

    feedbackMutation.mutate(feedbackData, {
      onSuccess: () => {
        setComment("");
        setRating(null);
        setMealType("");
        setErrors([]);
      },
      onError: (error) => {
        setErrors([error.message]);
      },
    });
  };

  return (
    <div className="p-6 bg-gray-900 text-gray-100 min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-6 text-blue-300">Student Dashboard</h1>

      <ShowTodayMenu />

      <div className="bg-gray-800 rounded-lg shadow-md p-8 mx-auto lg:mx-96">
        <h2 className="text-2xl font-bold mb-6 text-blue-300">Submit Feedback</h2>
        
        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="w-6 h-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-300 mb-2">Please complete the form:</h3>
              <ul className="list-disc list-inside text-red-400 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleFeedbackSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="mealType"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Meal Type
            </label>
            <select
              id="mealType"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full px-3 py-2 text-gray-100 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Meal Type</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>
          
          <div>
            <label
              htmlFor="rating"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Rating
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    rating === value
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Comment
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 text-gray-100 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
              rows={4}
              placeholder="Share your thoughts..."
              disabled={feedbackMutation.status === 'pending'}
            />
          </div>

          <button
            type="submit"
            className={`w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              feedbackMutation.status === 'pending' ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={feedbackMutation.status === 'pending'}
          >
            {feedbackMutation.status === 'pending' ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Feedback"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentDashboard;