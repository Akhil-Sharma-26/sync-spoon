import React, { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaFilePdf, FaSpinner } from "react-icons/fa";

const ReportGenerator: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false);
  const [downloadLink, setDownloadLink] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleGenerateReport = async () => {
    setLoading(true);
    setDownloadLink("");
    setError("");

    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post<{ download_link: string }>(
        "https://people-yesterday-comments-dialog.trycloudflare.com/generate_report",
        {
          start_date: startDate.toLocaleDateString("en-GB"),
          end_date: endDate.toLocaleDateString("en-GB"),
        }
      );

      setDownloadLink(response.data.download_link);
    } catch (error) {
      console.error("Error generating report:", error);
      setError("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (downloadLink: string) => {
    setDownloadLoading(true);
    setError("");

    try {
      const response = await axios({
        url: `https://people-yesterday-comments-dialog.trycloudflare.com/${downloadLink}`,
        method: "GET",
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `report_${startDate?.toLocaleDateString('en-GB')}_to_${endDate?.toLocaleDateString('en-GB')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading report:", error);
      setError("Failed to download report");
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Report Generator
        </h1>

        {/* Date Picker Container */}
        <div className="space-y-4 mb-6">
          {/* Start Date */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Start Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd/MM/yyyy"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Select start date"
              maxDate={endDate || undefined}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              End Date
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd/MM/yyyy"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="Select end date"
              minDate={startDate || undefined}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Generate Report Button */}
        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className={`w-full mb-4 flex items-center justify-center py-3 rounded-md transition duration-300 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Generating Report...
            </>
          ) : (
            "Generate Report"
          )}
        </button>

        {/* Download Report Button */}
        {downloadLink && (
          <button
            onClick={() => handleDownload(downloadLink)}
            disabled={downloadLoading}
            className={`w-full flex items-center justify-center py-3 rounded-md transition duration-300 ${
              downloadLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {downloadLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Downloading...
              </>
            ) : (
              <>
                <FaFilePdf className="mr-2" />
                Download Report
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportGenerator;