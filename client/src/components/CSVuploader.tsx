import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const CsvUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: records, isLoading, error } = useQuery({
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
      queryClient.invalidateQueries({ queryKey: ['csvRecords'] }); // Invalidate and refetch
      alert('File uploaded successfully!');
    },
    onError: (error) => {
      console.error('Error uploading file:', error);
      alert('Error uploading file.');
    },
  });

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
    uploadMutation.mutate(file); // Trigger the upload mutation
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
      <div className="mb-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="border border-gray-300 rounded-lg p-2 w-full"
        />
      </div>
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors"
      >
        Upload CSV
      </button>

      <h2 className="text-xl font-semibold mt-6 mb-2">Saved Records</h2>
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
          {records.length > 0 ? (
            records.map((record: any, index: any) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{record.month_year}</td>
                <td className="py-2 px-4 border-b">{record.week}</td>
                <td className="py-2 px-4 border-b">{record.breakfast_items}</td>
                <td className="py-2 px-4 border-b">{record.breakfast_kg}</td>
                <td className="py-2 px-4 border-b">{record.lunch_items}</td>
                <td className="py-2 px-4 border-b">{record.lunch_kg}</td>
                <td className="py-2 px-4 border-b">{record.dinner_items}</td>
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
    </div>
  );
};

export default CsvUploader;