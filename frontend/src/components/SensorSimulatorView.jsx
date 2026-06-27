import React, { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Play, 
  Pause,
  Send, 
  Trash2, 
  Power, 
  AlertOctagon, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Zap, 
  Sliders,
  Clock,
  FileDown
} from 'lucide-react';

export default function SensorSimulatorView() {
  const { 
    devices, 
    readings, 
    triggerManualSimulation, 
    updateDeviceStatus,
    deleteDevice,
    isSimulating,
    setIsSimulating,
    simulationSpeed,
    setSimulationSpeed
  } = useSimulator();

  // Local form state
  const [selectedDeviceId, setSelectedDeviceId] = useState(devices[0]?.id || '');

  const handleDelete = (deviceId) => {
    deleteDevice(deviceId);
    if (selectedDeviceId === deviceId) {
      const remaining = devices.filter(d => d.id !== deviceId);
      setSelectedDeviceId(remaining[0]?.id || '');
    }
  };
  const [temp, setTemp] = useState('25');
  const [humidity, setHumidity] = useState('50');
  const [voltage, setVoltage] = useState('12.0');
  const [lat, setLat] = useState('37.7749');
  const [lng, setLng] = useState('-122.4194');
  const [deviceStatus, setDeviceStatus] = useState('active');

  // Handle device change to pre-fill standard coordinates
  const handleDeviceChange = (e) => {
    const id = e.target.value;
    setSelectedDeviceId(id);
    const dev = devices.find(d => d.id === id);
    if (dev) {
      setTemp(dev.temp.toString());
      setHumidity(dev.humidity.toString());
      setVoltage(dev.voltage.toString());
      setLat(dev.lat.toFixed(4));
      setLng(dev.lng.toFixed(4));
      setDeviceStatus(dev.status);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    triggerManualSimulation(selectedDeviceId, {
      temp: parseFloat(temp),
      humidity: parseFloat(humidity),
      voltage: parseFloat(voltage),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      status: deviceStatus
    });
  };

  // Export all current readings to a formatted PDF
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const now = new Date().toLocaleString();

    // Header
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text('TelemetryHub — Generated Readings Log', 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Exported: ${now}  |  Total Records: ${readings.length}`, 14, 23);

    // Table
    autoTable(doc, {
      startY: 28,
      head: [['Source', 'Status', 'Priority', 'Owner', 'Temp (°C)', 'Humidity (%)', 'Voltage (V)', 'GPS (Lat, Lng)', 'Timestamp', 'Type']],
      body: readings.slice(-50).reverse().map(r => [
        r.deviceName,
        r.status,
        r.priority,
        r.owner,
        r.temperature,
        r.humidity,
        r.voltage,
        `${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}`,
        r.timestamp,
        r.isManual ? 'Mock' : 'Auto'
      ]),
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7.5, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { cellPadding: 2.5, overflow: 'linebreak' },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          const status = data.cell.raw;
          if (status === 'critical') data.cell.styles.textColor = [220, 38, 38];
          else if (status === 'warning') data.cell.styles.textColor = [217, 119, 6];
          else if (status === 'active') data.cell.styles.textColor = [22, 163, 74];
        }
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text(`TelemetryHub IoT Simulator  |  Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 8);
    }

    doc.save(`telemetryhub-readings-${Date.now()}.pdf`);
  };

  // Export all current readings to a formatted CSV
  const exportToCSV = () => {
    const csvRows = [
      ["Source", "Status", "Priority", "Owner", "Temperature (°C)", "Humidity (%)", "Voltage (V)", "GPS (Lat Lng)", "Timestamp", "Type"]
    ];

    readings.slice().reverse().forEach((r) => {
      csvRows.push([
        r.deviceName,
        r.status,
        r.priority,
        r.owner,
        r.temperature,
        r.humidity,
        r.voltage,
        `"${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}"`,
        r.timestamp,
        r.isManual ? "Mock" : "Auto"
      ]);
    });

    const csvContent = csvRows
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `telemetryhub-readings-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      {/* 0. Simulator Clock Frequency Controls */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f]">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
          <Clock className="h-4.5 w-4.5" />
          Simulator Clock Frequency Controls
        </h3>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Info + current tick rate */}
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Adjust how fast virtual nodes generate new telemetry payloads. Faster ticks simulate higher sensor load.
            </p>
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Current tick rate:{' '}
              <span className="font-mono text-blue-600 dark:text-blue-400">
                {simulationSpeed / 1000}s
              </span>
              {' '}— simulator is{' '}
              <span className={isSimulating ? 'text-emerald-500' : 'text-rose-500'}>
                {isSimulating ? 'RUNNING' : 'PAUSED'}
              </span>
            </div>
          </div>

          {/* Speed buttons + play/pause */}
          <div className="flex items-center gap-2 flex-wrap">
            {[1000, 2000, 3000, 5000, 10000].map((speed) => (
              <button
                key={speed}
                onClick={() => setSimulationSpeed(speed)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm border transition-all ${
                  simulationSpeed === speed
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800'
                }`}
              >
                {speed / 1000}s
              </button>
            ))}

            <button
              onClick={() => setIsSimulating(prev => !prev)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border shadow-sm transition-all ${
                isSimulating
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40'
              }`}
            >
              {isSimulating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isSimulating ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f]">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
          <Sliders className="h-4.5 w-4.5" />
          Hardware Simulation Controller
        </h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {devices.map(dev => (
            <div 
              key={dev.id} 
              className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${
                dev.status === 'critical' 
                  ? 'border-red-200 bg-red-50/10 dark:border-red-950/20' 
                  : dev.status === 'warning' 
                  ? 'border-amber-200 bg-amber-50/10 dark:border-amber-950/20'
                  : dev.status === 'inactive'
                  ? 'border-zinc-200 bg-zinc-50/20 dark:border-zinc-800/20'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0f]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">{dev.id}</span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    dev.status === 'critical'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                      : dev.status === 'warning'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      : dev.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {dev.status}
                  </span>
                </div>
                <h4 className="mt-1 font-bold text-zinc-800 dark:text-zinc-100 truncate text-sm">{dev.name}</h4>
                <p className="text-xs text-zinc-400">Owner: {dev.owner}</p>
              </div>

              {/* Action Buttons to control individual device status */}
              <div className="flex items-center gap-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <button
                  onClick={() => updateDeviceStatus(dev.id, dev.status === 'inactive' ? 'active' : 'inactive')}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    dev.status === 'inactive'
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                  title={dev.status === 'inactive' ? 'Power On Device' : 'Shut Down Device'}
                >
                  <Power className="h-3.5 w-3.5" />
                  <span>{dev.status === 'inactive' ? 'Power On' : 'Shut Down'}</span>
                </button>

                <button
                  onClick={() => updateDeviceStatus(dev.id, dev.status === 'critical' ? 'active' : 'critical')}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    dev.status === 'critical'
                      ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                      : 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900/30'
                  }`}
                  title={dev.status === 'critical' ? 'Clear Alert' : 'Inject Hardware Fault'}
                >
                  <AlertOctagon className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(dev.id)}
                  className="px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900/30"
                  title="Delete Device Node"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 2. Manual Simulation Form (1/3 width) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f]">
          <h3 className="mb-4 text-base font-bold text-zinc-900 dark:text-zinc-50">Trigger Simulation</h3>
          <p className="mb-4 text-xs text-zinc-500">Inject custom sensor states directly into the data pipelines to bypass physical nodes.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Device selection */}
            <div>
              <label className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">Target IoT Node</label>
              <select
                value={selectedDeviceId}
                onChange={handleDeviceChange}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {devices.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                ))}
              </select>
            </div>

            {/* Temperature */}
            <div>
              <label className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Thermometer className="h-3.5 w-3.5 text-red-500" />
                Temperature (°C)
              </label>
              <input
                type="number"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                step="any"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Humidity */}
            <div>
              <label className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Droplets className="h-3.5 w-3.5 text-blue-500" />
                Humidity (%)
              </label>
              <input
                type="number"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                step="any"
                min="0"
                max="100"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Voltage */}
            <div>
              <label className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Voltage (V)
              </label>
              <input
                type="number"
                value={voltage}
                onChange={(e) => setVoltage(e.target.value)}
                step="any"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* GPS coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  Latitude
                </label>
                <input
                  type="number"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  step="any"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  Longitude
                </label>
                <input
                  type="number"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  step="any"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm font-semibold shadow-sm transition-all"
            >
              <Send className="h-4 w-4" />
              Inject Simulated Signal
            </button>
          </form>
        </div>

        {/* 3. Generated Readings Table (2/3 width) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm lg:col-span-2 dark:border-zinc-800 dark:bg-[#0c0c0f] flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Generated Readings Log</h3>
                <p className="text-xs text-zinc-500">Live feed of physical and mock telemetry data points</p>
              </div>
              <div className="flex gap-2">
                {/* Export to CSV button */}
                <button
                  onClick={exportToCSV}
                  disabled={readings.length === 0}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 px-3 py-1.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Export all readings to CSV"
                >
                  <FileDown className="h-3.5 w-3.5 text-emerald-500" />
                  Export CSV
                </button>
                {/* Export to PDF button */}
                <button
                  onClick={exportToPDF}
                  disabled={readings.length === 0}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 px-3 py-1.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Export all readings to PDF"
                >
                  <FileDown className="h-3.5 w-3.5 text-blue-500" />
                  Export PDF
                </button>
              </div>
            </div>

            {readings.length > 0 && (
              <div className="mb-4 rounded-lg bg-blue-50/30 p-3 border border-blue-100/50 dark:bg-blue-950/10 dark:border-blue-900/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400">Latest Live Signal:</span>
                  <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                    {readings[readings.length - 1].deviceName}
                  </span>
                  <span className={`inline-flex rounded-full px-1.5 py-0.2 text-[8px] font-bold uppercase ${
                    readings[readings.length - 1].status === 'critical'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                      : readings[readings.length - 1].status === 'warning'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                  }`}>
                    {readings[readings.length - 1].status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                  <span>Temp: <strong className="text-zinc-900 dark:text-zinc-100">{readings[readings.length - 1].temperature}°C</strong></span>
                  <span>Hum: <strong className="text-zinc-900 dark:text-zinc-100">{readings[readings.length - 1].humidity}%</strong></span>
                  <span>Volt: <strong className="text-zinc-900 dark:text-zinc-100">{readings[readings.length - 1].voltage}V</strong></span>
                  <span>Time: <strong>{readings[readings.length - 1].timestamp}</strong></span>
                </div>
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-400">
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-4 py-3 font-semibold">Source</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Priority</th>
                    <th className="px-4 py-3 font-semibold">Owner</th>
                    <th className="px-4 py-3 font-semibold">Sensor Metrics</th>
                    <th className="px-4 py-3 font-semibold">GPS</th>
                    <th className="px-4 py-3 font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850 text-zinc-800 dark:text-zinc-200">
                  {readings.slice(-8).reverse().map((reading) => (
                    <tr 
                      key={reading.id} 
                      className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                        reading.isManual ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold font-mono">
                        {reading.deviceName}
                        {reading.isManual && (
                          <span className="ml-1.5 rounded bg-blue-100 px-1 py-0.2 text-[8px] font-bold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            Mock
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                          reading.status === 'critical'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                            : reading.status === 'warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            : reading.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                          {reading.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                          reading.priority === 'critical' || reading.priority === 'high'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : reading.priority === 'medium'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {reading.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{reading.owner}</td>
                      <td className="px-4 py-3 space-y-0.5">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="text-zinc-400">T:</span>
                          <span className={reading.temperature > 80 ? 'text-red-500 font-bold' : ''}>
                            {reading.temperature}°C
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="text-zinc-400">H:</span>
                          <span className={reading.humidity > 85 ? 'text-amber-500 font-bold' : ''}>
                            {reading.humidity}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="text-zinc-400">V:</span>
                          <span className={reading.voltage < 11.5 && reading.voltage > 0 ? 'text-yellow-600 font-bold' : ''}>
                            {reading.voltage}V
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                        {reading.lat.toFixed(4)}, {reading.lng.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                        {reading.timestamp}
                      </td>
                    </tr>
                  ))}
                  {readings.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-zinc-500">
                        No readings available. Start the simulation.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-4 border-t border-zinc-150 pt-4 flex items-center justify-between text-xs text-zinc-500">
            <span>Showing last 8 generated logs</span>
            <span>Total stored: {readings.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
