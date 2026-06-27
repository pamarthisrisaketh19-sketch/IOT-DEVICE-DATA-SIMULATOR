import { useState } from 'react';
import './SensorForm.css'; 

function SensorForm() {
  // 1. Separate state for the User Name (Top Right)
  const [userName, setUserName] = useState('');
  const [isUserSaved, setIsUserSaved] = useState(false);

  // 2. State for the main Sensor Form
  const initialFormState = {
    deviceId: '',
    temperature: '',
    humidity: '',
    voltage: '',
    gps: '',
    status: 'active'
  };

  const [formData, setFormData] = useState(initialFormState);

  // Handle User Name input typing
  const handleUserChange = (e) => {
    setUserName(e.target.value);
    setIsUserSaved(false); // If they type a new name, remove the "Saved" checkmark
  };

  // Handle User Name save button click
  const handleSaveUser = () => {
    if (userName.trim() !== '') {
      setIsUserSaved(true);
      console.log("User locked in:", userName);
    }
  };

  // Handle main form typing (with negative humidity block)
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'humidity' && Number(value) < 0) return; 
    setFormData({ ...formData, [name]: value });
  };

  // Handle main form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Simulating Data for User:", userName || "Unknown User");
    console.log("Sensor Payload:", formData);
  };

  // Handle main form reset
  const handleReset = () => {
    setFormData(initialFormState);
  };

  return (
    <div className="dashboard-wrapper">
      
      {/* NEW: Top Navigation Bar */}
      <header className="top-navbar">
        <div className="navbar-logo">
          <h1>IoT Data Simulator</h1>
        </div>
        
        {/* User Name & Save at Top Right */}
        <div className="navbar-user-section">
          <input 
            type="text" 
            placeholder="Enter User Name" 
            value={userName} 
            onChange={handleUserChange}
            className="user-name-input"
          />
          <button 
            type="button" 
            onClick={handleSaveUser} 
            className={`save-user-btn ${isUserSaved ? 'saved-state' : ''}`}
          >
            {isUserSaved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="main-content">
        <div className="form-container">
          <h2>Device Configurator</h2>
          <p>Enter sensor readings below to generate test data.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="deviceId">Device ID <span className="required">*</span></label>
              <input type="text" id="deviceId" name="deviceId" value={formData.deviceId} onChange={handleChange} placeholder="e.g., DEV-001" required />
            </div>

            <div className="row-group">
              <div className="form-group half-width">
                <label htmlFor="temperature">Temperature (°C)</label>
                <input type="number" id="temperature" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="25" />
              </div>

              <div className="form-group half-width">
                <label htmlFor="humidity">Humidity (%)</label>
                <input type="number" id="humidity" name="humidity" value={formData.humidity} onChange={handleChange} placeholder="60" min="0" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="voltage">Voltage (V)</label>
              <input type="number" id="voltage" name="voltage" value={formData.voltage} onChange={handleChange} placeholder="3.3" step="0.1" />
            </div>

            <div className="form-group">
              <label htmlFor="gps">GPS Coordinates</label>
              <input type="text" id="gps" name="gps" value={formData.gps} onChange={handleChange} placeholder="17.3850° N, 78.4867° E" />
            </div>

            <div className="form-group">
              <label htmlFor="status">Device Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Buttons: Simulate & Reset */}
            <div className="button-group">
              <button type="submit" className="simulate-btn">Simulate Data</button>
              <button type="button" className="reset-btn" onClick={handleReset}>Reset</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default SensorForm;