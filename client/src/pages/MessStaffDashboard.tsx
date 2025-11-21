import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { FeedbackData, ConsumptionData } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import RecordConsumption from "../components/RecordConsumption";
import { Link } from "react-router-dom";

const MessStaffDashboard: React.FC = () => {
  // State hooks
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<FeedbackData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Fetch feedbacks and consumption data
  const {
    data: feedbacks = [],
    isLoading: loadingFeedbacks,
    error: feedbackError,
  } = useQuery<FeedbackData[]>({
    queryKey: ["feedbacks"],
    queryFn: () => authService.getFeedbacks(startDate, endDate),
  });

  const {
    data: consumptionData = [],
    isLoading: loadingConsumption,
    error: consumptionError,
  } = useQuery<ConsumptionData[]>({
    queryKey: ["consumptionRecords"],
    queryFn: authService.getConsumptionRecords,
  });

  // Use effect to set filteredFeedbacks when feedbacks are fetched
  useEffect(() => {
    setFilteredFeedbacks(feedbacks);
  }, [feedbacks]);

  // Prepare data for charts
  const consumptionOverTime = useMemo(() => {
    return consumptionData
      .map((record) => ({
        date: new Date(record.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        totalQuantity: record.quantity,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [consumptionData]);

  // Handle filtering
  const handleFilter = () => {
    const filtered = feedbacks.filter((feedback) => {
      const feedbackDate = new Date(feedback.meal_date);
      return (
        feedbackDate >= new Date(startDate) && feedbackDate <= new Date(endDate)
      );
    });
    setFilteredFeedbacks(filtered);
  };

  // Pagination calculation
  const indexOfLastFeedback = currentPage * itemsPerPage;
  const indexOfFirstFeedback = indexOfLastFeedback - itemsPerPage;
  const currentFeedbacks = filteredFeedbacks.slice(
    indexOfFirstFeedback,
    indexOfLastFeedback
  );
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);

  // Render component
  if (loadingFeedbacks || loadingConsumption) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (feedbackError || consumptionError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-red-600">
            Error loading dashboard data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Mess Staff Dashboard
          </h1>
        </div>

        {/* Record Consumption Component */}
        <div className="mb-8">
          <RecordConsumption />
        </div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Consumption Chart */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                Food Consumption Trends
              </h2>
              <div className="flex space-x-2">
                <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-200">
                  Daily
                </button>
                <button className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600">
                  Weekly
                </button>
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consumptionOverTime}>
                  <XAxis
                    dataKey="date"
                    className="text-gray-600"
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis
                    className="text-gray-600"
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '10px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar
                    dataKey="totalQuantity"
                    fill="#3B82F6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Stats</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-semibold">Total Feedbacks</span>
                  <span className="text-2xl font-bold text-blue-700">
                    {feedbacks.length}
                  </span>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-semibold">Avg. Rating</span>
                  <span className="text-2xl font-bold text-green-700">
                    {(
                      feedbacks.reduce((acc, curr) => acc + curr.rating, 0) /
                      feedbacks.length
                    ).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Recent Feedbacks
              </h2>
              <Link
                to="/all-feedbacks"
                className="text-blue-500 hover:underline text-sm"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {currentFeedbacks.map((feedback, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {new Date(feedback.meal_date).toLocaleDateString()}
                    </span>
                    <span className={`font-semibold ${feedback.rating >= 4
                        ? "text-green-600"
                        : feedback.rating >= 3
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}>
                      Rating: {feedback.rating}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700 text-sm">
                    {feedback.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Data Management
            </h3>
            <div className="space-y-4">
              <Link
                to="/record-consumption"
                className="flex items-center bg-blue-50 p-4 rounded-xl hover:bg-blue-100 transition-colors"
              >
                Add Consumption record
              </Link>
              <Link
                to="/data-uploader"
                className="flex items-center bg-green-50 p-4 rounded-xl hover:bg-green-100 transition-colors"
              >
                Upload bulk Data
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessStaffDashboard;