import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Moon, Sun, Navigation } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const DEFAULT_CITY = 'New York';

const BACKGROUND_CLASSES = {
  sunny: 'from-amber-300 via-orange-300 to-pink-400',
  cloudy: 'from-slate-400 via-slate-500 to-slate-700',
  rain: 'from-cyan-600 via-blue-700 to-slate-900',
  snow: 'from-sky-100 via-slate-200 to-slate-400',
  thunder: 'from-violet-700 via-purple-800 to-slate-900',
  default: 'from-blue-500 via-indigo-500 to-purple-600'
};

const getBackground = (condition = '') => {
  const key = condition.toLowerCase();
  if (key.includes('sun') || key.includes('clear')) return BACKGROUND_CLASSES.sunny;
  if (key.includes('cloud') || key.includes('mist') || key.includes('fog')) return BACKGROUND_CLASSES.cloudy;
  if (key.includes('rain') || key.includes('drizzle')) return BACKGROUND_CLASSES.rain;
  if (key.includes('snow') || key.includes('sleet') || key.includes('ice')) return BACKGROUND_CLASSES.snow;
  if (key.includes('thunder')) return BACKGROUND_CLASSES.thunder;
  return BACKGROUND_CLASSES.default;
};

const formatHour = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], { hour: 'numeric' });

function App() {
  const [cityInput, setCityInput] = useState(DEFAULT_CITY);
  const [query, setQuery] = useState(DEFAULT_CITY);
  const [unit, setUnit] = useState('C');
  const [darkMode, setDarkMode] = useState(false);
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favoriteCities') ?? '[]');
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError('');
      try {
        const [currentRes, forecastRes] = await Promise.all([
          axios.get(`${API_BASE}/weather/current`, { params: { city: query } }),
          axios.get(`${API_BASE}/weather/forecast`, { params: { city: query } })
        ]);
        setCurrent(currentRes.data);
        setForecast(forecastRes.data.forecastDays);
        setHourly(forecastRes.data.hourly.slice(0, 24));
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to fetch weather. Try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [query]);

  const bgClass = useMemo(
    () => getBackground(current?.current?.condition),
    [current?.current?.condition]
  );

  const chartData = useMemo(
    () => hourly.map((h) => ({
      hour: formatHour(h.time),
      temp: unit === 'C' ? h.tempC : h.tempF
    })),
    [hourly, unit]
  );

  const addFavorite = () => {
    const city = current?.location?.name;
    if (!city || favorites.includes(city)) return;
    const updated = [...favorites, city];
    setFavorites(updated);
    localStorage.setItem('favoriteCities', JSON.stringify(updated));
  };

  const removeFavorite = (city) => {
    const updated = favorites.filter((item) => item !== city);
    setFavorites(updated);
    localStorage.setItem('favoriteCities', JSON.stringify(updated));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextQuery = `${position.coords.latitude},${position.coords.longitude}`;
        setCityInput(nextQuery);
        setQuery(nextQuery);
      },
      () => setError('Unable to access your location.')
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgClass} text-slate-100 transition-all duration-500`}>
      <div className="mx-auto max-w-6xl p-4 sm:p-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold sm:text-3xl">Weather Dashboard</h1>
          <button
            onClick={() => setDarkMode((v) => !v)}
            className="rounded-full bg-white/20 p-2 backdrop-blur hover:bg-white/30"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <section className="mb-6 rounded-2xl bg-black/20 p-4 backdrop-blur md:p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(cityInput);
            }}
            className="flex flex-col gap-3 md:flex-row"
          >
            <input
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="w-full rounded-xl border border-white/30 bg-white/10 p-3 placeholder:text-slate-200"
              placeholder="Search city or latitude,longitude"
            />
            <div className="flex gap-2">
              <button className="rounded-xl bg-white px-4 py-3 font-medium text-slate-800">Search</button>
              <button
                type="button"
                onClick={useCurrentLocation}
                className="rounded-xl bg-white/20 px-3 py-3"
                title="Use current location"
              >
                <Navigation size={18} />
              </button>
              <button
                type="button"
                onClick={() => setUnit((prev) => (prev === 'C' ? 'F' : 'C'))}
                className="rounded-xl bg-white/20 px-4 py-3"
              >
                °{unit}
              </button>
            </div>
          </form>
        </section>

        {loading && <p className="animate-pulse rounded-xl bg-black/20 p-4">Loading weather data…</p>}
        {error && <p className="rounded-xl bg-red-500/80 p-4">{error}</p>}

        {current && !loading && !error && (
          <>
            <section className="mb-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-black/20 p-5 backdrop-blur md:col-span-2">
                <p className="text-lg font-medium">
                  {current.location.name}, {current.location.country}
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <img src={current.current.icon} alt={current.current.condition} className="h-16 w-16" />
                  <div>
                    <p className="text-4xl font-semibold">
                      {unit === 'C' ? current.current.tempC : current.current.tempF}°{unit}
                    </p>
                    <p>{current.current.condition}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  <p>Humidity: {current.current.humidity}%</p>
                  <p>Wind: {unit === 'C' ? current.current.windKph + ' kph' : current.current.windMph + ' mph'}</p>
                  <p>Feels like: {unit === 'C' ? current.current.feelsLikeC : current.current.feelsLikeF}°{unit}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-black/20 p-5 backdrop-blur">
                <h2 className="mb-2 font-semibold">Favorites</h2>
                <button onClick={addFavorite} className="mb-3 w-full rounded-lg bg-white px-3 py-2 text-slate-800">
                  Save current city
                </button>
                <ul className="space-y-2 text-sm">
                  {favorites.map((city) => (
                    <li key={city} className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2">
                      <button onClick={() => { setCityInput(city); setQuery(city); }} className="text-left hover:underline">
                        {city}
                      </button>
                      <button onClick={() => removeFavorite(city)} className="text-xs text-red-200">Remove</button>
                    </li>
                  ))}
                  {favorites.length === 0 && <li className="text-slate-200">No favorites yet.</li>}
                </ul>
              </div>
            </section>

            <section className="mb-6 rounded-2xl bg-black/20 p-5 backdrop-blur">
              <h2 className="mb-4 text-lg font-semibold">24-Hour Temperature</h2>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff33" />
                    <XAxis dataKey="hour" stroke="#ffffff" minTickGap={20} />
                    <YAxis stroke="#ffffff" unit={`°${unit}`} width={35} />
                    <Tooltip />
                    <Line type="monotone" dataKey="temp" stroke="#fef08a" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-2xl bg-black/20 p-5 backdrop-blur">
              <h2 className="mb-4 text-lg font-semibold">7-Day Forecast</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {forecast.map((day) => (
                  <article key={day.date} className="rounded-xl bg-white/10 p-3">
                    <p className="font-medium">{new Date(day.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    <img src={day.icon} alt={day.condition} className="h-10 w-10" />
                    <p className="text-sm">{day.condition}</p>
                    <p className="mt-1 font-semibold">
                      {unit === 'C' ? day.maxTempC : day.maxTempF}° / {unit === 'C' ? day.minTempC : day.minTempF}°
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
