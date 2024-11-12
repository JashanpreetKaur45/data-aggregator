// services/weatherService.js
import axios from 'axios';
import logger from '../utils/logger.js';

const fetchWeatherData = async (location) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=f217c37bae2d35ad328265460b51ddb1`;
  let attempts = 3;

  while (attempts > 0) {
    try {
      logger.info(`Fetching weather data for location: ${location}, attempt ${4 - attempts}`);
      const response = await axios.get(url);
      logger.info(`Successfully fetched weather data for location: ${location}`);
      return response.data;
    } catch (error) {
      attempts -= 1;
      logger.warn(`Attempt ${4 - attempts} failed for location: ${location}. Error: ${error.message}`);
      if (attempts === 0) {
        logger.error(`All attempts failed for fetching weather data for location: ${location}`);
        throw error;
      }
    }
  }
};

export { fetchWeatherData };
