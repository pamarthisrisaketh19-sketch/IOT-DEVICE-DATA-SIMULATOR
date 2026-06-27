const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// Test connection and initialize tables
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database Connection Failed:");
    console.error(err);
    return;
  }
  
  console.log("MySQL Connected Successfully");

  const createDevicesTable = `
    CREATE TABLE IF NOT EXISTS Devices (
      deviceId INT AUTO_INCREMENT PRIMARY KEY,
      deviceName VARCHAR(255) NOT NULL,
      deviceType VARCHAR(100) NOT NULL,
      protocol VARCHAR(100) DEFAULT 'Simulation',
      status VARCHAR(50) NOT NULL,
      temperature FLOAT NOT NULL,
      humidity FLOAT NOT NULL,
      voltage FLOAT NOT NULL,
      gps VARCHAR(100) NOT NULL
    );
  `;

  const createHistoryTable = `
    CREATE TABLE IF NOT EXISTS ProcessingHistory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      temperature FLOAT NOT NULL,
      humidity FLOAT NOT NULL,
      voltage FLOAT NOT NULL,
      latitude FLOAT NOT NULL,
      longitude FLOAT NOT NULL,
      status VARCHAR(50) NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  connection.query(createDevicesTable, (err) => {
    if (err) {
      console.error("Error creating Devices table:", err);
    } else {
      console.log("Devices table verified/created");
    }
  });

  connection.query(createHistoryTable, (err) => {
    if (err) {
      console.error("Error creating ProcessingHistory table:", err);
    } else {
      console.log("ProcessingHistory table verified/created");
    }
  });

  connection.release();
});

module.exports = pool;