import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { ConsumptionData } from "../types";

interface FoodItem {
  id: number;
  name: string;
}

const RecordConsumption: React.FC = () => {
  const queryClient = useQueryClient();

  // State for form inputs
  const [foodItemId, setFoodItemId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [mealType, setMealType] = useState<string>("");
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]); // State for food items

  // Fetch food items
  const { data: fetchedFoodItems, isLoading: isLoadingFoodItems } = useQuery<
    FoodItem[]
  >({
    queryKey: ["foodItems"],
    queryFn: async () => {
      const response = await authService.getFoodItems(); // Ensure this method is implemented in authService
      return response as FoodItem[]; // Type assertion here
    },
  });

  useEffect(() => {
    if (fetchedFoodItems) {
      setFoodItems(fetchedFoodItems);
    }
  }, [fetchedFoodItems]);

  // Mutation to record consumption
  const mutation = useMutation<ConsumptionData, Error, ConsumptionData>({
    mutationFn: async (consumptionData) => {
      const response = await authService.recordConsumption(consumptionData);
      return response;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consumptionRecords"] });
      setFoodItemId(null);
      setQuantity("");
      setDate("");
      setMealType("");
    },
    onError: (error) => {
      console.error("Error recording consumption:", error);
      // Optionally, handle error feedback to the user
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create the consumption data object
    const consumptionData: ConsumptionData = {
      food_item_id: foodItemId!, // Ensure foodItemId is not null
      quantity: Number(quantity), // Convert string to number
      date,
      meal_type: mealType,
    };

    // Call the mutation
    mutation.mutate(consumptionData);
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Record Food Consumption</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="foodItemId" className="block text-sm font-medium text-gray-700">
            Food Item:
          </label>

          {isLoadingFoodItems ? (
            <p className="text-gray-500">Loading food items...</p>
          ) : (
            <select
              id="foodItemId"
              value={foodItemId ?? ""}
              onChange={(e) => setFoodItemId(Number(e.target.value))}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>
                Select a food item
              </option>

              {foodItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Quantity:
          </label>

          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date:
          </label>

          <input
            type ="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="mealType" className="block text-sm font-medium text-gray-700">
            Meal Type:
          </label>

          <select
            id="mealType"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>
              Select a meal type
            </option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Record Consumption
        </button>
      </form>

        {mutation.isPending && <p className="mt-4 text-blue-600">Recording consumption...</p>}

      {mutation.isError && (
        <p className="mt-4 text-red-600">Error recording consumption: {mutation.error.message}</p>
      )}

      {mutation.isSuccess && <p className="mt-4 text-green-600">Consumption recorded successfully!</p>}
    </div>
  );
};

export default RecordConsumption;