import React, { useState, useMemo, useEffect } from 'react';
import Papa from "papaparse";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ReactECharts from 'echarts-for-react';
import {
  useSimulator
} from '../context/SimulatorContext';
import { API_BASE } from '../api';
import {
  Server,
  Activity,
  AlertTriangle,
  Cpu,
  MessageSquare,
  Bell,
  User,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp
} from 'lucide-react';

export default function AdminDashboard({ isDark }) {
  const {
    devices,
    readings,
    feed,
    aiInsights,
    triggerManualSimulation,
    addFeedEvent,
    showDbToast
  } = useSimulator();

  const [isCoolingFanTriggered, setIsCoolingFanTriggered] = useState(false);
  const [showEmailSection, setShowEmailSection] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('ingrid.vance@telemetryhub.com');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Find Boiler A to pre-fill active temperature in message body dynamically
  const boilerDevice = devices.find(d => d.id === 'boiler-01');
  const [emailMessage, setEmailMessage] = useState('');

  // Dynamically set Email body when boilerDevice loads/updates
  useEffect(() => {
    if (boilerDevice) {
      setEmailMessage(`🚨 CRITICAL ESCALATION: Industrial Boiler A requires immediate attention! Current Temp: ${boilerDevice.temp}°C. Owner: ${boilerDevice.owner}.`);
    } else {
      setEmailMessage('🚨 CRITICAL ESCALATION: Industrial Boiler A requires immediate attention!');
    }
  }, [boilerDevice]);

  const handleTriggerCoolingFan = () => {
    triggerManualSimulation('cooling-02', {
      temp: -25.0,
      status: 'active',
      voltage: 12.0,
      humidity: 15
    });
    addFeedEvent('success', 'Operator command executed: Cooling fan 02 (Cryo-Cooler Unit B) activated manually.', 'cooling-02');
    showDbToast('success', '✅ Fan Activated', 'Cooling fan 02 triggered successfully.');
    setIsCoolingFanTriggered(true);
  };

  const handleSendEmail = () => {
    setIsSendingEmail(true);
    fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        _subject: "Critical Boiler Escalation Alert",
        "Sender Email": "pamarthisrisaketh19@gmail.com",
        "Message": emailMessage
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Email sending failed");
        return res.json();
      })
      .then((data) => {
        const isActivationNeeded = data.success === "false" && data.message && data.message.includes("Activation");
        if (isActivationNeeded) {
          alert("Activation email sent! Please check the recipient's inbox and click 'Activate Form'.");
        }
        addFeedEvent('success', `✉️ [Email Escalation] Email request sent to ${recipientEmail}`, 'boiler-01');
        showDbToast('success', '✉️ Email Dispatched', isActivationNeeded ? 'Activation email sent!' : `Escalation email sent to ${recipientEmail}.`);
        setIsSendingEmail(false);
        setShowEmailSection(false);
      })
      .catch((err) => {
        console.error(err);
        showDbToast('error', '⚠️ Email Failed', 'Escalation email sending failed.');
        setIsSendingEmail(false);
      });
  };

  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  useEffect(() => {
    if (devices.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(devices[0].id);
    }
  }, [devices, selectedDeviceId]);

  // 1. Calculate KPI Statistics
  const stats = useMemo(() => {
    const total = devices.length;
    const active = devices.filter(d => d.status === 'active' || d.status === 'warning').length;
    const critical = devices.filter(d => d.status === 'critical').length;

    // Count alerts in recent readings
    const totalAlerts = readings.reduce((acc, curr) => acc + (curr.alerts?.length || 0), 0);

    return {
      total,
      active,
      critical,
      totalAlerts
    };
  }, [devices, readings]);

  // 2. Prepare ECharts option for the selected device
  const chartOption = useMemo(() => {
    // Filter readings for the selected device, sorted by time ascending
    const deviceReadings = readings
      .filter(r => r.deviceId === selectedDeviceId)
      .slice(-15); // Show last 15 points


    console.log("selectedDeviceId:", selectedDeviceId);
    console.log("deviceReadings:", deviceReadings);

    const timestamps = deviceReadings.map(r => r.timestamp);
    const temps = deviceReadings.map(r => r.temperature);
    const humidities = deviceReadings.map(r => r.humidity);
    const voltages = deviceReadings.map(r => r.voltage);

    const textColor = isDark ? '#a1a1aa' : '#52525b';
    const gridColor = isDark ? '#27272a' : '#f4f4f5';

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#18181b' : '#ffffff',
        borderColor: isDark ? '#3f3f46' : '#e4e4e7',
        borderWidth: 1,
        textStyle: {
          color: isDark ? '#f4f4f5' : '#18181b',
          fontFamily: 'DM Sans, sans-serif'
        }
      },
      legend: {
        data: ['Temperature (°C)', 'Humidity (%)', 'Voltage (V)'],
        textStyle: {
          color: textColor,
          fontFamily: 'DM Sans, sans-serif'
        },
        bottom: 0
      },
      grid: {
        top: '12%',
        left: '4%',
        right: '4%',
        bottom: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: timestamps,
        axisLine: {
          lineStyle: {
            color: isDark ? '#3f3f46' : '#e4e4e7'
          }
        },
        axisLabel: {
          color: textColor,
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 10
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Temp & Hum',
          position: 'left',
          axisLine: {
            lineStyle: {
              color: isDark ? '#3f3f46' : '#e4e4e7'
            }
          },
          splitLine: {
            lineStyle: {
              color: gridColor
            }
          },
          axisLabel: {
            color: textColor,
            fontFamily: 'DM Sans, sans-serif'
          }
        },
        {
          type: 'value',
          name: 'Voltage (V)',
          position: 'right',
          splitLine: { show: false },
          axisLine: {
            lineStyle: {
              color: isDark ? '#3f3f46' : '#e4e4e7'
            }
          },
          axisLabel: {
            color: textColor,
            fontFamily: 'DM Sans, sans-serif'
          }
        }
      ],
      series: [
        {
          name: 'Temperature (°C)',
          type: 'line',
          data: temps,
          smooth: true,
          showSymbol: false,
          color: '#ef4444',
          lineStyle: { width: 2.5 }
        },
        {
          name: 'Humidity (%)',
          type: 'line',
          data: humidities,
          smooth: true,
          showSymbol: false,
          color: '#3b82f6',
          lineStyle: { width: 2.5 }
        },
        {
          name: 'Voltage (V)',
          type: 'line',
          yAxisIndex: 1,
          data: voltages,
          smooth: true,
          showSymbol: false,
          color: '#f59e0b',
          lineStyle: { width: 2.5 }
        }
      ]
    };
  }, [readings, selectedDeviceId, isDark]);

  const selectedDeviceName = useMemo(() => {
    return devices.find(d => d.id === selectedDeviceId)?.name || 'Device';
  }, [devices, selectedDeviceId]);

  return (
    <div className="space-y-6">
      {/* 1. Stat Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Devices */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Monitored Nodes</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              <Server className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{stats.total}</span>
            <span className="text-xs text-zinc-500">provisioned</span>
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            Replaces manual excel tracking
          </div>
        </div>

        {/* Card 2: Active Telemetry */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Active Signals</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
              <Activity className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{stats.active}</span>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              Nominal
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            No calls or radio pings pending
          </div>
        </div>

        {/* Card 3: Critical Anomalies */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Critical Alerts</span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-white ${stats.critical > 0 ? 'bg-red-500 animate-pulse' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{stats.critical}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${stats.critical > 0
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}>
              {stats.critical > 0 ? 'Active Fault' : 'Zero faults'}
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            Triggers automated routing
          </div>
        </div>

        {/* Card 4: Historical Database Log */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Log Entries</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{readings.length}</span>
            <span className="text-xs text-zinc-500">records</span>
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            Auto-purging history &gt; 120
          </div>
        </div>
      </div>

      {/* 2. Live Chart and AI Insights Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Live Chart View (2/3 width) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm lg:col-span-2 dark:border-zinc-800 dark:bg-[#0c0c0f]">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Real-Time Telemetry Trends</h3>
              <p className="text-xs text-zinc-500">Visualizing simulated data points for {selectedDeviceName}</p>
            </div>

            {/* Device selector */}
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              {devices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.id})
                </option>
              ))}
            </select>
          </div>

          <div className="h-80 w-full">
            {readings.filter(r => r.deviceId === selectedDeviceId).length > 0 ? (
              <ReactECharts
                option={chartOption}
                style={{ height: '100%', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                No active telemetry data for this node. Ensure the device status is set to active.
              </div>
            )}
          </div>
        </div>

        {/* AI Insights Panel (1/3 width) */}
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f]">
          <div>
            <div className="mb-3 flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                <MessageSquare className="h-4.5 w-4.5 text-purple-500" />
                AI Operations Copilot
              </h3>
              <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                Rule-Based
              </span>
            </div>

            {/* AI Summary Text */}
            <div className="rounded-lg bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
              {aiInsights}
            </div>
          </div>

          {/* Recommended actions list */}
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Recommended Auto-Actions</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md border border-zinc-100 p-2.5 text-xs dark:border-zinc-800 bg-white dark:bg-zinc-950/20">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="font-medium">Trigger cooling fan 02</span>
                </div>
                <button
                  onClick={handleTriggerCoolingFan}
                  disabled={isCoolingFanTriggered}
                  className={`text-[10px] font-bold ${isCoolingFanTriggered
                      ? 'text-emerald-500 cursor-default'
                      : 'text-blue-600 dark:text-blue-400 hover:underline'
                    }`}
                >
                  {isCoolingFanTriggered ? 'Executed' : 'Execute'}
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between rounded-md border border-zinc-100 p-2.5 text-xs dark:border-zinc-800 bg-white dark:bg-zinc-950/20">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="font-medium">Escalate Boiler A via Email</span>
                  </div>
                  <button
                    onClick={() => setShowEmailSection(!showEmailSection)}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {showEmailSection ? 'Hide' : 'Send'}
                  </button>
                </div>

                {showEmailSection && (
                  <div className="p-3 rounded-md border border-amber-100 bg-amber-50/30 text-xs dark:border-amber-950/20 dark:bg-amber-950/10 space-y-2">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Recipient Email Address
                      </label>
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="engineer@telemetryhub.com"
                        className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Email Message Body
                      </label>
                      <textarea
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        rows={3}
                        className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 resize-none focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleSendEmail}
                        disabled={isSendingEmail}
                        className="flex-1 rounded bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 text-[10px] font-bold transition-colors disabled:opacity-50"
                      >
                        {isSendingEmail ? 'Sending...' : 'Send Email'}
                      </button>
                      <button
                        onClick={() => setShowEmailSection(false)}
                        className="rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-700 py-1 px-2 text-[10px] font-bold dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Action History & Automation Feed */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Action History & Automation Feed</h3>
            <p className="text-xs text-zinc-500">Automated reminders and operations feed replacing manual notifications</p>
          </div>
          <Bell className="h-4.5 w-4.5 text-zinc-400" />
        </div>

        <div className="max-h-72 overflow-y-auto pr-2 space-y-3">
          {feed.length > 0 ? (
            feed.map((event) => {
              // Color mapping based on event type
              let borderClass = 'border-zinc-100 dark:border-zinc-800';
              let badgeClass = 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';

              if (event.type === 'critical') {
                borderClass = 'border-red-200 dark:border-red-950/30 bg-red-50/20 dark:bg-red-950/10';
                badgeClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
              } else if (event.type === 'warning') {
                borderClass = 'border-amber-200 dark:border-amber-950/30 bg-amber-50/20 dark:bg-amber-950/10';
                badgeClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
              } else if (event.type === 'success') {
                borderClass = 'border-emerald-200 dark:border-emerald-950/30 bg-emerald-50/20 dark:bg-emerald-950/10';
                badgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
              }

              return (
                <div
                  key={event.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border p-3 text-xs transition-colors ${borderClass}`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="text-[10px] font-mono text-zinc-400">{event.timestamp}</span>
                    <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${badgeClass}`}>
                      {event.type}
                    </span>
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">{event.message}</p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                    <User className="h-3 w-3" />
                    <span>Owner Node: {event.deviceId}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-zinc-500">
              No automation logs generated yet. Ensure simulator is active.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
