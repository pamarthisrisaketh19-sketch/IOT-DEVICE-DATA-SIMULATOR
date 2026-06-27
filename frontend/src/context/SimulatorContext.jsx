import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  apiOnboardDevice,
  apiDeleteDevice,
  apiUpdateDeviceStatus,
  apiHealthCheck,
  apiGetDevices
} from "../api.js";

const SimulatorContext = createContext(null);

const DEFAULT_DEVICES = [
  { id: 'boiler-01', name: 'Industrial Boiler A', type: 'Boiler', status: 'active', priority: 'high', owner: 'Ingrid Vance', lat: 37.7749, lng: -122.4194, temp: 65, humidity: 45, voltage: 12.2 },
  { id: 'cooling-02', name: 'Cryo-Cooler Unit B', type: 'Cooler', status: 'active', priority: 'medium', owner: 'Marcus Chen', lat: 37.7833, lng: -122.4167, temp: -15, humidity: 15, voltage: 12.0 },
  { id: 'generator-03', name: 'Back-up Generator 03', type: 'Generator', status: 'warning', priority: 'critical', owner: 'Sven Lindqvist', lat: 37.7689, lng: -122.4211, temp: 82, humidity: 55, voltage: 11.4 },
  { id: 'pump-04', name: 'Water Pump Station 1', type: 'Pump', status: 'inactive', priority: 'low', owner: 'Sarah Connor', lat: 37.7711, lng: -122.4098, temp: 22, humidity: 78, voltage: 0.0 }
];

const DEFAULT_ALERT_RULES = {
  tempMax: 80,
  tempMin: -20,
  humidityMax: 85,
  humidityMin: 20,
  voltageMax: 13.5,
  voltageMin: 11.5
};

const DEFAULT_GEOFENCE = {
  enabled: true,
  centerLat: 37.7749,
  centerLng: -122.4194,
  radiusMeters: 1500 // 1.5 km
};

