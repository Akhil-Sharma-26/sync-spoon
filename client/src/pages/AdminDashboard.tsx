import React, { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { CSVLink } from "react-csv";
import { authService } from "../services/authService";
import { FeedbackData, ConsumptionData } from "../types";
import { Link } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  // Fetch data using hooks
  const {
    data: feedbacks = [],
    isLoading: loadingFeedbacks,
    error: feedbackError,
  } = useQuery<FeedbackData[]>({
    queryKey: ["feedbacks"],
    queryFn: authService.getFeedbacks,
  });

  const {
    data: consumptionData = [],
    isLoading: loadingConsumption,
    error: consumptionError,
  } = useQuery<ConsumptionData[]>({
    queryKey: ["consumptionRecords"],
    queryFn: authService.getConsumptionRecords,
  });

  // State hooks
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<FeedbackData[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FeedbackData;
    direction: "ascending" | "descending";
  } | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Use effect to set filteredFeedbacks when feedbacks are fetched
  useEffect(() => {
    setFilteredFeedbacks(feedbacks);
  }, [feedbacks]);

  // Prepare data for charts
  // Enhanced chart colors
  const CHART_COLORS = ["#60A5FA", "#34D399", "#F472B6", "#A78BFA", "#FBBF24"];

  // Prepare data for charts with proper date formatting
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

  const ratingData = useMemo(() => {
    const distribution = feedbacks.reduce((acc, feedback) => {
      acc[feedback.rating] = (acc[feedback.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    return Object.keys(distribution).map((key) => ({
      name: `Rating ${key}`,
      value: distribution[Number(key)],
    }));
  }, [feedbacks]);

  const feedbackOverTime = useMemo(() => {
    const feedbackByDate = feedbacks.reduce((acc, feedback) => {
      const date = new Date(feedback.meal_date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(feedbackByDate).map((key) => ({
      date: key,
      count: feedbackByDate[key],
    }));
  }, [feedbacks]);

  // Handle filtering
  const handleFilter = () => {
    const filtered = feedbacks.filter((feedback) => {
      const feedbackDate = new Date(feedback.meal_date);
      return (
        feedbackDate >= new Date(startDate) && feedbackDate <= new Date(endDate)
      );
    });
    console.log("Filtered Feedbacks:", filtered); // Log filtered feedbacks
    setFilteredFeedbacks(filtered);
  };

  // Handle sorting
  const sortedFeedbacks = useMemo(() => {
    if (!sortConfig) return filteredFeedbacks;
    return [...filteredFeedbacks].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "ascending" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [filteredFeedbacks, sortConfig]);

  // Pagination calculation
  const indexOfLastFeedback = currentPage * itemsPerPage;
  const indexOfFirstFeedback = indexOfLastFeedback - itemsPerPage;
  const currentFeedbacks = sortedFeedbacks.slice(
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
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">
          Admin Dashboard
        </h1>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">
              Total Feedbacks
            </h3>
            <p className="text-2xl font-bold text-gray-800">
              {feedbacks.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">
              Average Rating
            </h3>
            <p className="text-2xl font-bold text-gray-800">
              {(
                feedbacks.reduce((acc, curr) => acc + curr.rating, 0) /
                feedbacks.length
              ).toFixed(1)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">
              Total Consumption Records
            </h3>
            <p className="text-2xl font-bold text-gray-800">
              {consumptionData.length}
            </p>
          </div>
        </div>
        {/* Consumption Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Food Consumption Trends
          </h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionOverTime}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6B7280" }}
                  tickLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  tick={{ fill: "#6B7280" }}
                  tickLine={{ stroke: "#E5E7EB" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="totalQuantity"
                  fill="#60A5FA"
                  name="Quantity"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Date Filter */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Filter Feedback
          </h2>
          <div className="flex flex-wrap gap-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleFilter}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Apply Filter
            </button>
            <CSVLink
              data={feedbacks}
              filename="feedback_data.csv"
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Export Data
            </CSVLink>
          </div>
        </div>
        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Rating Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Rating Distribution
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ratingData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ratingData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feedback Trend */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Feedback Trend
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feedbackOverTime}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="#34D399"
                    name="Feedback Count"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {/* Feedback Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">
              Recent Feedbacks
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentFeedbacks.map((feedback, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(feedback.meal_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${
                          feedback.rating >= 4
                            ? "bg-green-100 text-green-800"
                            : feedback.rating >= 3
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {feedback.rating}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {feedback.comment}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
        {/* The Data upload and menu sugeestion*/}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">
              Data Management
            </h3>
            <div className="flex space-x-4 mt-2">
              <Link
                to="/data-uploader"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Upload Data
              </Link>
              <Link
                to="/menu-suggestion"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Menu Suggestions
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
