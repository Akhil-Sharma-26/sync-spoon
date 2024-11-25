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
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);

  // Fetch food items
  const { data: fetchedFoodItems, isLoading: isLoadingFoodItems } = useQuery<FoodItem[]>({
    queryKey: ["foodItems"],
    queryFn: async () => {
      const response = await authService.getFoodItems();
      return response as FoodItem[];
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
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const consumptionData: ConsumptionData = {
      food_item_id: foodItemId!,
      quantity: Number(quantity),
      date,
      meal_type: mealType,
    };

    mutation.mutate(consumptionData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Record Food Consumption
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="foodItemId" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Food Item
          </label>
          {isLoadingFoodItems ? (
            <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
          ) : (
            <select
              id="foodItemId"
              value={foodItemId ?? ""}
              onChange={(e) => setFoodItemId(Number(e.target.value))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
          <label 
            htmlFor="quantity" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div>
          <label 
            htmlFor="date" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div>
          <label 
            htmlFor="mealType" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Meal Type
          </label>
          <select
            id="mealType"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
          className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Record Consumption
        </button>
      </form>

      {/* Status Messages */}
      <div className="mt-4">
        {mutation.isPending && (
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
            Recording consumption...
          </div>
        )}

        {mutation.isError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl">
            Error recording consumption: {mutation.error.message}
          </div>
        )}

        {mutation.isSuccess && (
          <div className="bg-green-50 text-green-600 p-3 rounded-xl">
            Consumption recorded successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordConsumption;