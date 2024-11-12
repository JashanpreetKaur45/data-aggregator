const aggregateController = ({ fetchWeatherData, fetchExchangeRates, getCache, setCache, logger }) => async (req, res) => {
  const { location = 'Mumbai', currency } = req.query;
  const cacheKey = `aggregateData_${location}_${currency}`;

  try {
    logger.info(`Received request for aggregate data with location: ${location} and currency: ${currency}`);
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      logger.info(`Cache hit for ${cacheKey}`);
      return res.json(cachedData);
    }

    const [weatherData, exchangeRates] = await Promise.all([
      fetchWeatherData(location),
      fetchExchangeRates(currency)
    ]);

    const responseData = {
      source1: {
        location: weatherData.name,
        temperature: weatherData.main.temp,
        weather: weatherData.weather[0].description,
      },
      source2: {
        base: exchangeRates.base,
        rate: currency ? exchangeRates.rate : exchangeRates.rates,
      },
    };

    setCache(cacheKey, responseData);
    logger.info(`Successfully fetched and cached aggregate data for ${cacheKey}`);
    res.json(responseData);
  } catch (error) {
    logger.error(`Error in aggregateController for ${cacheKey}: ${error.message}`);
    res.status(500).json({ message: 'Error fetching data', error: error.message });
  }
};

export default aggregateController;
