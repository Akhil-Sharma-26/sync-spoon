import React from "react";
import RecordConsumption from "../components/RecordConsumption"; // Import the RecordConsumption component

const MessStaffDashboard: React.FC = () => {
  return (
    <div className="dashboard p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Mess Staff Dashboard</h1>

      {/* Record Consumption Component */}
      <RecordConsumption /> {/* Allow mess staff to record food consumption */}

      {/* You can add more sections for mess staff, like viewing their records */}
    </div>
  );
};

export default MessStaffDashboard;