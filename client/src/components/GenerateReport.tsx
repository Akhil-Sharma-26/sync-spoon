// src/components/GenerateReports.tsx
import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService'; // Adjust the path as necessary

const GenerateReports: React.FC = () => {
  const mutation = useMutation(() => authService.generateReports(), {
    onSuccess: (data:any) => {
      alert(data.message || 'Reports generated successfully!');
    },
    onError: (error: any) => {
      alert(`Error: ${error.message || 'Failed to generate reports'}`);
    },
  });

  const handleGenerateReports = () => {
    mutation.mutate();
  };

  return (
    <div>
      <h2>Generate Reports</h2>
      <button onClick={handleGenerateReports} disabled={mutation.status === 'pending'}>
        {mutation.status === 'pending' ? 'Generating...' : 'Generate Reports'}
      </button>
      {mutation.isError && (
        <p className="error-message">An error occurred: {mutation.error.message}</p>
      )}
    </div>
  );
};

export default GenerateReports;