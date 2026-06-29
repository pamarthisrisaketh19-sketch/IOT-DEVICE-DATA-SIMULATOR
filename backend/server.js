require("dotenv").config();
const path = require("path");
const https = require("https");
const nodemailer = require("nodemailer");
const generateSensorData = require("./simulator");
const express = require("express");
const cors = require("cors");
const db = require("./db");


const app = express();
app.use(cors());
app.use(express.json());



// The root route is now handled by express.static and the wildcard route below to serve the frontend.

app.post("/api/devices", (req, res) => {

  console.log("POST /api/devices hit");
  console.log(req.body);

  const {
    id,
    name,
    type,
    status,
    priority,
    owner,
    lat,
    lng,
    temp,
    humidity,
    voltage
  } = req.body;

  if (!id || !temp || !humidity || !status) {
    return res.status(400).json({
      success: false,
      message: "Required fields missing"
    });
  }

  const sql = `
INSERT INTO Devices
(deviceName, deviceType, protocol, status, temperature, humidity, voltage, gps)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

  db.query(
    sql,
    [
      name,
      type,
      "Simulation",
      status,
      temp,
      humidity,
      voltage,
      `${lat},${lng}`
    ],
    (err, result) => {
      if (err) {
        console.log("DATABASE ERROR:");
        console.log(err);

        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      res.status(201).json({
        success: true,
        message: "Device data saved successfully",
        deviceId: result.insertId
      });
    }
  );
});
app.get("/api/devices", (req, res) => {
  const { status } = req.query;

  let sql = "SELECT * FROM Devices";

  if (status) {
    sql = `SELECT * FROM Devices WHERE status='${status}'`;
  }

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(results);
  });
});

app.get("/api/history", (req, res) => {
  const sql = "SELECT * FROM ProcessingHistory";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    res.json(results);
  });
});

app.get("/api/simulate", (req, res) => {
  const sensorData = generateSensorData();
  res.json(sensorData);
});

app.post("/api/process", (req, res) => {
  const sensorData = generateSensorData();

  let alert = "Normal";
  let recommendation = "Device operating normally";

  if (sensorData.temperature > 40) {
    alert = "High Temperature Warning";
    recommendation = "Check cooling system";
  } else if (sensorData.humidity > 80) {
    alert = "High Humidity Warning";
    recommendation = "Inspect environment conditions";
  }

  const sql = `
    INSERT INTO ProcessingHistory
    (temperature, humidity, voltage, latitude, longitude, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      sensorData.temperature,
      sensorData.humidity,
      sensorData.voltage,
      sensorData.latitude,
      sensorData.longitude,
      sensorData.status
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error"
        });
      }

      res.json({
        success: true,
        message: "Sensor data processed and saved successfully",
        data: sensorData,
        alert: alert,
        recommendation: recommendation
      });
    }
  );
});




app.put("/api/devices/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = "UPDATE Devices SET status = ? WHERE deviceId = ?";

  db.query(sql, [status, id], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    res.json({
      success: true,
      message: "Status updated successfully"
    });
  });
});

app.patch("/api/devices/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = "UPDATE Devices SET status = ? WHERE deviceId = ?";

  db.query(sql, [status, id], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    res.json({
      success: true,
      message: "Status updated successfully"
    });
  });
});

app.get("/api/devices/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM Devices WHERE deviceId = ?";

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Device not found"
      });
    }

    res.json(results[0]);
  });
});

app.delete("/api/devices/:id", (req, res) => {
  const { id } = req.params;

  console.log("Deleting device:", id);

  const sql = "DELETE FROM Devices WHERE deviceId = ?";

  db.query(sql, [id], (err, result) => {

    console.log("SQL Result:", result);
    console.log("SQL Error:", err);

    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Device not found"
      });
    }

    res.json({
      success: true,
      message: "Device deleted successfully"
    });
  });
});
console.log("Email route loaded");

app.post("/api/send-email", async (req, res) => {
  try {
    const { senderEmail, recipientEmail, subjectCategory, messageBody } = req.body;
    const targetRecipient = recipientEmail || "pamarthisrisaketh19@gmail.com";
    console.log(`[API] /api/send-email hit. Target recipient: ${targetRecipient}`);

    console.log(`[API] Dispatching email via FormSubmit HTTP API to: ${targetRecipient}`);
    
    const postData = JSON.stringify({
      _subject: `[TelemetryHub] ${subjectCategory}`,
      "Sender Email": senderEmail,
      "Message": messageBody
    });

    const refererUrl = req.headers.origin || req.headers.referer || "https://iot-device-data-simulator.onrender.com";

    const options = {
      hostname: "formsubmit.co",
      port: 443,
      path: `/ajax/${targetRecipient}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Content-Length": Buffer.byteLength(postData),
        "Referer": refererUrl,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    };

    const responseBody = await new Promise((resolve, reject) => {
      const httpRequest = https.request(options, (httpResponse) => {
        let data = "";
        httpResponse.on("data", (chunk) => {
          data += chunk;
        });
        httpResponse.on("end", () => {
          resolve({
            statusCode: httpResponse.statusCode,
            body: data
          });
        });
      });

      httpRequest.on("error", (e) => {
        reject(e);
      });

      httpRequest.write(postData);
      httpRequest.end();
    });

    let result;
    try {
      result = JSON.parse(responseBody.body);
    } catch (e) {
      result = { success: "false", message: "Invalid JSON response from email provider" };
    }

    console.log("[API] FormSubmit response:", result);

    if (result.success === "false") {
      if (result.message && result.message.includes("Activation")) {
        return res.json({
          success: true,
          needsActivation: true,
          message: "Activation email sent! Please check your inbox and click 'Activate Form'."
        });
      }
      throw new Error(result.message || "Email provider error");
    }

    console.log(`[API] Email sent successfully via FormSubmit`);

    res.json({
      success: true,
      message: "Email sent successfully"
    });

  } catch (error) {
    console.error(`[API] Email sending failed:`, error);

    res.status(500).json({
      success: false,
      message: error.message || "Email sending failed"
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running"
  });
});

// Serve static files from the React frontend build
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Route all other requests to the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

