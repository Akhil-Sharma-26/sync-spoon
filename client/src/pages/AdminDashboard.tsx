import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { CSVLink } from "react-csv";
import { authService } from "../services/authService";
import { FeedbackData } from "../types";

const AdminDashboard: React.FC = () => {
  // Fetch feedback data
  const { data: feedbacks = [], isLoading: loadingFeedbacks, error: feedbackError } = useQuery<FeedbackData[]>({
    queryKey: ["feedbacks"],
    queryFn: authService.getFeedbacks,
  });

  const [filteredFeedbacks, setFilteredFeedbacks] = useState<FeedbackData[]>(feedbacks);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Number of feedbacks per page
  const [sortConfig, setSortConfig] = useState<{ key: keyof FeedbackData; direction: 'ascending' | 'descending' } | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Handle loading and error states
  if (loadingFeedbacks) {
    return <div className="text-center">Loading feedback data...</div>;
  }

  if (feedbackError) {
    return <div className="text-center text-red-500">Error loading feedback data</div>;
  }

  // Prepare data for charts
  const ratingDistribution = feedbacks.reduce((acc, feedback) => {
    acc[feedback.rating] = (acc[feedback.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const ratingData = Object.keys(ratingDistribution).map((key) => ({
    name: `Rating ${key}`,
    value: ratingDistribution[Number(key)],
  }));

  // Prepare data for feedback over time (daily)
  const feedbackByDate = feedbacks.reduce((acc, feedback) => {
    const date = new Date(feedback.meal_date).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const feedbackOverTime = Object.keys(feedbackByDate).map((key) => ({
    date: key,
    count: feedbackByDate[key],
  }));

  // Function to handle filtering
  const handleFilter = () => {
    const filtered = feedbacks.filter(feedback => {
      const feedbackDate = new Date(feedback.meal_date);
      return feedbackDate >= new Date(startDate) && feedbackDate <= new Date(endDate);
    });
    setFilteredFeedbacks(filtered);
    addNotification("Feedback filtered successfully!");
  };

  // Function to add notifications
  const addNotification = (message: string) => {
    setNotifications((prev) => [...prev, message]);
  };

  // Notify when feedback data is loaded
  useEffect(() => {
    if (feedbacks.length > 0) {
      addNotification("Feedback data loaded successfully!");
    }
  }, [feedbacks]);

  // Prepare CSV data for export
  const csvData = feedbacks.map(feedback => ({
    date: feedback.meal_date,
    rating: feedback.rating,
    comment: feedback.comment,
  }));

  // Sorting function
  const sortedFeedbacks = React.useMemo(() => {
    let sortableFeedbacks = [...filteredFeedbacks];
    if (sortConfig) {
      sortableFeedbacks.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig .key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableFeedbacks;
  }, [filteredFeedbacks, sortConfig]);

  // Pagination logic
  const indexOfLastFeedback = currentPage * itemsPerPage;
  const indexOfFirstFeedback = indexOfLastFeedback - itemsPerPage;
  const currentFeedbacks = sortedFeedbacks.slice(indexOfFirstFeedback, indexOfLastFeedback);
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);

  const handleSort = (key: keyof FeedbackData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="dashboard p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin & Mess Staff Dashboard</h1>

      {/* Display notifications */}
      {/* {notifications.map((msg, index) => (
        <Notification key={index} message={msg} type="success" />
      ))} */}

      {/* Feedback Filter */}
      <div className="mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mr-2"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mr-2"
        />
        <button onClick={handleFilter} className="bg-blue-500 text-white p-2 rounded">
          Filter
        </button>
      </div>

      {/* Export Feedback Data */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Export Feedback Data</h2>
        <CSVLink data={csvData} filename={"feedback_data.csv"} className="bg-blue-500 text-white p-2 rounded">
          Export Feedback Data
        </CSVLink>
      </section>

      {/* Feedback Ratings Distribution */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Feedback Ratings Distribution</h2>
        <div className="flex justify-center">
          <PieChart width={400} height={400}>
            <Pie
              data={ratingData}
              cx={200}
              cy={200}
              labelLine={false}
              label={(entry: any) => `${entry.name}: ${entry.value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {ratingData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </section>

      {/* Feedback Over Time */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Feedback Over Time</h2>
        <BarChart width={600} height={300} data={feedbackOverTime} className="mx-auto">
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </section>

      {/* Display All Feedbacks */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">All Feedbacks</h2>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2" onClick={() => handleSort('meal_date')}>Date</th>
              <th className="border border-gray-300 px-4 py-2" onClick={() => handleSort('rating')}>Rating</th>
              <th className="border border-gray-300 px-4 py-2">Comment</th>
            </tr>
          </thead>
          <tbody>
            {currentFeedbacks.map((feedback, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2">{new Date(feedback.meal_date).toLocaleDateString()}</td>
                <td className="border border-gray-300 px-4 py-2">{feedback.rating}</td>
                <td className="border border-gray-300 px-4 py-2">{feedback.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;