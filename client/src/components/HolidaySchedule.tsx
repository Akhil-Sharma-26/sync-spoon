import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService"; // Ensure this service is implemented
import { HolidaySchedule } from "../types"; // Define this type in your types file

const HolidayScheduleForm: React.FC = () => {
  const queryClient = useQueryClient();

  // State for form inputs
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Mutation to create holiday schedule
  const mutation = useMutation<HolidaySchedule, Error, HolidaySchedule>({
    mutationFn: async (holidayData) => {
      const response = await authService.createHolidaySchedule(holidayData); // 
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidaySchedules"] }); // Update this key as needed
      setStartDate("");
      setEndDate("");
      setDescription("");
    },
    onError: (error) => {
      console.error("Error creating holiday schedule:", error);
      // Optionally, handle error feedback to the user
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create the holiday schedule object
    const holidayData: HolidaySchedule = {
      start_date: startDate,
      end_date: endDate,
      description,
    };

    // Call the mutation
    mutation.mutate(holidayData);
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create Holiday Schedule</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date:
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date:
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description:
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Create Holiday Schedule
        </button>
      </form>

      {mutation.isPending && <p className="mt-4 text-blue-600">Creating holiday schedule...</p>}

    {// TODO: Add error and success feedback, write somethings if access deniad because of role
}
      {mutation.isError && (
        <p className="mt-4 text-red-600">Error creating holiday schedule: {mutation.error.message}</p>
      )}

      {mutation.isSuccess && <p className="mt-4 text-green-600">Holiday schedule created successfully!</p>}
    </div>
  );
};

export default HolidayScheduleForm;