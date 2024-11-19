import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const CsvUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: records, isLoading, error } = useQuery({queryKey: ['csvRecords'],queryFn: async () => {
    const response = await api.get('/upload/csv_records');
    return response.data;
  }});

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
      queryClient.invalidateQueries({queryKey: ['csvRecords']}); // Invalidate and refetch
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
    return <div>Loading records...</div>;
  }

  if (error) {
    return <div>Error fetching records: {error.message}</div>;
  }

  return (
    <div>
      <h1>CSV Uploader</h1>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload CSV</button>

      <h2>Saved Records</h2>
      <table>
        <thead>
          <tr>
            <th>Month/Year</th>
            <th>Week</th>
            <th>Breakfast Items</th>
            <th>Breakfast (kg)</th>
            <th>Lunch Items</th>
            <th>Lunch (kg)</th>
            <th>Dinner Items</th>
            <th>Dinner (kg)</th>
          </tr>
        </thead>
        <tbody>
          {records.length > 0 ? (
            records.map((record:any, index:any) => (
              <tr key={index}>
                <td>{record.month_year}</td>
                <td>{record.week}</td>
                <td>{record.breakfast_items}</td>
                <td>{record.breakfast_kg}</td>
                <td>{record.lunch_items}</td>
                <td>{record.lunch_kg}</td>
                <td>{record.dinner_items}</td>
                <td>{record.dinner_kg}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8}>No records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CsvUploader;