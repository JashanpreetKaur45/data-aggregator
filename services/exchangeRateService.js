import axios from 'axios';
import logger from '../utils/logger.js';

const fetchExchangeRates = async (currency) => {
  const url = 'https://openexchangerates.org/api/latest.json?app_id=68ea7a26a454497d837893014f5ffb94';
  let attempts = 3;

  while (attempts > 0) {
    try {
      logger.info(`Fetching exchange rates, attempt ${4 - attempts}`);
      const response = await axios.get(url);
      const data = currency ? { base: response.data.base, rate: response.data.rates[currency] } : response.data;
      return data;
    } catch (error) {
      attempts -= 1;
      logger.error(`Attempt ${4 - attempts} failed: ${error.message}`);
      if (attempts === 0) {
        logger.error(`All attempts failed for fetching exchange rates. Error: ${error.message}`);
        throw error;
      }
    }
  }
};

export { fetchExchangeRates };
