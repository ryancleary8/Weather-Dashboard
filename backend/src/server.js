import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getCurrentWeather, getForecastWeather } from './services/weatherService.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/weather/current', async (req, res, next) => {
  try {
    const data = await getCurrentWeather(req.query.city);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.get('/weather/forecast', async (req, res, next) => {
  try {
    const data = await getForecastWeather(req.query.city);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error.'
  });
});

app.listen(PORT, () => {
  console.log(`Weather API server running on http://localhost:${PORT}`);
});
