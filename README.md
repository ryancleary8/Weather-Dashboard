# Full-Stack Weather Dashboard

A complete weather dashboard with a React + Vite frontend and Node.js + Express backend.

## Features

- City/location search
- Current weather (temperature, humidity, wind, condition)
- 7-day forecast
- 24-hour forecast line chart (Recharts)
- Dynamic weather-based gradient background
- Celsius/Fahrenheit toggle
- Responsive layout for mobile and desktop
- Geolocation support (fetch weather for user coordinates)
- Dark/light mode toggle
- Favorite cities saved in `localStorage`
- Loading and error states
- Backend API integration with WeatherAPI
- Caching via `node-cache`

## Project Structure

```
Weather-Dashboard/
  backend/
    src/
      server.js
      services/weatherService.js
    .env.example
    package.json
  frontend/
    src/
      App.jsx
      main.jsx
      styles.css
    .env.example
    package.json
    tailwind.config.js
    postcss.config.js
    vite.config.js
  README.md
```

## Prerequisites

- Node.js 18+
- npm
- A free API key from [WeatherAPI](https://www.weatherapi.com/)

## Backend Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Configure environment:
   ```bash
   cp .env.example .env
   ```
3. Add your Weather API key to `backend/.env`:
   ```env
   WEATHER_API_KEY=your_real_key_here
   ```
4. Start backend:
   ```bash
   npm run dev
   ```

The API runs at `http://localhost:4000`.

### Backend Endpoints

- `GET /weather/current?city=London`
- `GET /weather/forecast?city=London`
- `GET /health`

## Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Configure frontend environment:
   ```bash
   cp .env.example .env
   ```
3. Start frontend:
   ```bash
   npm run dev
   ```

The frontend runs at `http://localhost:5173`.

## Run Both (two terminals)

Terminal 1:
```bash
cd backend
npm run dev
```

Terminal 2:
```bash
cd frontend
npm run dev
```

## Notes

- You can search by city (`Seattle`) or coordinates (`47.61,-122.33`).
- Geolocation uses browser permissions.
- If WeatherAPI fails or city is invalid, backend returns a descriptive error message.
- Responses are cached for 10 minutes to improve performance.
