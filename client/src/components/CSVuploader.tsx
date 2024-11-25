import React, { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Define a type for your record
interface CsvRecord {
  month_year: string;
  week: string;
  breakfast_items: string;
  breakfast_kg: string;
  lunch_items: string;
  lunch_kg: string;
  dinner_items: string;
  dinner_kg: string;
}

const CsvUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 30;

  const queryClient = useQueryClient();

  const { data: records, isLoading, error } = useQuery<CsvRecord[]>({
    queryKey: ['csvRecords'],
    queryFn: async () => {
      const response = await api.get('/upload/csv_records');
      return response.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/upload/upload_csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csvRecords'] }); 
      alert('File uploaded successfully!');
      setFile(null);
    },
    onError: (error) => {
      console.error('Error uploading file:', error);
      alert('Error uploading file.');
    },
  });

  // Memoized pagination logic
  const paginatedRecords = useMemo(() => {
    if (!records) return [];
    
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return records.slice(startIndex, endIndex);
  }, [records, currentPage]);

  // Total pages calculation
  const totalPages = useMemo(() => {
    if (!records) return 0;
    return Math.ceil(records.length / recordsPerPage);
  }, [records]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert('Please select a CSV file to upload.');
      return;
    }
    uploadMutation.mutate(file);
  };

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Render page numbers
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    // Calculate range of page numbers to show
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust if we're near the start or end
    if (endPage - startPage + 1 < maxPagesToShow) {
      if (currentPage < totalPages / 2) {
        endPage = Math.min(totalPages, maxPagesToShow);
      } else {
        startPage = Math.max(1, totalPages - maxPagesToShow + 1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`
            px-4 py-2 rounded 
            ${currentPage === i 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-200 text-blue-800 hover:bg-blue-300'
            }
          `}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  if (isLoading) {
    return <div className="text-center">Loading records...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error fetching records: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">CSV Uploader</h1>
      
      <div className="mb-4 flex items-center space-x-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="border border-gray-300 rounded-lg p-2 flex-grow"
        />
        <button
          onClick={handleUpload}
          disabled={uploadMutation.status === 'pending'}
          className={`
            py-2 px-4 rounded 
            ${uploadMutation.status === 'pending' 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
            }
          `}
        >
          {uploadMutation.status === 'pending' ? 'Uploading...' : 'Upload CSV'}
        </button>
      </div>

      {uploadMutation.status === 'pending' && (
        <div className="flex justify-center items-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          <span className="ml-2">Uploading file...</span>
        </div>
      )}

      <h2 className="text-xl font-semibold mt-6 mb-2">
        Saved Records ({records?.length || 0} total)
      </h2>
      
      <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">Month/Year</th>
            <th className="py-2 px-4 border-b">Week</th>
            <th className="py-2 px-4 border-b">Breakfast Items</th>
            <th className="py-2 px-4 border-b">Breakfast (kg)</th>
            <th className="py-2 px-4 border-b">Lunch Items</th>
            <th className="py-2 px-4 border-b">Lunch (kg)</th>
            <th className="py-2 px-4 border-b">Dinner Items</th>
            <th className="py-2 px-4 border-b">Dinner (kg)</th>
          </tr>
        </thead>
        <tbody>
          {paginatedRecords.length > 0 ? (
            paginatedRecords.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{record.month_year}</td>
                <td className="py-2 px-4 border-b">{record.week}</td>
                <td className="py-2 px-4 border-b">{record.breakfast_items}</td>
                <td className="py-2 px-4 border-b">{record.breakfast_kg}</td>
                <td className="py-2 px-4 border-b">{record.lunch_items}</td>
                <td className="py-2 px-4 border-b">{record.lunch_kg}</td>
                <td className="py- 2 px-4 border-b">{record.dinner_items}</td>
                <td className="py-2 px-4 border-b">{record.dinner_kg}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center py-4">No records found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            px-4 py-2 rounded 
            ${currentPage === 1 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
            }
          `}
        >
          Previous
        </button>

        {renderPageNumbers()}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            px-4 py-2 rounded 
            ${currentPage === totalPages 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
            }
          `}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CsvUploader;