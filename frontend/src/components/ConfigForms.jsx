import React, { useState, useEffect, useRef } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { 
  Bell, 
  Globe, 
  PlusCircle, 
  Save, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Navigation
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* -------------------------------------------------------------
   1. ALERT CONFIGURATION VIEW
------------------------------------------------------------- */
export function AlertConfig() {
  const { alertRules, setAlertRules } = useSimulator();
  const [tempMax, setTempMax] = useState(alertRules.tempMax.toString());
  const [tempMin, setTempMin] = useState(alertRules.tempMin.toString());
  const [humidityMax, setHumidityMax] = useState(alertRules.humidityMax.toString());
  const [humidityMin, setHumidityMin] = useState(alertRules.humidityMin.toString());
  const [voltageMax, setVoltageMax] = useState(alertRules.voltageMax.toString());
  const [voltageMin, setVoltageMin] = useState(alertRules.voltageMin.toString());
  
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setAlertRules({
      tempMax: parseFloat(tempMax),
      tempMin: parseFloat(tempMin),
      humidityMax: parseFloat(humidityMax),
      humidityMin: parseFloat(humidityMin),
      voltageMax: parseFloat(voltageMax),
      voltageMin: parseFloat(voltageMin)
    });
    setSuccessMsg('Alert threshold rules updated successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleReset = () => {
    setTempMax('80');
    setTempMin('-20');
    setHumidityMax('85');
    setHumidityMin('20');
    setVoltageMax('13.5');
    setVoltageMin('11.5');
  };

  return (
    <div className="max-w-3xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f]">
      <div className="mb-6 flex items-center gap-3 border-b border-zinc-150 pb-4 dark:border-zinc-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 font-sans">Alert Thresholds</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Define ranges that trigger automated warnings and WhatsApp routing</p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Temperature Bounds */}
          <div className="space-y-3 rounded-lg border border-zinc-100 p-4 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-900/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Temperature Limits</h4>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Max Alert Temp (°C)</label>
              <input
                type="number"
                value={tempMax}
                onChange={(e) => setTempMax(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Min Alert Temp (°C)</label>
              <input
                type="number"
                value={tempMin}
                onChange={(e) => setTempMin(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Humidity Bounds */}
          <div className="space-y-3 rounded-lg border border-zinc-100 p-4 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-900/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Humidity Limits</h4>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Max Humidity (%)</label>
              <input
                type="number"
                value={humidityMax}
                onChange={(e) => setHumidityMax(e.target.value)}
                min="0"
                max="100"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Min Humidity (%)</label>
              <input
                type="number"
                value={humidityMin}
                onChange={(e) => setHumidityMin(e.target.value)}
                min="0"
                max="100"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Voltage Bounds */}
          <div className="space-y-3 rounded-lg border border-zinc-100 p-4 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-900/10 sm:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Electrical Limits</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Max Volts (V)</label>
                <input
                  type="number"
                  value={voltageMax}
                  onChange={(e) => setVoltageMax(e.target.value)}
                  step="0.1"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Min Volts (V)</label>
                <input
                  type="number"
                  value={voltageMin}
                  onChange={(e) => setVoltageMin(e.target.value)}
                  step="0.1"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-all"
          >
            <Save className="h-4 w-4" />
            Save Thresholds
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 px-4 py-2 text-xs font-semibold shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Defaults
          </button>
        </div>
      </form>
    </div>
  );
}

/* -------------------------------------------------------------
   2. GEOFENCE MAP HELPER COMPONENT
------------------------------------------------------------- */
function GeofenceMap({ enabled, centerLat, centerLng, radiusMeters, onChangeCenter, devices }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tilesRef = useRef(null);
  const circleRef = useRef(null);
  const centerMarkerRef = useRef(null);
  const deviceMarkersRef = useRef({});
  
  // Keep refs of props to avoid stale closures in Leaflet event listeners
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const onChangeCenterRef = useRef(onChangeCenter);
  onChangeCenterRef.current = onChangeCenter;
  const isDraggingRef = useRef(false);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [parseFloat(centerLat) || 37.7749, parseFloat(centerLng) || -122.4194],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const isDark = document.documentElement.classList.contains('dark');
    const tileUrl = isDark 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tiles = L.tileLayer(tileUrl, {
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;
    tilesRef.current = tiles;

    // Create central geofence circle
    const circle = L.circle([parseFloat(centerLat) || 37.7749, parseFloat(centerLng) || -122.4194], {
      radius: radiusMeters,
      color: enabled ? '#3b82f6' : '#9ca3af',
      fillColor: enabled ? '#3b82f6' : '#9ca3af',
      fillOpacity: enabled ? 0.12 : 0.05,
      weight: enabled ? 2 : 1,
      dashArray: enabled ? '' : '5, 5'
    }).addTo(map);
    circleRef.current = circle;

    // Create center marker (dragger)
    const centerIcon = L.divIcon({
      className: 'custom-center-marker',
      html: `
        <div class="flex items-center justify-center h-6 w-6">
          <div class="h-6 w-6 rounded-full bg-blue-500/30 border-2 border-blue-500 flex items-center justify-center shadow-lg transition-transform hover:scale-110">
            <div class="h-2.5 w-2.5 rounded-full bg-blue-600"></div>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const centerMarker = L.marker([parseFloat(centerLat) || 37.7749, parseFloat(centerLng) || -122.4194], {
      icon: centerIcon,
      draggable: enabled
    }).addTo(map);

    centerMarker.on('dragstart', () => {
      isDraggingRef.current = true;
    });

    centerMarker.on('drag', (e) => {
      const latLng = e.target.getLatLng();
      circle.setLatLng(latLng);
    });

    centerMarker.on('dragend', (e) => {
      isDraggingRef.current = false;
      const latLng = e.target.getLatLng();
      onChangeCenterRef.current(latLng.lat.toFixed(6), latLng.lng.toFixed(6));
    });

    centerMarkerRef.current = centerMarker;

    // Click map to reposition center
    map.on('click', (e) => {
      if (enabledRef.current) {
        onChangeCenterRef.current(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
      }
    });

    // Theme switching listener
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      const newTileUrl = isDark 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      tiles.setUrl(newTileUrl);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Keep Map click, circle options & marker draggability sync'ed with enabled state
  useEffect(() => {
    const centerMarker = centerMarkerRef.current;
    const circle = circleRef.current;
    if (!centerMarker || !circle) return;

    if (enabled) {
      centerMarker.dragging.enable();
    } else {
      centerMarker.dragging.disable();
    }

    circle.setStyle({
      color: enabled ? '#3b82f6' : '#9ca3af',
      fillColor: enabled ? '#3b82f6' : '#9ca3af',
      fillOpacity: enabled ? 0.12 : 0.05,
      weight: enabled ? 2 : 1,
      dashArray: enabled ? '' : '5, 5'
    });
  }, [enabled]);

  // 3. React to coordinate changes (from inputs or dragend)
  useEffect(() => {
    const map = mapRef.current;
    const centerMarker = centerMarkerRef.current;
    const circle = circleRef.current;
    if (!map || !centerMarker || !circle) return;

    const lat = parseFloat(centerLat);
    const lng = parseFloat(centerLng);
    if (isNaN(lat) || isNaN(lng)) return;

    const currentPos = centerMarker.getLatLng();
    // Only update if difference is meaningful to prevent jumpy behaviors during active drags
    if (Math.abs(currentPos.lat - lat) > 0.00001 || Math.abs(currentPos.lng - lng) > 0.00001) {
      centerMarker.setLatLng([lat, lng]);
      circle.setLatLng([lat, lng]);
      
      // Pan to new location if it wasn't dragged directly
      if (!isDraggingRef.current) {
        map.panTo([lat, lng]);
      }
    }
  }, [centerLat, centerLng]);

  // 4. React to radius change
  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;
    const rad = parseFloat(radiusMeters);
    if (!isNaN(rad)) {
      circle.setRadius(rad);
    }
  }, [radiusMeters]);

  // 5. Update simulated devices on the map in real-time
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentMarkers = deviceMarkersRef.current;
    const activeIds = new Set();

    devices.forEach((device) => {
      activeIds.add(device.id);
      
      // Determine colors based on status
      let colorClass = 'bg-emerald-500 border-emerald-400';
      let pulseClass = 'bg-emerald-500/30';
      if (device.status === 'warning') {
        colorClass = 'bg-amber-500 border-amber-400';
        pulseClass = 'bg-amber-500/30';
      } else if (device.status === 'critical') {
        colorClass = 'bg-red-500 border-red-400';
        pulseClass = 'bg-red-500/30';
      } else if (device.status === 'inactive') {
        colorClass = 'bg-zinc-400 border-zinc-300';
        pulseClass = 'hidden';
      }

      const deviceIcon = L.divIcon({
        className: `custom-device-marker-${device.id}`,
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute h-6 w-6 rounded-full ${pulseClass} animate-ping"></div>
            <div class="h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-950 ${colorClass} shadow-md flex items-center justify-center">
            </div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const tooltipContent = `
        <div class="p-2 font-sans min-w-[120px]">
          <div class="font-bold text-xs text-zinc-900 dark:text-zinc-50">${device.name}</div>
          <div class="flex items-center gap-1.5 mt-1">
            <span class="inline-block h-1.5 w-1.5 rounded-full ${
              device.status === 'active' ? 'bg-emerald-500' :
              device.status === 'warning' ? 'bg-amber-500' :
              device.status === 'critical' ? 'bg-red-500' : 'bg-zinc-400'
            }"></span>
            <span class="text-[10px] text-zinc-500 dark:text-zinc-400 capitalize font-medium">${device.status}</span>
          </div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1.5 text-[9px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-1">
            <span>Temp:</span>
            <span class="font-medium text-zinc-700 dark:text-zinc-300 text-right">${device.temp}°C</span>
            <span>Volts:</span>
            <span class="font-medium text-zinc-700 dark:text-zinc-300 text-right">${device.voltage}V</span>
          </div>
        </div>
      `;

      if (currentMarkers[device.id]) {
        // Update existing marker position & icon
        currentMarkers[device.id].setLatLng([device.lat, device.lng]);
        currentMarkers[device.id].setIcon(deviceIcon);
        currentMarkers[device.id].getTooltip().setContent(tooltipContent);
      } else {
        // Create new marker
        const marker = L.marker([device.lat, device.lng], { icon: deviceIcon })
          .addTo(map)
          .bindTooltip(tooltipContent, {
            direction: 'top',
            offset: [0, -5],
            className: 'custom-tooltip'
          });
        
        currentMarkers[device.id] = marker;
      }
    });

    // Clean up markers for removed devices
    Object.keys(currentMarkers).forEach((id) => {
      if (!activeIds.has(id)) {
        currentMarkers[id].remove();
        delete currentMarkers[id];
      }
    });

  }, [devices]);

  return (
    <div className="relative w-full h-full flex-1 rounded-xl overflow-hidden shadow-inner border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/10 min-h-[400px]">
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px] z-0" />
      
      {!enabled && (
        <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[1.5px] z-10 flex items-center justify-center p-4 text-center">
          <div className="bg-white dark:bg-[#0c0c0f] border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl shadow-lg max-w-sm">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">Geofence Guard Inactive</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Enable the Radial Guard toggle to activate interactive boundary placement and real-time alerts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------
   3. GEOFENCE CONFIGURATION VIEW WITH INTERACTIVE MAP
------------------------------------------------------------- */
export function GeofenceConfig() {
  const { geofence, setGeofence, devices } = useSimulator();
  const [enabled, setEnabled] = useState(geofence.enabled);
  const [centerLat, setCenterLat] = useState(geofence.centerLat.toString());
  const [centerLng, setCenterLng] = useState(geofence.centerLng.toString());
  const [radiusMeters, setRadiusMeters] = useState(geofence.radiusMeters.toString());
  
  const [successMsg, setSuccessMsg] = useState('');

  // Calculate distance in meters for live client-side boundaries summary
  const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const latVal = parseFloat(centerLat);
  const lngVal = parseFloat(centerLng);
  const radVal = parseFloat(radiusMeters);

  const activeDevices = devices.filter(d => d.status !== 'inactive');
  const violations = enabled && !isNaN(latVal) && !isNaN(lngVal) && !isNaN(radVal)
    ? activeDevices.filter(d => getDistanceMeters(d.lat, d.lng, latVal, lngVal) > radVal)
    : [];

  const handleSave = (e) => {
    e.preventDefault();
    setGeofence({
      enabled,
      centerLat: parseFloat(centerLat),
      centerLng: parseFloat(centerLng),
      radiusMeters: parseInt(radiusMeters)
    });
    setSuccessMsg('Geofence configuration rules updated.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleMapCenterChange = (lat, lng) => {
    setCenterLat(lat);
    setCenterLng(lng);
  };

  return (
    <div className="w-full max-w-6xl mx-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f]">
      {/* Title */}
      <div className="mb-6 flex items-center gap-3 border-b border-zinc-150 pb-4 dark:border-zinc-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-950/20 dark:text-blue-400">
          <Globe className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 font-sans">Geofence Boundaries</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Set radial boundaries and track your sensor fleet live to prevent unauthorized asset departure</p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: Left controls, Right map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column */}
        <form onSubmit={handleSave} className="lg:col-span-5 space-y-5">
          {/* Active guard switch */}
          <div className="flex items-center justify-between rounded-lg border border-zinc-150 p-4 dark:border-zinc-800 bg-zinc-50/20">
            <div>
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Enable Radial Guard</h4>
              <p className="text-[11px] text-zinc-500">Enable alerts when GPS coordinates drift outside radial range</p>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4.5 w-4.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Coordinates inputs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 text-xs font-medium text-zinc-500 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-zinc-400" /> Center Latitude
              </label>
              <input
                type="number"
                value={centerLat}
                onChange={(e) => setCenterLat(e.target.value)}
                step="any"
                disabled={!enabled}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1 text-xs font-medium text-zinc-500 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-zinc-400" /> Center Longitude
              </label>
              <input
                type="number"
                value={centerLng}
                onChange={(e) => setCenterLng(e.target.value)}
                step="any"
                disabled={!enabled}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Radius range slider & input */}
          <div className="space-y-2.5 rounded-lg border border-zinc-100 p-4 dark:border-zinc-800/80 bg-zinc-50/10">
            <label className="text-xs font-medium text-zinc-500 flex justify-between">
              <span>Boundary Radius</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono">{radiusMeters} Meters</span>
            </label>
            <input
              type="range"
              min="100"
              max="5000"
              step="50"
              value={radiusMeters}
              onChange={(e) => setRadiusMeters(e.target.value)}
              disabled={!enabled}
              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(e.target.value)}
                disabled={!enabled}
                placeholder="Radius in meters"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Live Geofence Monitoring Stats */}
          {enabled && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg border border-zinc-150 dark:border-zinc-800 bg-zinc-50/10">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">In Bounds</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                      {activeDevices.length - violations.length}
                    </span>
                  </div>
                </div>
                <div className="p-3.5 rounded-lg border border-zinc-150 dark:border-zinc-800 bg-zinc-50/10">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 font-sans">Out of Bounds</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <ShieldAlert className={`h-4 w-4 ${violations.length > 0 ? 'text-red-500 animate-pulse' : 'text-zinc-400'}`} />
                    <span className={`text-lg font-bold ${violations.length > 0 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-zinc-800 dark:text-zinc-350'}`}>
                      {violations.length}
                    </span>
                  </div>
                </div>
              </div>

              {violations.length > 0 ? (
                <div className="rounded-lg border border-red-100/60 bg-red-50/30 p-3.5 dark:border-red-950/20 dark:bg-red-950/5">
                  <h5 className="font-bold text-red-800 dark:text-red-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                    <AlertCircle className="h-4 w-4 text-red-500" /> Active Geofence Breach
                  </h5>
                  <ul className="mt-2 space-y-1.5 text-[11px] text-red-700 dark:text-red-400/80">
                    {violations.map(v => {
                      const dist = getDistanceMeters(v.lat, v.lng, latVal, lngVal);
                      return (
                        <li key={v.id} className="flex justify-between items-center border-b border-red-100/40 dark:border-red-950/10 pb-1.5 last:border-0 last:pb-0">
                          <span className="font-medium">{v.name}</span>
                          <span className="font-mono bg-red-100 dark:bg-red-950/40 px-1.5 py-0.5 rounded text-[10px] text-red-650 dark:text-red-300 font-semibold">
                            +{Math.round(dist - radVal)}m
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="rounded-lg border border-emerald-100/50 bg-emerald-50/20 p-3.5 dark:border-emerald-950/10 dark:bg-emerald-950/5">
                  <h5 className="font-bold text-emerald-800 dark:text-emerald-450 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Safe Operations
                  </h5>
                  <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400/80">
                    All active telemetry equipment is reported inside configured boundaries.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="border-t border-zinc-150 pt-4 dark:border-zinc-800 flex gap-3">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-all"
            >
              <Save className="h-4 w-4" />
              Apply Boundaries
            </button>
          </div>
        </form>

        {/* Map View Column */}
        <div className="lg:col-span-7 h-[450px] w-full flex flex-col">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
              <Navigation className="h-3.5 w-3.5 text-blue-500" /> Interactive Operations Map
            </span>
            {enabled && (
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 italic">
                Drag the center pin or click on map to reposition
              </span>
            )}
          </div>
          <GeofenceMap
            enabled={enabled}
            centerLat={centerLat}
            centerLng={centerLng}
            radiusMeters={radiusMeters}
            onChangeCenter={handleMapCenterChange}
            devices={devices}
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   4. DEVICE ONBOARDING VIEW
------------------------------------------------------------- */
export function DeviceOnboarding({ onComplete }) {
  const { onboardDevice } = useSimulator();
  
  const DEFAULTS = {
    id: '', name: '', type: 'Boiler', priority: 'medium',
    owner: '', lat: '37.7749', lng: '-122.4194',
    temp: '25', humidity: '50', voltage: '12.0'
  };

  const [id, setId] = useState(DEFAULTS.id);
  const [name, setName] = useState(DEFAULTS.name);
  const [type, setType] = useState(DEFAULTS.type);
  const [priority, setPriority] = useState(DEFAULTS.priority);
  const [owner, setOwner] = useState(DEFAULTS.owner);
  const [lat, setLat] = useState(DEFAULTS.lat);
  const [lng, setLng] = useState(DEFAULTS.lng);
  const [temp, setTemp] = useState(DEFAULTS.temp);
  const [humidity, setHumidity] = useState(DEFAULTS.humidity);
  const [voltage, setVoltage] = useState(DEFAULTS.voltage);
  
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // DB status banner: null | { type: 'syncing'|'success'|'error', message, detail }
  const [dbStatus, setDbStatus] = useState(null);


  // Reset all form fields to defaults
  const handleReset = () => {
    setId(DEFAULTS.id);
    setName(DEFAULTS.name);
    setType(DEFAULTS.type);
    setPriority(DEFAULTS.priority);
    setOwner(DEFAULTS.owner);
    setLat(DEFAULTS.lat);
    setLng(DEFAULTS.lng);
    setTemp(DEFAULTS.temp);
    setHumidity(DEFAULTS.humidity);
    setVoltage(DEFAULTS.voltage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setDbStatus(null);

    const devicePayload = {
      id: id || undefined,
      name,
      type,
      priority,
      owner,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      temp: parseFloat(temp),
      humidity: parseFloat(humidity),
      voltage: parseFloat(voltage)
    };

    // Show syncing indicator immediately
    setDbStatus({ type: 'syncing', message: 'Syncing to MySQL database...', detail: 'Sending registration payload to backend' });

    // Call context which handles both in-memory + API
    await onboardDevice(devicePayload);

    // Also persist to localStorage as backup
    try {
      const existing = JSON.parse(localStorage.getItem('onboarded_devices') || '[]');
      const saved = {
        ...devicePayload,
        id: devicePayload.id || `device-${Date.now().toString().slice(-4)}`,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('onboarded_devices', JSON.stringify([...existing, saved]));
      setDbStatus({
        type: 'success',
        message: `✅ Database record created`,
        detail: `Device "${name}" saved to MySQL — table: devices`
      });
    } catch (_) {
      setDbStatus({
        type: 'error',
        message: '⚠️ DB Sync Warning',
        detail: 'localStorage backup failed, but MySQL insert may have succeeded'
      });
    }

    setSuccess(true);
    setIsSubmitting(false);

    setTimeout(() => {
      setSuccess(false);
      setDbStatus(null);
      if (onComplete) onComplete();
    }, 3000);

    // Clear identifying fields, keep defaults for telemetry
    setId('');
    setName('');
    setOwner('');
  };


  return (
    <div className="max-w-3xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0c0c0f]">
      <div className="mb-6 flex items-center gap-3 border-b border-zinc-150 pb-4 dark:border-zinc-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400">
          <PlusCircle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 font-sans">Onboard IoT Device</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Register new sensor node hardware to active operations stream</p>
        </div>
      </div>

      {/* Registration success banner */}
      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>Device registered successfully. Auto-telemetry channels active!</span>
        </div>
      )}

      {/* DB Status Banner */}
      {dbStatus && (
        <div className={`mb-4 rounded-lg p-3 text-xs border ${
          dbStatus.type === 'syncing'
            ? 'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-300'
            : dbStatus.type === 'success'
            ? 'bg-teal-50 border-teal-100 text-teal-800 dark:bg-teal-950/20 dark:border-teal-900/30 dark:text-teal-300'
            : 'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300'
        }`}>
          <div className="flex items-start gap-2">
            {dbStatus.type === 'syncing' ? (
              <svg className="h-4 w-4 animate-spin flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : dbStatus.type === 'success' ? (
              <svg className="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold block">{dbStatus.message}</span>
              <span className="opacity-80 font-mono">{dbStatus.detail}</span>
            </div>
          </div>
        </div>
      )}


      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Node Identity */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Identity Details</h4>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Device ID (Unique identifier, optional)</label>
              <input
                type="text"
                placeholder="e.g. boiler-05"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Display Name</label>
              <input
                type="text"
                placeholder="e.g. Secondary Condenser Pump"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Device Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              >
                <option value="Boiler">Boiler</option>
                <option value="Cooler">Cooler</option>
                <option value="Generator">Generator</option>
                <option value="Pump">Pump</option>
                <option value="Sensor">Sensor</option>
              </select>
            </div>
          </div>

          {/* Assignment & Routing */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Routing & Priority</h4>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Owner / Dispatch Manager</label>
              <input
                type="text"
                placeholder="e.g. Sarah Connor"
                required
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">System Alert Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              >
                <option value="low">Low Priority (Info log only)</option>
                <option value="medium">Medium Priority (Warning dispatch)</option>
                <option value="high">High Priority (Immediate SMS dispatch)</option>
                <option value="critical">Critical Priority (Immediate SMS + Voice alert)</option>
              </select>
            </div>
          </div>

          {/* Initial Telemetry Values */}
          <div className="space-y-3 sm:col-span-2 rounded-lg border border-zinc-100 p-4 dark:border-zinc-800 bg-zinc-50/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Initial Telemetry Values</h4>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Temp (°C)</label>
                <input
                  type="number"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Humidity (%)</label>
                <input
                  type="number"
                  value={humidity}
                  onChange={(e) => setHumidity(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Voltage (V)</label>
                <input
                  type="number"
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  step="0.1"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Latitude</label>
                <input
                  type="number"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  step="any"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Longitude</label>
                <input
                  type="number"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  step="any"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-105 pt-4 dark:border-zinc-800 flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2.5 text-xs font-semibold shadow-sm transition-all"
          >
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Saving to Database...
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" />
                Register Device Node
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 px-4 py-2.5 text-xs font-semibold shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 disabled:opacity-50 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
}
