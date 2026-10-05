import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Cloud, CloudRain, CloudSun, Droplets, Gauge, MapPin, RefreshCw, ShieldAlert, Sun, Wind } from 'lucide-react';

const DEFAULT_WEATHER = {
  location: {
    name: 'Chennai, Tamil Nadu',
    timezone: 'Asia/Kolkata'
  },
  current: {
    temperature: 31,
    feelsLike: 35,
    humidity: 64,
    windSpeed: 12,
    precipitation: 0,
    condition: 'Partly Cloudy',
    spraySuitability: 'Good',
    diseaseRisk: 'Moderate',
    riskReason: 'Warm temperature and moderate field humidity require vigilance on solanaceous crops.'
  },
  forecast: {
    tempMax: 34,
    tempMin: 26,
    rainChance: 20
  }
};

const DISTRICT_OPTIONS = [
  { key: 'chennai', name: 'Chennai, TN' },
  { key: 'coimbatore', name: 'Coimbatore, TN' },
  { key: 'madurai', name: 'Madurai, TN' },
  { key: 'thanjavur', name: 'Thanjavur, TN (Cauvery Delta)' },
  { key: 'salem', name: 'Salem, TN' },
  { key: 'tiruchirappalli', name: 'Trichy, TN' },
  { key: 'bengaluru', name: 'Bengaluru, KA' },
  { key: 'hyderabad', name: 'Hyderabad, TS' },
  { key: 'delhi', name: 'Delhi NCR' },
  { key: 'mumbai', name: 'Mumbai, MH' },
  { key: 'pune', name: 'Pune, MH' },
  { key: 'jaipur', name: 'Jaipur, RJ' },
  { key: 'ludhiana', name: 'Ludhiana, PB' }
];

