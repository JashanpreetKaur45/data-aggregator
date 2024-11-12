import { expect } from 'chai';
import sinon from 'sinon';
import aggregateControllerFactory from '../controllers/aggregateController.js';

describe('aggregateController', () => {
  let fetchWeatherDataStub, fetchExchangeRatesStub, getCacheStub, setCacheStub, loggerStub, aggregateController;
  const req = { query: { location: 'Mumbai', currency: 'USD' } };
  const res = {
    json: sinon.stub(),
    status: sinon.stub().returnsThis(),
  };
  const cacheKey = `aggregateData_${req.query.location}_${req.query.currency}`;

  beforeEach(() => {
    fetchWeatherDataStub = sinon.stub();
    fetchExchangeRatesStub = sinon.stub();
    getCacheStub = sinon.stub();
    setCacheStub = sinon.stub();
    loggerStub = { info: sinon.stub(), error: sinon.stub() };

    aggregateController = aggregateControllerFactory({
      fetchWeatherData: fetchWeatherDataStub,
      fetchExchangeRates: fetchExchangeRatesStub,
      getCache: getCacheStub,
      setCache: setCacheStub,
      logger: loggerStub,
    });
  });

  it('should return cached data if it exists', async () => {
    const cachedData = { source1: {}, source2: {} };
    getCacheStub.withArgs(cacheKey).returns(cachedData);

    await aggregateController(req, res);

    expect(getCacheStub.calledWith(cacheKey)).to.be.true;
    expect(res.json.calledWith(cachedData)).to.be.true;
    expect(fetchWeatherDataStub.called).to.be.false;
    expect(fetchExchangeRatesStub.called).to.be.false;
    expect(loggerStub.info.called).to.be.true;
  });

  it('should fetch and return new data if cache is empty', async () => {
    getCacheStub.withArgs(cacheKey).returns(null);

    const weatherData = { name: 'Mumbai', main: { temp: 30 }, weather: [{ description: 'Clear sky' }] };
    const exchangeRates = { base: 'USD', rate: 74.5 };

    fetchWeatherDataStub.withArgs('Mumbai').resolves(weatherData);
    fetchExchangeRatesStub.withArgs('USD').resolves(exchangeRates);

    await aggregateController(req, res);

    expect(getCacheStub.calledWith(cacheKey)).to.be.true;
    expect(fetchWeatherDataStub.calledWith('Mumbai')).to.be.true;
    expect(fetchExchangeRatesStub.calledWith('USD')).to.be.true;
    expect(setCacheStub.calledWith(cacheKey, {
      source1: {
        location: weatherData.name,
        temperature: weatherData.main.temp,
        weather: weatherData.weather[0].description,
      },
      source2: {
        base: exchangeRates.base,
        rate: exchangeRates.rate,
      },
    })).to.be.true;
    expect(res.json.calledWith({
      source1: {
        location: weatherData.name,
        temperature: weatherData.main.temp,
        weather: weatherData.weather[0].description,
      },
      source2: {
        base: exchangeRates.base,
        rate: exchangeRates.rate,
      },
    })).to.be.true;
  });

  it('should handle errors and respond with an error message', async () => {
    getCacheStub.withArgs(cacheKey).returns(null);
    fetchWeatherDataStub.rejects(new Error('Weather service error'));

    await aggregateController(req, res);

    expect(loggerStub.error.calledWith(sinon.match.string)).to.be.true;
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWith({
      message: 'Error fetching data',
      error: 'Weather service error',
    })).to.be.true;
  });
});
