import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { HolidaySchedule } from "../types";
import { Calendar, ClockIcon } from "lucide-react";

const HolidayScheduleForm: React.FC = () => {
  const queryClient = useQueryClient();

  // State for form inputs
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Mutation to create holiday schedule
  const mutation = useMutation<HolidaySchedule, Error, HolidaySchedule>({
    mutationFn: async (holidayData) => {
      const response = await authService.createHolidaySchedule(holidayData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidaySchedules"] });
      setStartDate("");
      setEndDate("");
      setDescription("");
    },
    onError: (error) => {
      console.error("Error creating holiday schedule:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const holidayData: HolidaySchedule = {
      start_date: startDate,
      end_date: endDate,
      description,
    };

    mutation.mutate(holidayData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-lg p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 relative overflow-hidden">
        {/* Decorative Gradient Background */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        <div className="flex items-center mb-6">
          <Calendar className="w-8 h-8 text-blue-400 mr-3" />
          <h2 className="text-3xl font-bold text-blue-300">Create Holiday Schedule</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="block w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="block w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="block w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter holiday schedule details..."
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md 
            hover:bg-blue-700 transition-colors duration-300 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {mutation.isPending ? (
              <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Create Holiday Schedule"
            )}
          </button>
        </form>

        {mutation.isError && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-600 rounded-md text-red-300">
            <p>Error creating holiday schedule: {mutation.error.message}</p>
          </div>
        )}

        {mutation.isSuccess && (
          <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded-md text-green-300">
            <p>Holiday schedule created successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HolidayScheduleForm;