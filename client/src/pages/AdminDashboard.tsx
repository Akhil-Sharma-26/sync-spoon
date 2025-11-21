import React, { useEffect, useMemo, useState } from "react";
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
import { authService, Report } from "../services/authService";
import { FeedbackData, ConsumptionData } from "../types";
import { Link } from "react-router-dom";
import { feedbackService } from "../services/feedBackService";


const ReportsSection: React.FC = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reportName, setReportName] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [downloadingReportId, setDownloadingReportId] = useState<number | null>(
    null
  );

  const itemsPerPage = 5;

  // Fetch reports

  const {
    data: reports = [],
    isLoading,
    error,
  } = useQuery<Report[]>({
    queryKey: ["reports", startDate, endDate, reportName],
    queryFn: () =>
      authService.getReports({
        start_date: startDate,
        end_date: endDate,
        report_name: reportName,
      }),

    enabled: true, // Always fetch reports
  });

  // Handle report download
  const handleDownloadReport = async (reportId: number) => {
    setDownloadingReportId(reportId);
    try {
      const blob = await authService.downloadReport(reportId);
      console.log('Received blob:', {
        size: blob.size,
        type: blob.type
      });

      // Create URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `report_${reportId}.pdf`;

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (error) {
      console.error("Error downloading report:", error);
      alert((error as any)?.message || "Failed to download report. Please try again.");
    } finally {
      setDownloadingReportId(null);
    }
  };



  // Pagination
  const indexOfLastReport = currentPage * itemsPerPage;
  const indexOfFirstReport = indexOfLastReport - itemsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(reports.length / itemsPerPage);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Reports Management
      </h2>

      {/* Reports List */}
      {isLoading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500">Error loading reports</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Report Name</th>
                  <th className="p-3 text-left">Start Date</th>
                  <th className="p-3 text-left">End Date</th>
                  <th className="p-3 text-left">Created At</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentReports.map((report) => (
                  <tr key={report.id} className="border-b">
                    <td className="p-3">{report.report_name}</td>
                    <td className="p-3">{report.start_date}</td>
                    <td className="p-3">{report.end_date}</td>
                    <td className="p-3">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDownloadReport(report.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                        disabled={downloadingReportId === report.id}
                      >
                        {downloadingReportId === report.id
                          ? "Downloading..."
                          : "Download"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
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
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Main AdminDashboard Component
const AdminDashboard: React.FC = () => {

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
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString("en-CA")
  );
  const [endDate, setEndDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString("en-CA")
  );
  const [isFilterApplied, setIsFilterApplied] = useState<boolean>(false);

  const {
    data: feedbacks = [],
    isLoading: loadingFeedbacks,
    error: feedbackError,
  } = useQuery<FeedbackData[]>({
    queryKey: ["feedbacks", startDate, endDate],
    queryFn: () => authService.getFeedbacks(startDate, endDate)
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
  const CHART_COLORS = ["#60A5FA", "#34D399", "#F472B6", "#A78BFA", "#FBBF24"];

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

    setIsFilterApplied(true); // Set filter applied state to true

    authService.getFeedbacks(startDate, endDate)

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
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 
        border-b-2 border-blue-500"
        ></div>
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
                feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length
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
            Filter Feedback Data
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
              className="px- 6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
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

        {/* Feedback Cards */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">
              Recent Feedbacks
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {currentFeedbacks.map((feedback, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow">
                <h3 className="font-semibold text-gray-800">
                  {new Date(feedback.meal_date).toLocaleDateString()}
                </h3>
                <p
                  className={`mt-2 text-sm ${feedback.rating >= 4
                      ? "text-green-600"
                      : feedback.rating >= 3
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                >
                  Rating: {feedback.rating}
                </p>
                <p className="mt-1 text-gray-600">{feedback.comment}</p>
              </div>
            ))}
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
        {/* Data Management Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
          <h3 className="text-sm font-medium text-gray-500">Data Management</h3>
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
        {/* Reports Section */}
        <ReportsSection />
      </div>
    </div>
  );
};

export default AdminDashboard;