export default function WeatherWidget({ compact = false }) {
  const [weather, setWeather] = useState(DEFAULT_WEATHER);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDistrict, setSelectedDistrict] = useState('chennai');
  const [loading, setLoading] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const clientTimezone = weather?.location?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

  const fetchWeather = async (params = {}) => {
    setLoading(true);
    try {
      let query = `tz=${encodeURIComponent(clientTimezone)}`;
      if (params.district) query += `&district=${params.district}`;
      else if (params.lat && params.lon) query += `&lat=${params.lat}&lon=${params.lon}`;
      else if (selectedDistrict) query += `&district=${selectedDistrict}`;

      const res = await axios.get(`http://localhost:4000/api/weather?${query}`);
      if (res.data && res.data.current) {
        setWeather(res.data);
      }
    } catch (err) {
      console.warn('Weather fetch fallback active:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather({ district: selectedDistrict });
  }, [selectedDistrict]);

  const handleUseGps = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsActive(true);
        fetchWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      (err) => {
        console.warn('GPS location request denied or timed out:', err.message);
        setGpsActive(false);
        fetchWeather({ district: selectedDistrict });
      },
      { timeout: 5000 }
    );
  };

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const tempDisplay = typeof weather.current.temperature === 'number' ? `${weather.current.temperature}°C` : '31°C';
  const feelsLikeDisplay = typeof weather.current.feelsLike === 'number' ? `${weather.current.feelsLike}°C` : '34°C';

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-3 border border-[#d5dfd1] bg-white px-3.5 py-1.5 text-xs text-[#2c4733] shadow-sm">
        <div className="flex items-center gap-1.5 font-bold">
          <CloudSun size={15} className="text-[#3b7e49]" />
          <span>{tempDisplay}</span>
          <span className="text-[#6d7e6f]">· {weather.current.condition}</span>
        </div>
        <div className="hidden border-l border-[#d5dfd1] pl-2 sm:block text-[#6b7b6d]">
          <span>{formattedTime}</span>
          <span className="ml-1 text-[10px] font-bold uppercase text-[#859687]">({clientTimezone})</span>
        </div>
      </div>
    );
  }

  return (
    <article className="border border-[#dce4d8] bg-white p-6 shadow-sm">
      {/* Top Header & District Location Selector */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e5ebe1] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#6d7f6f]">
            <CloudSun size={16} className="text-[#3b7e49]" />
            <span>Local Microclimate & Field Diagnostics</span>
          </div>

          <div className="mt-2 flex flex-wrap items-baseline gap-3">
            <span className="display-face text-4xl font-bold text-[#1a3824]">
              {tempDisplay}
            </span>
            <span className="text-sm font-semibold text-[#546857]">
              {weather.current.condition} · Feels like {feelsLikeDisplay}
            </span>
          </div>

          {/* District Switcher */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1 font-bold text-[#455c48]">
              <MapPin size={13} className="text-[#3b7e49]" /> Location:
            </span>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setGpsActive(false);
                setSelectedDistrict(e.target.value);
              }}
              className="border border-[#cfd9ca] bg-[#fafcfa] px-2.5 py-1 text-xs font-semibold text-[#294630] outline-none focus:border-[#2d6f43]"
            >
              {DISTRICT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.name}</option>
              ))}
            </select>

            <button
              onClick={handleUseGps}
              title="Detect exact GPS coordinates from your device"
              className={`flex items-center gap-1 border px-2 py-1 text-[11px] font-bold uppercase transition ${
                gpsActive
                  ? 'border-[#2d6f43] bg-[#edf6ea] text-[#1e522f]'
                  : 'border-[#cfd9ca] bg-white text-[#566e5a] hover:bg-[#f4f7f1]'
              }`}
            >
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
              {gpsActive ? 'GPS Active' : 'Use Device GPS'}
            </button>
          </div>
        </div>

        {/* Live Clock & Timezone Block */}
        <div className="rounded-sm border border-[#e2ebd9] bg-[#f7faf4] px-4 py-2.5 text-right min-w-[140px]">
          <p className="text-xs font-bold uppercase tracking-[.12em] text-[#718674]">{formattedDate}</p>
          <p className="font-mono text-xl font-bold text-[#1d4a2b] tracking-wide mt-0.5">{formattedTime}</p>
          <p className="text-[10px] font-bold text-[#567a5b] mt-0.5">{clientTimezone}</p>
        </div>
      </div>

      {/* Atmospheric indicators */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="border border-[#ebf0e7] bg-[#fbfdf9] p-3">
          <p className="flex items-center gap-1 text-[11px] font-bold uppercase text-[#738274]">
            <Droplets size={13} className="text-[#376daf]" /> Relative Humidity
          </p>
          <p className="mt-1 text-xl font-bold text-[#243e2b]">{weather.current.humidity}%</p>
        </div>

        <div className="border border-[#ebf0e7] bg-[#fbfdf9] p-3">
          <p className="flex items-center gap-1 text-[11px] font-bold uppercase text-[#738274]">
            <Wind size={13} className="text-[#457c83]" /> Wind Velocity
          </p>
          <p className="mt-1 text-xl font-bold text-[#243e2b]">{weather.current.windSpeed} km/h</p>
        </div>

        <div className="border border-[#ebf0e7] bg-[#fbfdf9] p-3">
          <p className="flex items-center gap-1 text-[11px] font-bold uppercase text-[#738274]">
            <CloudRain size={13} className="text-[#346294]" /> Rain Probability
          </p>
          <p className="mt-1 text-xl font-bold text-[#243e2b]">{weather.forecast.rainChance}%</p>
        </div>

        <div className="border border-[#ebf0e7] bg-[#fbfdf9] p-3">
          <p className="flex items-center gap-1 text-[11px] font-bold uppercase text-[#738274]">
            <Gauge size={13} className="text-[#7e602e]" /> Foliage Spray Status
          </p>
          <p className="mt-1 text-sm font-bold text-[#243e2b] truncate">{weather.current.spraySuitability}</p>
        </div>
      </div>

      {/* Crop Pathogen Environmental Risk Indicator */}
      <div className={`mt-4 flex items-start gap-3 border p-3.5 ${
        weather.current.diseaseRisk === 'High'
          ? 'border-[#f2c1b6] bg-[#fdf2ef] text-[#933626]'
          : weather.current.diseaseRisk === 'Moderate'
          ? 'border-[#f5dfb8] bg-[#fef9ee] text-[#8c5e18]'
          : 'border-[#cfe4cb] bg-[#f3f9f0] text-[#2c5f34]'
      }`}>
        <ShieldAlert size={19} className="shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold uppercase tracking-wider">
            Agricultural Pathogen Risk Index: {weather.current.diseaseRisk}
          </span>
          <p className="mt-0.5 text-xs opacity-90 leading-relaxed">{weather.current.riskReason}</p>
        </div>
      </div>
    </article>
  );
}
