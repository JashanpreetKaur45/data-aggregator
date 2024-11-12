import express from 'express';
import aggregateControllerFactory from './controllers/aggregateController.js';
import logger from './utils/logger.js'; 
import { fetchWeatherData } from './services/weatherService.js';
import { fetchExchangeRates } from './services/exchangeRateService.js';
import { getCache, setCache } from './utils/cache.js';

const app = express();
const PORT = process.env.PORT || 8080;

const aggregateController = aggregateControllerFactory({
  fetchWeatherData,
  fetchExchangeRates,
  getCache,
  setCache,
  logger,
});

app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  res.on('finish', () => {
    logger.info(`Response status for ${req.method} ${req.url}: ${res.statusCode}`);
  });
  next();
});

app.get('/aggregate', aggregateController);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
