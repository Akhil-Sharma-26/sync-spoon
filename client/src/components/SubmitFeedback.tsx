import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { authService } from "../services/authService";

interface FeedbackData {
  meal_date: string;
  meal_type: string;
  rating: number;
  comment: string;
}

interface MenuItem {
  id: number;
  name: string;
  category: string; // Assuming category is also needed
}

const SubmitFeedback: React.FC = () => {
  const [mealDate, setMealDate] = useState<string>("");
  const [mealType, setMealType] = useState<string>("");
  const [rating, setRating] = useState<number>(1);
  const [comment, setComment] = useState<string>("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]); // State for menu items

  // Fetch menu items based on selected date and meal type
  const { data: fetchedMenuItems, isLoading: isLoadingMenuItems } = useQuery<MenuItem[]>({
    queryKey: ["menuItems", mealDate, mealType],
    queryFn: async () => {
      if (mealDate && mealType) {
        const response = await authService.getMenuItems(mealDate, mealType);
        return response; // Assuming this API returns an array of MenuItem
      }
      return []; // Return an empty array if date or meal type is not selected
    },
    enabled: !!mealDate && !!mealType, // Only run the query if both mealDate and mealType are set
  });

  useEffect(() => {
    if (fetchedMenuItems) {
      setMenuItems(fetchedMenuItems);
    }
  }, [fetchedMenuItems]);

  // Mutation to submit feedback
  const mutation = useMutation<FeedbackData, Error, FeedbackData>({
    mutationFn: async (feedbackData) => {
      const response = await authService.submitFeedback(feedbackData);
      return response;
    },
    onSuccess: () => {
      // Reset form fields on success
      setMealDate("");
      setMealType("");
      setRating(1);
      setComment("");
      setMenuItems([]); // Clear menu items on success
    },
    onError: (error) => {
      console.error("Error submitting feedback:", error);
      alert("Error submitting feedback: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create the feedback data object
    const feedbackData: FeedbackData = {
      meal_date: mealDate,
      meal_type: mealType,
      rating,
      comment,
    };

    // Call the mutation
    mutation.mutate(feedbackData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="max-w-lg w-full p-6 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-blue-300">Submit Meal Feedback</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="mealDate" className="block text-sm font-medium text-gray-300">
              Meal Date:
            </label>
            <input
              type="date"
              id="mealDate"
              value={mealDate}
              onChange={(e) => setMealDate(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-300"
            />
          </div>

          <div>
            <label htmlFor="mealType" className="block text-sm font-medium text-gray-300">
              Meal Type:
            </label>
            <select
              id="mealType"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-300"
            >
              <option value="">Select Meal Type</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>

          {isLoadingMenuItems && <p className="text-gray-300">Loading menu items...</p>}

          {menuItems.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-300">Menu Items:</h3>
              <table className="min-w-full border-collapse border border-gray-600 mt-2">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="border border-gray-600 p-2 text-left text-gray-300">Item</th>
                    <th className="border border-gray-600 p-2 text-left text-gray-300">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-600">
                      <td className="border border-gray-600 p-2 text-gray-300">{item.name}</td>
                      <td className="border border-gray-600 p-2 text-gray-300">{item.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-300">
              Rating:
            </label>
            <select
              id="rating"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              required
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-300"
            >
              {[1, 2, 3, 4, 5].map((rate) => (
                <option key={rate} value={rate}>
                  {rate}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-300">
              Comment:
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-300"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Submit Feedback
          </button>
        </form>

        {mutation.isPending && <p className="mt-4 text-gray-300">Submitting feedback...</p>}

        {mutation.isError && (
          <p className="mt-4 text-red-600">Error submitting feedback: {mutation.error.message}</p>
        )}

        {mutation.isSuccess && <p className="mt-4 text-green-600">Feedback submitted successfully!</p>}
      </div>
    </div>
  );
};

export default SubmitFeedback;