import { useState } from 'react';
import './Dashboard.css';

function Dashboard() {
  // Step 2: Create Dummy Records to verify layout
  const [records] = useState([
    { id: 1, deviceId: 'DEV-001', userName: 'Saketh', temperature: 24, humidity: 45, status: 'active', date: '2026-06-12' },
    { id: 2, deviceId: 'DEV-002', userName: 'Karthik', temperature: 31, humidity: 62, status: 'inactive', date: '2026-06-12' },
    { id: 3, deviceId: 'DEV-003', userName: 'Admin', temperature: '-', humidity: '-', status: 'active', date: '2026-06-11' },
    { id: 4, deviceId: 'DEV-004', userName: 'Student_1', temperature: 22, humidity: 50, status: 'inactive', date: '2026-06-10' }
  ]);

  // Helper function to assign dynamic CSS classes based on status
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'badge-active';
      case 'inactive': return 'badge-inactive';
      case 'warning': return 'badge-warning';
      case 'error': return 'badge-error';
      default: return 'badge-default';
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>IoT Operations Dashboard</h2>
        <p>Live overview of simulated device data.</p>
      </div>

      {/* Data Table */}
      <div className="table-wrapper">
        <table className="device-table">
          <thead>
            <tr>
              <th>Device ID</th>
              <th>User / Owner</th>
              <th>Temp (°C)</th>
              <th>Humidity (%)</th>
              <th>Date Simulated</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="table-row">
                <td className="fw-bold">{record.deviceId}</td>
                <td>{record.userName}</td>
                <td>{record.temperature}</td>
                <td>{record.humidity}</td>
                <td>{record.date}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(record.status)}`}>
                    {record.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;