// Calculate distance in meters between two lat/lng points
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function SimulatorProvider({ children }) {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    async function loadDevices() {
      try {
       const response = await apiGetDevices();
console.log("Devices from backend:", response);

const formattedDevices = response.map(d => ({
  id: String(d.deviceId),
  name: d.deviceName,
  type: d.deviceType,
  status: d.status,

  temp: parseFloat(d.temperature) || 25,
  humidity: parseFloat(d.humidity) || 50,
  voltage: parseFloat(d.voltage) || 12,

  lat: parseFloat((d.gps || "37.7749,-122.4194").split(",")[0]),
  lng: parseFloat((d.gps || "37.7749,-122.4194").split(",")[1]),
  priority: "medium",
  owner: "System"
}));

        setDevices(formattedDevices);
        console.log("Formatted devices:", formattedDevices);
      } catch (err) {
        console.log("Failed to load devices", err);
      }
    }

    loadDevices();
  }, []);

  const [alertRules, setAlertRules] = useState(DEFAULT_ALERT_RULES);
  const [geofence, setGeofence] = useState(DEFAULT_GEOFENCE);
  const [isSimulating, setIsSimulating] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1000);
  const [readings, setReadings] = useState([]);
  const [feed, setFeed] = useState([]);
  const [aiInsights, setAiInsights] = useState('System is running nominally. No anomalies detected.');

  // ── DB Toast notification state ──────────────────────────────────────────
  // { type: 'success'|'error'|'info', title, message, show }
  const [dbToast, setDbToast] = useState({ show: false, type: 'success', title: '', message: '' });
  const dbToastTimerRef = useRef(null);

  const showDbToast = useCallback((type, title, message) => {
    if (dbToastTimerRef.current) clearTimeout(dbToastTimerRef.current);
    setDbToast({ show: true, type, title, message });
    dbToastTimerRef.current = setTimeout(() => {
      setDbToast(prev => ({ ...prev, show: false }));
    }, 5000);
  }, []);

  const dismissDbToast = useCallback(() => {
    if (dbToastTimerRef.current) clearTimeout(dbToastTimerRef.current);
    setDbToast(prev => ({ ...prev, show: false }));
  }, []);

  // Check backend health on mount (silent)
  useEffect(() => {
    apiHealthCheck().then(result => {
      if (result) {
        console.log('[API] Backend connected:', result);
      } else {
        console.warn('[API] Backend not reachable — running in offline mode');
      }
    });
  }, [devices]);

  const readingsRef = useRef([]);
  readingsRef.current = readings;

  // Initialize historical readings
  useEffect(() => {
    const initialHistory = [];
    const now = Date.now();
    
    // Generate 15 points of history for each device
    for (let i = 15; i >= 0; i--) {
      const timestamp = now - i * 10000; // 10 seconds apart
      devices.forEach(dev => {
        // Only active/warning devices generate history
        if (dev.status === 'inactive') return;
        
        let noiseTemp = (Math.random() - 0.5) * 2;
        let noiseHum = (Math.random() - 0.5) * 4;
        let noiseVolt = (Math.random() - 0.5) * 0.2;
        
        initialHistory.push({
          id: `${dev.id}-${timestamp}`,
          deviceId: dev.id,
          deviceName: dev.name,
          timestamp: new Date(timestamp).toLocaleTimeString(),
          timeMs: timestamp,
          temperature: parseFloat((dev.temp + noiseTemp).toFixed(1)),
          humidity: Math.max(0, Math.min(100, parseFloat((dev.humidity + noiseHum).toFixed(1)))),
          voltage: parseFloat((dev.voltage + noiseVolt).toFixed(2)),
          lat: dev.lat + (Math.random() - 0.5) * 0.002,
          lng: dev.lng + (Math.random() - 0.5) * 0.002,
          status: dev.status,
          priority: dev.priority,
          owner: dev.owner,
          alerts: []
        });
      });
    }
    
    setReadings(initialHistory);
    
    // Set initial feed events
    setFeed([
  {
    id: '1',
    timestamp: new Date(now).toLocaleTimeString(),
    type: 'info',
    message: `IoT Simulator initialized with ${devices.length} devices.`,
    deviceId: 'system'
  }
]);
  }, [devices]);

  // Check limits and geofences to produce alert messages
  const checkReadingsForAlerts = (devId, name, temp, hum, volt, lat, lng) => {
    const activeAlerts = [];
    
    if (temp > alertRules.tempMax) {
      activeAlerts.push({ type: 'temp_high', message: `Temperature (${temp}°C) exceeds max limit (${alertRules.tempMax}°C)` });
    } else if (temp < alertRules.tempMin) {
      activeAlerts.push({ type: 'temp_low', message: `Temperature (${temp}°C) falls below min limit (${alertRules.tempMin}°C)` });
    }

    if (hum > alertRules.humidityMax) {
      activeAlerts.push({ type: 'humidity_high', message: `Humidity (${hum}%) exceeds max limit (${alertRules.humidityMax}%)` });
    } else if (hum < alertRules.humidityMin) {
      activeAlerts.push({ type: 'humidity_low', message: `Humidity (${hum}%) falls below min limit (${alertRules.humidityMin}%)` });
    }

    if (volt > alertRules.voltageMax) {
      activeAlerts.push({ type: 'voltage_high', message: `Voltage (${volt}V) exceeds max limit (${alertRules.voltageMax}V)` });
    } else if (volt < alertRules.voltageMin && volt > 0.5) { // volt > 0.5 to avoid triggering warning on off/inactive pumps
      activeAlerts.push({ type: 'voltage_low', message: `Voltage (${volt}V) falls below min limit (${alertRules.voltageMin}V)` });
    }

    if (geofence.enabled) {
      const dist = getDistanceMeters(lat, lng, geofence.centerLat, geofence.centerLng);
      if (dist > geofence.radiusMeters) {
        activeAlerts.push({ type: 'geofence_violation', message: `Geofence violation: device is ${Math.round(dist)}m away from center (Max: ${geofence.radiusMeters}m)` });
      }
    }

    return activeAlerts;
  };

  // Perform simulation step
  const tickSimulation = () => {
    const timestamp = Date.now();
    const timeStr = new Date(timestamp).toLocaleTimeString();
    const newReadings = [];
    const newEvents = [];
    
    setDevices(prevDevices => {
      const updatedDevices = prevDevices.map(dev => {
        // console.log(dev.id, dev.status);
        // Inactive devices don't generate live simulation readings
        if (dev.status === 'inactive') return dev;
        
        let noiseTemp = (Math.random() - 0.5) * 1.5;
        let noiseHum = (Math.random() - 0.5) * 3;
        let noiseVolt = (Math.random() - 0.5) * 0.15;
        
        // Small GPS drift
        let noiseLat = (Math.random() - 0.5) * 0.0003;
        let noiseLng = (Math.random() - 0.5) * 0.0003;

        // Apply drift/change
        let newTemp = parseFloat((dev.temp + noiseTemp).toFixed(1));
        let newHum = Math.max(0, Math.min(100, parseFloat((dev.humidity + noiseHum).toFixed(1))));
        let newVolt = parseFloat((dev.voltage + noiseVolt).toFixed(2));
        let newLat = dev.lat + noiseLat;
        let newLng = dev.lng + noiseLng;

        // Check if there are active scenario overrides (e.g. thermal runaway)
        if (dev.scenario === 'runaway') {
          newTemp = parseFloat((dev.temp + Math.random() * 8 + 4).toFixed(1));
        } else if (dev.scenario === 'drift') {
          newLat = dev.lat + 0.0015;
          newLng = dev.lng + 0.0015;
        } else if (dev.scenario === 'grid_failure') {
          newVolt = parseFloat(Math.max(0, dev.voltage - Math.random() * 4).toFixed(2));
        }

        // Run alert detection
        const triggeredAlerts = checkReadingsForAlerts(dev.id, dev.name, newTemp, newHum, newVolt, newLat, newLng);
        
        let targetStatus = dev.status;
        if (triggeredAlerts.length > 0) {
          // Check severity of alerts
          const isGeofenceOrTemp = triggeredAlerts.some(a => a.type === 'temp_high' || a.type === 'geofence_violation');
          targetStatus = isGeofenceOrTemp ? 'critical' : 'warning';
        } else {
          targetStatus = 'active';
        }

        // Generate events if status changes or alerts occur
        triggeredAlerts.forEach(al => {
          // Throttle identical alerts to avoid spamming the timeline feed
          const isSpam = feed.slice(0, 3).some(f => f.deviceId === dev.id && f.message.includes(al.type));
          if (!isSpam) {
            newEvents.push({
              id: `${dev.id}-${al.type}-${Date.now()}-${Math.random()}`,
              timestamp: timeStr,
              type: targetStatus === 'critical' ? 'critical' : 'warning',
              message: `[Automated Alert] ${dev.name}: ${al.message}. WhatsApp ping routed to ${dev.owner}.`,
              deviceId: dev.id
            });
          }
        });

        // Add reading record
        newReadings.push({
          id: `${dev.id}-${timestamp}`,
          deviceId: dev.id,
          deviceName: dev.name,
          timestamp: timeStr,
          timeMs: timestamp,
          temperature: newTemp,
          humidity: newHum,
          voltage: newVolt,
          lat: newLat,
          lng: newLng,
          status: targetStatus,
          priority: dev.priority,
          owner: dev.owner,
          alerts: triggeredAlerts
        });

        return {
          ...dev,
          temp: newTemp,
          humidity: newHum,
          voltage: newVolt,
          lat: newLat,
          lng: newLng,
          status: targetStatus
        };
      });

      // Update readings list (capped at last 100 entries)
      setReadings(prevReadings => {
        const combined = [...prevReadings, ...newReadings];
        // Sort by timestamp ms descending
        return combined.slice(-120);
      });

      return updatedDevices;
    });

    if (newEvents.length > 0) {
      setFeed(prevFeed => [...newEvents, ...prevFeed].slice(0, 50));
    }
  };

  // Run simulation interval
  useEffect(() => {
    let intervalId = null;
    if (isSimulating) {
      intervalId = setInterval(tickSimulation, simulationSpeed);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSimulating, simulationSpeed, alertRules, geofence, feed]);

  // Generate dynamic AI Insights whenever readings or devices change
  useEffect(() => {
    if (readings.length === 0) return;

    const criticalDevices = devices.filter(d => d.status === 'critical');
    const warningDevices = devices.filter(d => d.status === 'warning');
    const inactiveDevices = devices.filter(d => d.status === 'inactive');

    let summaryText = '';
    if (criticalDevices.length > 0) {
      summaryText += `⚠️ CRITICAL: ${criticalDevices.map(d => d.name).join(', ')} require(s) immediate attention. `;
      criticalDevices.forEach(d => {
        if (d.temp > alertRules.tempMax) {
          summaryText += `Boiler temperature is currently ${d.temp}°C, exceeding limit. Automated system triggered auxiliary ventilation. WhatsApp alerts dispatched to ${d.owner}. `;
        }
        const dist = getDistanceMeters(d.lat, d.lng, geofence.centerLat, geofence.centerLng);
        if (geofence.enabled && dist > geofence.radiusMeters) {
          summaryText += `Device has drifted outside geofence boundary by ${Math.round(dist - geofence.radiusMeters)}m. Owner ${d.owner} was called automatically. `;
        }
      });
    } else if (warningDevices.length > 0) {
      summaryText += `ℹ️ Operations Alert: ${warningDevices.map(d => d.name).join(', ')} reporting warning thresholds. `;
      warningDevices.forEach(d => {
        if (d.voltage < alertRules.voltageMin) {
          summaryText += `Voltage drops detected (${d.voltage}V). Check backup battery grid. `;
        }
      });
    } else {
      summaryText += `✅ All systems running within configured parameters. Total active telemetry logs: ${devices.filter(d => d.status === 'active').length} devices reporting nominal statuses. No manual WhatsApp dispatch calls or spreadsheets syncing required. `;
    }

    setAiInsights(summaryText);
  }, [devices, alertRules, geofence, readings.length]);

  // Actions
  const triggerManualSimulation = (deviceId, values) => {
    const targetDev = devices.find(d => d.id === deviceId);
    if (!targetDev) return;

    const timestamp = Date.now();
    const timeStr = new Date(timestamp).toLocaleTimeString();

    const tempVal = parseFloat(values.temp ?? targetDev.temp);
    const humVal = parseFloat(values.humidity ?? targetDev.humidity);
    const voltVal = parseFloat(values.voltage ?? targetDev.voltage);
    const latVal = parseFloat(values.lat ?? targetDev.lat);
    const lngVal = parseFloat(values.lng ?? targetDev.lng);
    const statusVal = values.status ?? targetDev.status;

    const triggeredAlerts = checkReadingsForAlerts(deviceId, targetDev.name, tempVal, humVal, voltVal, latVal, lngVal);
    let finalStatus = statusVal;
    if (triggeredAlerts.length > 0) {
      finalStatus = triggeredAlerts.some(a => a.type === 'temp_high' || a.type === 'geofence_violation') ? 'critical' : 'warning';
    }

    // Update specific device in state
    setDevices(prev => prev.map(d => d.id === deviceId ? {
      ...d,
      temp: tempVal,
      humidity: humVal,
      voltage: voltVal,
      lat: latVal,
      lng: lngVal,
      status: finalStatus
    } : d));

    // Append manual reading log
    const manualReading = {
      id: `${deviceId}-manual-${timestamp}`,
      deviceId,
      deviceName: targetDev.name,
      timestamp: timeStr,
      timeMs: timestamp,
      temperature: tempVal,
      humidity: humVal,
      voltage: voltVal,
      lat: latVal,
      lng: lngVal,
      status: finalStatus,
      priority: targetDev.priority,
      owner: targetDev.owner,
      alerts: triggeredAlerts,
      isManual: true
    };

    setReadings(prev => [...prev, manualReading].slice(-120));

    // Log to feed
    setFeed(prev => [
      {
        id: `manual-log-${timestamp}-${Math.random()}`,
        timestamp: timeStr,
        type: triggeredAlerts.length > 0 ? (finalStatus === 'critical' ? 'critical' : 'warning') : 'success',
        message: `[Manual Trigger] Operator forced simulation reading for ${targetDev.name}. Alerts count: ${triggeredAlerts.length}.`,
        deviceId
      },
      ...prev
    ].slice(0, 50));
  };

  const updateDeviceStatus = (deviceId, newStatus) => {
    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        let updated = { ...d, status: newStatus };
        if (newStatus === 'inactive') {
          updated.voltage = 0.0;
        } else if (newStatus === 'active' && d.voltage === 0.0) {
          updated.voltage = 12.0;
          updated.temp = 45;
          updated.humidity = 50;
        }
        return updated;
      }
      return d;
    }));

    const timeStr = new Date().toLocaleTimeString();
    setFeed(prev => [
      {
       id: `status-change-${Date.now()}-${Math.random()}`,
        timestamp: timeStr,
        type: newStatus === 'inactive' ? 'info' : 'success',
        message: `Device status for ${devices.find(d => d.id === deviceId)?.name} changed to ${newStatus}.`,
        deviceId
      },
      ...prev
    ]);
  };

  const triggerScenario = (scenarioType) => {
    const timeStr = new Date().toLocaleTimeString();
    
    // Clear scenarios
    setDevices(prev => prev.map(d => ({ ...d, scenario: null })));

    if (scenarioType === 'thermal_runaway') {
      setDevices(prev => prev.map(d => d.id === 'boiler-01' ? { ...d, scenario: 'runaway' } : d));
      setFeed(prev => [
        {
          
          timestamp: timeStr,
          type: 'critical',
          message: '🚨 Workshop scenario: "Thermal Runaway" drill active on Industrial Boiler A. Temperature ramping rapidly!',
          deviceId: 'boiler-01'
        },
        ...prev
      ]);
    } else if (scenarioType === 'gps_drift') {
      setDevices(prev => prev.map(d => d.id === 'generator-03' ? { ...d, scenario: 'drift' } : d));
      setFeed(prev => [
        {
          id: `scenario-${Date.now()}`,
          timestamp: timeStr,
          type: 'critical',
          message: '🚨 Workshop scenario: "GPS Drift" drill active on Back-up Generator 03. Moving outside of geofence boundaries.',
          deviceId: 'generator-03'
        },
        ...prev
      ]);
    } else if (scenarioType === 'grid_failure') {
      setDevices(prev => prev.map(d => d.status === 'active' || d.status === 'warning' ? { ...d, scenario: 'grid_failure' } : d));
      setFeed(prev => [
        {
          id: `scenario-${Date.now()}`,
          timestamp: timeStr,
          type: 'warning',
          message: '🔌 Workshop scenario: "Power Grid Brownout" active. Voltages dropping across active telemetry nodes.',
          deviceId: 'system'
        },
        ...prev
      ]);
    } else if (scenarioType === 'clear') {
      setDevices(prev => prev.map(d => {
        const base = d;
        return {
          ...d,
          temp: base ? base.temp : d.temp,
          humidity: base ? base.humidity : d.humidity,
          voltage: base ? base.voltage : d.voltage,
          lat: base ? base.lat : d.lat,
          lng: base ? base.lng : d.lng,
          status: 'active',
          scenario: null
        };
      }));
      setFeed(prev => [
        {
          id: `scenario-clear-${Date.now()}`,
          timestamp: timeStr,
          type: 'success',
          message: '✅ Active simulation drills cleared. System levels restoring to baseline.',
          deviceId: 'system'
        },
        ...prev
      ]);
    }
  };

  const onboardDevice = async (newDevice) => {
    const deviceId = newDevice.id || `device-${Date.now().toString().slice(-4)}`;
    const freshDevice = {
      id: deviceId,
      name: newDevice.name || 'Generic Telemetry Node',
      type: newDevice.type || 'Sensor',
      status: 'active',
      priority: newDevice.priority || 'medium',
      owner: newDevice.owner || 'On-duty Engineer',
      lat: parseFloat(newDevice.lat) || 37.7749,
      lng: parseFloat(newDevice.lng) || -122.4194,
      temp: parseFloat(newDevice.temp) || 25.0,
      humidity: parseFloat(newDevice.humidity) || 50.0,
      voltage: parseFloat(newDevice.voltage) || 12.0
    };

    // Update in-memory state immediately (optimistic)
    setDevices(prev => [...prev, freshDevice]);
    setFeed(prev => [
      {
        id: `onboard-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'success',
        message: `🆕 Device ${freshDevice.name} onboarding complete. Automatic channel logs active.`,
        deviceId: freshDevice.id
      },
      ...prev
    ]);

    // Persist to MySQL via backend API
    try {
      const result = await apiOnboardDevice(freshDevice);
      showDbToast(
        'success',
        '✅ Database Updated',
        `Device "${freshDevice.name}" inserted into MySQL (ID: ${result.deviceId})`
      );
    } catch (err) {
      console.warn('[API] Onboard device DB sync failed:', err.message);
      showDbToast(
        'error',
        '⚠️ DB Sync Failed',
        `Device added locally, but MySQL update failed: ${err.message}`
      );
    }

    return freshDevice;
  };

  const deleteDevice = async (deviceId) => {
    const deviceName = devices.find(d => d.id === deviceId)?.name || deviceId;

    // Remove from in-memory state immediately (optimistic)
    setDevices(prev => prev.filter(d => d.id !== deviceId));
    setReadings(prev => prev.filter(r => r.deviceId !== deviceId));

    setFeed(prev => [
      {
        id: `delete-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'info',
        message: `❌ Device "${deviceName}" removed from registry.`,
        deviceId: 'system'
      },
      ...prev
    ]);

    // Remove from MySQL via backend API
    try {
  if (!isNaN(deviceId)) {
    const result = await apiDeleteDevice(deviceId);

    showDbToast(
      'info',
      '🗑 Database Updated',
      result.message || `Device "${deviceName}" deleted from MySQL`
    );
  }
} catch (err) {
  console.warn('[API] Delete device DB sync failed:', err.message);

  showDbToast(
    'error',
    '⚠️ DB Sync Failed',
    `Device removed locally, but MySQL delete failed: ${err.message}`
  );

    
    }
  };

  const addFeedEvent = (type, message, deviceId = 'system') => {
    const timeStr = new Date().toLocaleTimeString();
    setFeed(prev => [
      {
        id: `event-${Date.now()}-${Math.random()}`,
        timestamp: timeStr,
        type,
        message,
        deviceId
      },
      ...prev
    ].slice(0, 50));
  };

  return (
    <SimulatorContext.Provider value={{
      devices,
      alertRules,
      geofence,
      isSimulating,
      simulationSpeed,
      readings,
      feed,
      aiInsights,
      dbToast,
      setIsSimulating,
      setSimulationSpeed,
      setAlertRules,
      setGeofence,
      triggerManualSimulation,
      updateDeviceStatus,
      triggerScenario,
      onboardDevice,
      addFeedEvent,
      deleteDevice,
      showDbToast,
      dismissDbToast
    }}>
      {children}
    </SimulatorContext.Provider>
  );
}

export function useSimulator() {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error('useSimulator must be used within a SimulatorProvider');
  }
  return context;
}
