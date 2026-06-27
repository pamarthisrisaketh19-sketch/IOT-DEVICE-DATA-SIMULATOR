import React, { useState, useEffect, useRef } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { Code, Terminal, Play, Pause, Sliders, Copy, Check } from 'lucide-react';

export default function DeveloperDashboard() {
  const { 
    isSimulating, 
    setIsSimulating, 
    simulationSpeed, 
    setSimulationSpeed, 
    readings 
  } = useSimulator();

  const [copiedIndex, setCopiedIndex] = useState(null);
  const terminalEndRef = useRef(null);

  // Auto scroll terminal to bottom when new readings come in
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [readings.length]);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Code snippets for developer integration
  const codeSnippets = [
    {
      language: 'cURL / Shell',
      code: `curl -X POST https://api.telemetryhub.iot/v1/simulations \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer \$API_KEY" \\
  -d '{
    "deviceId": "boiler-01",
    "metrics": {
      "temperature": 72.5,
      "humidity": 42.0,
      "voltage": 12.18
    },
    "gps": {
      "lat": 37.7749,
      "lng": -122.4194
    }
  }'`
    },
    {
      language: 'Node.js',
      code: `const axios = require('axios');

const sendTelemetry = async (deviceId, temp, humidity, voltage) => {
  try {
    const res = await axios.post('https://api.telemetryhub.iot/v1/simulations', {
      deviceId,
      metrics: { temperature: temp, humidity, voltage },
      gps: { lat: 37.7749, lng: -122.4194 }
    }, {
      headers: { 'Authorization': 'Bearer ' + process.env.API_KEY }
    });
    console.log('Telemetry ingested:', res.data.messageId);
  } catch (err) {
    console.error('Ingestion failed:', err.message);
  }
};`
    },
    {
      language: 'Python',
      code: `import requests
import json

def send_telemetry(device_id, temp, humidity, voltage):
    url = "https://api.telemetryhub.iot/v1/simulations"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_API_KEY"
    }
    payload = {
        "deviceId": device_id,
        "metrics": {"temperature": temp, "humidity": humidity, "voltage": voltage},
        "gps": {"lat": 37.7749, "lng": -122.4194}
      }
    
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    print(f"Status Code: {response.status_code}, Response: {response.json()}")`
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Simulation Controls */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f]">
        <h3 className="mb-4 text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Sliders className="h-5 w-5 text-blue-500" />
          Simulator Clock Frequency Controls
        </h3>
        
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Adjust how fast the virtual nodes generate new JSON payloads. Faster ticks simulate higher load.
            </p>
            <div className="text-sm font-semibold">
              Current tick rate: <span className="font-mono text-blue-600 dark:text-blue-400">{simulationSpeed / 1000} seconds</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 2. Interactive Terminal Feed */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f] flex flex-col justify-between h-[520px]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-emerald-500" />
                Raw MQTT/PubSub Payload Stream
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Streaming</span>
              </div>
            </div>
            <p className="mb-4 text-xs text-zinc-500">Live JSON packages generated by simulator loops, formatted for GCP BigQuery ingestion.</p>
          </div>

          {/* Terminal output box */}
          <div className="flex-1 overflow-y-auto rounded-lg bg-zinc-950 p-4 font-mono text-[11px] leading-relaxed text-emerald-400 border border-zinc-800 shadow-inner">
            <div className="space-y-4">
              {readings.slice(-10).map((r, i) => (
                <div key={r.id || i} className="border-b border-zinc-900 pb-2">
                  <span className="text-zinc-500">// {r.timestamp} - Node: {r.deviceId}</span>
                  <pre className="text-zinc-300 overflow-x-auto mt-1">
                    {JSON.stringify({
                      event_id: r.id,
                      device_id: r.deviceId,
                      device_name: r.deviceName,
                      metrics: {
                        temperature: r.temperature,
                        humidity: r.humidity,
                        voltage: r.voltage
                      },
                      gps: {
                        latitude: parseFloat(r.lat.toFixed(6)),
                        longitude: parseFloat(r.lng.toFixed(6))
                      },
                      status: r.status,
                      owner: r.owner,
                      timestamp_epoch: r.timeMs
                    }, null, 2)}
                  </pre>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>

        {/* 3. Developer Integration Snippets */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f] flex flex-col h-[520px]">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Code className="h-5 w-5 text-purple-500" />
              API Data Integration Templates
            </h3>
            <p className="mb-4 text-xs text-zinc-500">Use these code samples to forward simulated streams to custom webhooks or GCP databases.</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {codeSnippets.map((snippet, idx) => (
              <div key={idx} className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-950/40">
                <div className="bg-zinc-100 dark:bg-zinc-900 px-4 py-2 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{snippet.language}</span>
                  <button 
                    onClick={() => copyToClipboard(snippet.code, idx)}
                    className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <pre className="p-4 font-mono text-[10.5px] leading-relaxed text-zinc-800 dark:text-zinc-300 overflow-x-auto">
                  {snippet.code}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
