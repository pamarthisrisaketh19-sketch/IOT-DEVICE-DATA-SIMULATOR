import React, { useEffect } from 'react';
import { Sun, Moon, Play, Pause, RefreshCw, User } from 'lucide-react';
import { useSimulator } from '../context/SimulatorContext';

export default function Header({ isDark, setIsDark, activeView }) {
  const { isSimulating, setIsSimulating, simulationSpeed, readings } = useSimulator();

  // Handle dark mode side effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const viewTitles = {
    dashboard: 'IoT Operations Dashboard',
    developer: 'Developer API Console',
    trainer: 'Workshop Instructor Panel',
    simulator: 'Sensor & Readings Simulator',
    alerts: 'Rule & Alert Configuration',
    geofences: 'Geofence Boundaries Setup'
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md dark:border-zinc-800 dark:bg-[#09090b]/80">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {viewTitles[activeView] || 'TelemetryHub'}
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
          IoT device simulation node active
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Simulation Controls */}
        <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50/50 p-1 dark:border-zinc-800 dark:bg-zinc-900/30">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold shadow-sm transition-all ${
              isSimulating
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            {isSimulating ? (
              <>
                <Play className="h-3 w-3 fill-current animate-pulse" />
                <span>Simulating</span>
              </>
            ) : (
              <>
                <Pause className="h-3 w-3" />
                <span>Paused</span>
              </>
            )}
          </button>
          <span className="px-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
            {simulationSpeed / 1000}s tick
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2 border-l border-zinc-200 pl-4 dark:border-zinc-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Operations Control</p>
            <p className="text-[10px] text-zinc-400">Station A</p>
          </div>
        </div>
      </div>
    </header>
  );
}
