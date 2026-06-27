import React, { useState, useEffect } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { 
  GraduationCap, 
  CheckCircle,
  HelpCircle,
  Home,
  Sun,
  Droplet,
  Radio,
  Sliders,
  Sparkles,
  PlusCircle,
  Zap,
  Trash2
} from 'lucide-react';

export default function TrainerPanel() {
  const { 
    devices, 
    onboardDevice, 
    triggerManualSimulation, 
    addFeedEvent,
    deleteDevice,
    triggerScenario
  } = useSimulator();


  // Mini Projects & Components Sandbox States
  const [activeDemo, setActiveDemo] = useState(null);
  
  // 1. Smart Home states
  const [homeTemp, setHomeTemp] = useState(24);
  const [homeLights, setHomeLights] = useState({ kitchen: false, livingRoom: true, bedroom: false });
  const [homeAlarm, setHomeAlarm] = useState(false);

  // 2. Solar Array states
  const [solarAngle, setSolarAngle] = useState(45);
  const [solarCleanliness, setSolarCleanliness] = useState(85);
  const [solarGridConnected, setSolarGridConnected] = useState(true);

  // 3. Fluid Tank states
  const [fluidLevel, setFluidLevel] = useState(55);
  const [inletValve, setInletValve] = useState(false);
  const [outletValve, setOutletValve] = useState(false);

  // Onboard status checks
  const isHomeOnboarded = devices.some(d => d.id === 'home-hub');
  const isSolarOnboarded = devices.some(d => d.id === 'solar-array');
  const isFluidOnboarded = devices.some(d => d.id === 'fluid-tank');

  // Real-time synchronization hooks
  
  // Smart Home updates
  useEffect(() => {
    if (isHomeOnboarded) {
      triggerManualSimulation('home-hub', {
        temp: homeTemp,
        status: homeAlarm ? 'warning' : 'active'
      });
    }
  }, [homeTemp, homeAlarm, isHomeOnboarded]);

  // Solar Array calculations and updates
  const calculateSolarOutput = () => {
    if (!solarGridConnected) return 0;
    // Optimal tilt at 45 degrees, peak wattage 250W
    const angleEfficiency = Math.max(0, 1 - Math.abs(solarAngle - 45) / 45);
    return Math.round(250 * (solarCleanliness / 100) * angleEfficiency);
  };

  const solarOutput = calculateSolarOutput();

  useEffect(() => {
    if (isSolarOnboarded) {
      // Map power output (0-250W) to voltage (e.g. 10.0V - 13.5V range)
      const voltageValue = solarGridConnected 
        ? parseFloat((10.5 + (solarOutput / 250) * 3.0).toFixed(2)) 
        : 0.0;
      triggerManualSimulation('solar-array', {
        voltage: voltageValue,
        humidity: solarCleanliness,
        temp: parseFloat((25 + (solarOutput / 250) * 15).toFixed(1))
      });
    }
  }, [solarAngle, solarCleanliness, solarGridConnected, solarOutput, isSolarOnboarded]);

  // Fluid Tank simulation ticks (every 1s)
  useEffect(() => {
    let timer = null;
    if (inletValve || outletValve) {
      timer = setInterval(() => {
        setFluidLevel(prev => {
          let change = 0;
          if (inletValve) change += 5;
          if (outletValve) change -= 5;
          const next = Math.max(0, Math.min(100, prev + change));

          if (isFluidOnboarded) {
            // Map fluid level (0-100%) to voltage (0-12.0V) and humidity
            const voltageValue = parseFloat((next * 12 / 100).toFixed(2));
            const activeFlow = (inletValve ? 15 : 0) - (outletValve ? 15 : 0);
            triggerManualSimulation('fluid-tank', {
              voltage: voltageValue,
              humidity: next,
              temp: parseFloat((20 + Math.abs(activeFlow)).toFixed(1))
            });

            // Handle alert logs
            if (next >= 95 && prev < 95) {
              addFeedEvent('critical', '🚨 [Tank Alert] Fluid Level critical high (>95%). Overflow risk detected!', 'fluid-tank');
            } else if (next <= 5 && prev > 5) {
              addFeedEvent('warning', '⚠️ [Tank Alert] Fluid Level critical low (<5%). Inlet dry-run warning.', 'fluid-tank');
            }
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [inletValve, outletValve, isFluidOnboarded]);

  // Onboard Action Handlers
  const onboardHomeHub = () => {
    onboardDevice({
      id: 'home-hub',
      name: 'Smart Home Hub',
      type: 'Sensor',
      priority: 'medium',
      owner: 'Ingrid Vance',
      lat: 37.7760,
      lng: -122.4180,
      temp: homeTemp,
      humidity: 45.0,
      voltage: 12.0
    });
    addFeedEvent('success', '🏠 Mini Project Node: "Smart Home Hub" onboarded and synced to Admin Dashboard.', 'home-hub');
  };

  const onboardSolarArray = () => {
    onboardDevice({
      id: 'solar-array',
      name: 'Solar Array Tracker',
      type: 'Generator',
      priority: 'high',
      owner: 'Marcus Chen',
      lat: 37.7720,
      lng: -122.4220,
      temp: 40.0,
      humidity: solarCleanliness,
      voltage: solarGridConnected ? 12.5 : 0.0
    });
    addFeedEvent('success', '☀️ Mini Project Node: "Solar Array Tracker" onboarded and synced to Admin Dashboard.', 'solar-array');
  };

  const onboardFluidTank = () => {
    onboardDevice({
      id: 'fluid-tank',
      name: 'Fluid Regulator Tank',
      type: 'Boiler',
      priority: 'critical',
      owner: 'Sarah Connor',
      lat: 37.7780,
      lng: -122.4120,
      temp: 20.0,
      humidity: fluidLevel,
      voltage: parseFloat((fluidLevel * 12 / 100).toFixed(2))
    });
    addFeedEvent('success', '💧 Mini Project Node: "Fluid Regulator Tank" onboarded and synced to Admin Dashboard.', 'fluid-tank');
  };

  // Interactive controls triggers
  const toggleHomeLight = (light) => {
    setHomeLights(prev => {
      const updated = { ...prev, [light]: !prev[light] };
      addFeedEvent('info', `💡 Smart Home: ${light.replace(/([A-Z])/g, ' $1')} turned ${updated[light] ? 'ON' : 'OFF'}`, 'home-hub');
      return updated;
    });
  };

  const toggleHomeAlarm = () => {
    setHomeAlarm(prev => {
      const next = !prev;
      addFeedEvent(next ? 'warning' : 'success', next ? '🚨 Smart Home Security ALARM ENABLED' : '✅ Smart Home Security Alarm Standby', 'home-hub');
      return next;
    });
  };

  const cleanSolarPanels = () => {
    setSolarCleanliness(100);
    addFeedEvent('success', '✨ Solar Array: Panels cleaned manually. Efficiency optimized to 100%', 'solar-array');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 font-sans">Workshop Trainer Panel</h3>
            <p className="text-xs text-zinc-500">Inject critical hardware error states to test operations team reaction speed and alert accuracy</p>
          </div>
        </div>
      </div>

      {/* 2. Mini Projects and Components Section */}
      <div className="space-y-4">
        <div className="border-b border-zinc-200 pb-3 dark:border-zinc-850">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Mini Projects &amp; Live Components</h4>
          <p className="text-xs text-zinc-500 mt-1">Onboard customized sub-system components and operate their widgets in real-time</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1: Smart Home */}
          <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f]">
            <div>
              <div className="relative h-44 overflow-hidden group">
                <img 
                  src="/smart_home.png?v=1"
                  alt="Smart Home preview" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Home Automation</span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Smart Home Automation</h4>
                  {isHomeOnboarded ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Synced
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-zinc-400">Offline</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Dual-state lighting, thermostat thresholds, and alarms syncing directly into operations charts.
                </p>
              </div>
            </div>
            
            <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
              {!isHomeOnboarded ? (
                <button
                  onClick={onboardHomeHub}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:text-zinc-200 py-2 text-xs font-semibold shadow-sm transition-all"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Onboard Node</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    deleteDevice('home-hub');
                    if (activeDemo === 'home') setActiveDemo(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-455 py-2 text-xs font-semibold shadow-sm transition-all"
                  title="Remove Device from Dashboard"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Node</span>
                </button>
              )}
              <button
                onClick={() => setActiveDemo(activeDemo === 'home' ? null : 'home')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold shadow-sm transition-all ${
                  activeDemo === 'home'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>{activeDemo === 'home' ? 'Close Demo' : 'Live Demo'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Solar Array */}
          <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f]">
            <div>
              <div className="relative h-44 overflow-hidden group">
                <img 
                  src="/solar_grid.png?v=1"
                  alt="Solar Grid preview" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <span className="bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Green Energy</span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Solar Efficiency Tracker</h4>
                  {isSolarOnboarded ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Synced
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-zinc-400">Offline</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Real-time PV tile efficiency calculator based on panel tilt angle, surface dust and battery state.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
              {!isSolarOnboarded ? (
                <button
                  onClick={onboardSolarArray}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:text-zinc-200 py-2 text-xs font-semibold shadow-sm transition-all"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Onboard Node</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    deleteDevice('solar-array');
                    if (activeDemo === 'solar') setActiveDemo(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-455 py-2 text-xs font-semibold shadow-sm transition-all"
                  title="Remove Device from Dashboard"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Node</span>
                </button>
              )}
              <button
                onClick={() => setActiveDemo(activeDemo === 'solar' ? null : 'solar')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold shadow-sm transition-all ${
                  activeDemo === 'solar'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>{activeDemo === 'solar' ? 'Close Demo' : 'Live Demo'}</span>
              </button>
            </div>
          </div>

          {/* Card 3: Fluid Regulator */}
          <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f]">
            <div>
              <div className="relative h-44 overflow-hidden group">
                <img 
                  src="/fluid_control.png?v=1"
                  alt="Fluid control preview" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Industrial IoT</span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Fluidic Level Manager</h4>
                  {isFluidOnboarded ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Synced
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-zinc-400">Offline</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Interactive liquid tank containing dual automated flow valves and low/high status trigger states.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
              {!isFluidOnboarded ? (
                <button
                  onClick={onboardFluidTank}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:text-zinc-200 py-2 text-xs font-semibold shadow-sm transition-all"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Onboard Node</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    deleteDevice('fluid-tank');
                    if (activeDemo === 'fluid') setActiveDemo(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-455 py-2 text-xs font-semibold shadow-sm transition-all"
                  title="Remove Device from Dashboard"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Node</span>
                </button>
              )}
              <button
                onClick={() => setActiveDemo(activeDemo === 'fluid' ? null : 'fluid')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold shadow-sm transition-all ${
                  activeDemo === 'fluid'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>{activeDemo === 'fluid' ? 'Close Demo' : 'Live Demo'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Demo Expanded Panels */}
        {activeDemo && (
          <div className="rounded-xl border border-blue-100 bg-blue-50/20 p-6 shadow-inner dark:border-zinc-800 dark:bg-[#0c0c0f] animate-fadeIn">
            {activeDemo === 'home' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-150">Smart Home Automation Controls</h4>
                      <p className="text-[10px] text-zinc-500">Operator interactive console for simulated household telemetry</p>
                    </div>
                  </div>
                  {!isHomeOnboarded && (
                    <span className="text-[11px] text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-full font-medium">
                      ⚠️ Onboard device node to sync telemetry to main dashboard charts.
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Thermostat */}
                  <div className="rounded-lg border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Thermostat (Temp)</span>
                    <div className="flex items-center justify-between my-3">
                      <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">{homeTemp}°C</span>
                      <span className="text-[11px] font-medium text-zinc-500">
                        {homeTemp > 30 ? '🔥 Heat Wave' : homeTemp < 18 ? '❄️ AC Active' : '🟢 Comfort Zone'}
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="15" 
                      max="95" 
                      value={homeTemp} 
                      onChange={(e) => setHomeTemp(parseInt(e.target.value))}
                      className="w-full h-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[9px] text-zinc-400 mt-1">
                      <span>15°C</span>
                      <span>Target: Limit is 80°C</span>
                      <span>95°C</span>
                    </div>
                  </div>

                  {/* Dual-State Lights */}
                  <div className="rounded-lg border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-3">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Lighting Controller</span>
                    
                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Kitchen Light</span>
                      <button 
                        onClick={() => toggleHomeLight('kitchen')}
                        className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                          homeLights.kitchen 
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25' 
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-450'
                        }`}
                      >
                        {homeLights.kitchen ? 'ACTIVE (ON)' : 'OFF'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Living Room Lamp</span>
                      <button 
                        onClick={() => toggleHomeLight('livingRoom')}
                        className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                          homeLights.livingRoom 
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25' 
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-450'
                        }`}
                      >
                        {homeLights.livingRoom ? 'ACTIVE (ON)' : 'OFF'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Master Bedroom</span>
                      <button 
                        onClick={() => toggleHomeLight('bedroom')}
                        className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                          homeLights.bedroom 
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25' 
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-450'
                        }`}
                      >
                        {homeLights.bedroom ? 'ACTIVE (ON)' : 'OFF'}
                      </button>
                    </div>
                  </div>

                  {/* Vault Alarm */}
                  <div className="rounded-lg border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Security System</span>
                      <div className="flex items-center gap-2 mt-2">
                        <Radio className={`h-4.5 w-4.5 ${homeAlarm ? 'text-rose-500 animate-pulse' : 'text-zinc-400'}`} />
                        <span className="text-xs font-semibold">Vault Security State:</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={toggleHomeAlarm}
                      className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        homeAlarm 
                          ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md' 
                          : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <span>{homeAlarm ? '🔔 DISARM ALARM SYSTEM' : '🔒 ARM SECURITY VAULT'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeDemo === 'solar' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Sun className="h-5 w-5 text-amber-500" />
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-150">Solar Array Efficiency controls</h4>
                      <p className="text-[10px] text-zinc-500">Operator interactive console for green energy simulated PV telemetry</p>
                    </div>
                  </div>
                  {!isSolarOnboarded && (
                    <span className="text-[11px] text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-full font-medium">
                      ⚠️ Onboard device node to sync telemetry to main dashboard charts.
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Solar Tilt */}
                  <div className="rounded-lg border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Solar Array Tilt Angle</span>
                    <div className="flex items-center justify-between my-3">
                      <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">{solarAngle}°</span>
                      <span className="text-[11px] font-medium text-zinc-500">
                        {solarAngle === 45 ? '☀️ Peak Angle (100%)' : solarAngle > 70 || solarAngle < 20 ? '🥀 Bad Efficiency' : '🟢 Nominal Angle'}
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="90" 
                      value={solarAngle} 
                      onChange={(e) => setSolarAngle(parseInt(e.target.value))}
                      className="w-full h-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[9px] text-zinc-400 mt-1">
                      <span>0° (Flat)</span>
                      <span>Optimal: 45°</span>
                      <span>90° (Vertical)</span>
                    </div>
                  </div>

                  {/* Cleanliness / Maintenance */}
                  <div className="rounded-lg border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Panel Surface Efficiency</span>
                      <div className="flex items-center justify-between my-3">
                        <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">{solarCleanliness}%</span>
                        <span className="text-[10.5px] font-medium text-zinc-500">
                          {solarCleanliness > 90 ? '✨ Clean' : solarCleanliness < 50 ? '🌫️ Dusty (Low Output)' : 'Nominal'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={cleanSolarPanels}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white py-2 text-xs font-semibold shadow-sm transition-all"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Perform Panel Washing</span>
                    </button>
                  </div>

                  {/* Power Generation & Grid Connection */}
                  <div className="rounded-lg border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Power Station Status</span>
                      <button
                        onClick={() => {
                          setSolarGridConnected(prev => {
                            const next = !prev;
                            addFeedEvent(next ? 'success' : 'warning', next ? '🔌 Solar Grid: connected battery array to utility grid.' : '🔌 Solar Grid: Isolated array from utility grid!', 'solar-array');
                            return next;
                          });
                        }}
                        className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                          solarGridConnected 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {solarGridConnected ? 'GRID CONNECTED' : 'ISOLATED'}
                      </button>
                    </div>

                    <div className="mt-2 space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-zinc-500">Calculated Generation:</span>
                        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50 font-mono">{solarOutput} Watts</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-zinc-500">Estimated Output Voltage:</span>
                        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50 font-mono">
                          {solarGridConnected ? (10.5 + (solarOutput / 250) * 3.0).toFixed(2) : '0.0'} V
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeDemo === 'fluid' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-emerald-500" />
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-150">Fluidic level tank manager</h4>
                      <p className="text-[10px] text-zinc-500">Operator interactive console for simulated storage tanks</p>
                    </div>
                  </div>
                  {!isFluidOnboarded && (
                    <span className="text-[11px] text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-full font-medium">
                      ⚠️ Onboard device node to sync telemetry to main dashboard charts.
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Visual progress tank */}
                  <div className="rounded-lg border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider self-start mb-2">Liquid Level Indicator</span>
                    <div className="relative w-24 h-40 bg-zinc-100 dark:bg-zinc-800 rounded-lg border-2 border-zinc-350 overflow-hidden flex flex-col justify-end">
                      <div 
                        className="w-full bg-blue-500/80 transition-all duration-1000 ease-out" 
                        style={{ height: `${fluidLevel}%` }}
                      >
                        <div className="w-full h-full relative">
                          {(inletValve || outletValve) && (
                            <span className="absolute top-0 inset-x-0 h-1 bg-white/40 animate-pulse" />
                          )}
                        </div>
                      </div>
                      <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm text-zinc-700 dark:text-zinc-200 z-10">
                        {fluidLevel}%
                      </span>
                    </div>
                  </div>

                  {/* Valves control */}
                  <div className="rounded-lg border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40 space-y-4 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Flow Solenoid Valves</span>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${inletValve ? 'bg-emerald-500 animate-ping' : 'bg-zinc-300'}`} />
                        Inlet Solenoid (Fill)
                      </span>
                      <button 
                        onClick={() => {
                          setInletValve(prev => {
                            const next = !prev;
                            addFeedEvent('info', `🚰 Fluid Tank: Inlet Valve turned ${next ? 'OPEN' : 'CLOSED'}`, 'fluid-tank');
                            return next;
                          });
                        }}
                        className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                          inletValve 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-450'
                        }`}
                      >
                        {inletValve ? 'OPEN' : 'CLOSED'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${outletValve ? 'bg-rose-500 animate-ping' : 'bg-zinc-300'}`} />
                        Outlet Solenoid (Drain)
                      </span>
                      <button 
                        onClick={() => {
                          setOutletValve(prev => {
                            const next = !prev;
                            addFeedEvent('info', `🚰 Fluid Tank: Outlet Valve turned ${next ? 'OPEN' : 'CLOSED'}`, 'fluid-tank');
                            return next;
                          });
                        }}
                        className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                          outletValve 
                            ? 'bg-rose-500 text-white' 
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-450'
                        }`}
                      >
                        {outletValve ? 'OPEN' : 'CLOSED'}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="rounded-lg border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Safety Interrupts</span>
                      <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                        Emergency Flush opens the outlet valve fully and shuts off the inlet valve to rapidly discharge levels.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setInletValve(false);
                        setOutletValve(true);
                        addFeedEvent('warning', '⚠️ Fluid Tank: Emergency Flush triggered by Operator. Level draining!', 'fluid-tank');
                      }}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white py-2.5 text-xs font-semibold shadow-sm transition-all"
                    >
                      <Zap className="h-4 w-4" />
                      <span>Trigger Emergency Flush</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Action / Reset Block */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <HelpCircle className="h-5 w-5 text-zinc-400 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Restoring Normal Simulated State</h4>
            <p className="text-[11px] text-zinc-500">
              Instructors can click the reset button to immediately clear all forced scenarios and restore normal telemetry ranges.
            </p>
          </div>
        </div>

        <button
          onClick={() => triggerScenario('clear')}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 text-xs font-semibold shadow-sm transition-all"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Clear Drills &amp; Restore Baseline</span>
        </button>
      </div>
    </div>
  );
}

