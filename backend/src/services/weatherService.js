import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 });
const WEATHER_API_BASE = 'https://api.weatherapi.com/v1';

const parseLocation = (city) => city?.trim();

const weatherApiRequest = async (endpoint, query) => {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    const err = new Error('WEATHER_API_KEY is missing. Add it to backend/.env');
    err.statusCode = 500;
    throw err;
  }

  const cacheKey = `${endpoint}:${query}`;
  const fromCache = cache.get(cacheKey);
  if (fromCache) {
    return fromCache;
  }

  try {
    const { data } = await axios.get(`${WEATHER_API_BASE}/${endpoint}.json`, {
      params: { key: apiKey, q: query, aqi: 'no', alerts: 'no', days: 7 }
    });

    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    const statusCode = error?.response?.status || 500;
    const apiMessage = error?.response?.data?.error?.message;
    const err = new Error(apiMessage || 'Unable to fetch weather data right now.');
    err.statusCode = statusCode === 400 ? 404 : statusCode;
    throw err;
  }
};

export const getCurrentWeather = async (city) => {
  const query = parseLocation(city);
  if (!query) {
    const err = new Error('Query parameter "city" is required.');
    err.statusCode = 400;
    throw err;
  }

  const data = await weatherApiRequest('current', query);
  return {
    location: {
      name: data.location.name,
      region: data.location.region,
      country: data.location.country,
      localtime: data.location.localtime
    },
    current: {
      tempC: data.current.temp_c,
      tempF: data.current.temp_f,
      humidity: data.current.humidity,
      windKph: data.current.wind_kph,
      windMph: data.current.wind_mph,
      condition: data.current.condition.text,
      icon: `https:${data.current.condition.icon}`,
      isDay: data.current.is_day === 1,
      feelsLikeC: data.current.feelslike_c,
      feelsLikeF: data.current.feelslike_f
    }
  };
};

export const getForecastWeather = async (city) => {
  const query = parseLocation(city);
  if (!query) {
    const err = new Error('Query parameter "city" is required.');
    err.statusCode = 400;
    throw err;
  }

  const data = await weatherApiRequest('forecast', query);

  return {
    location: {
      name: data.location.name,
      region: data.location.region,
      country: data.location.country,
      localtime: data.location.localtime
    },
    forecastDays: data.forecast.forecastday.map((day) => ({
      date: day.date,
      maxTempC: day.day.maxtemp_c,
      minTempC: day.day.mintemp_c,
      maxTempF: day.day.maxtemp_f,
      minTempF: day.day.mintemp_f,
      avgHumidity: day.day.avghumidity,
      condition: day.day.condition.text,
      icon: `https:${day.day.condition.icon}`
    })),
    hourly: data.forecast.forecastday
      .slice(0, 2)
      .flatMap((day) =>
        day.hour.map((hour) => ({
          time: hour.time,
          tempC: hour.temp_c,
          tempF: hour.temp_f,
          condition: hour.condition.text,
          icon: `https:${hour.condition.icon}`
        }))
      )
  };
};
