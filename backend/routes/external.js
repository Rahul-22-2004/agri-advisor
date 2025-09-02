const express = require('express');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// Mock data as fallback
const mockParams = {
  commodities: ['Wheat', 'Rice', 'Maize', 'Cauliflower'],
  states: ['Karnataka', 'Tamil Nadu', 'Maharashtra', 'Andhra Pradesh'],
  markets: ['Bangalore', 'Chennai', 'Mumbai', 'Hyderabad'],
  varieties: ['Local', 'Hybrid', 'Desi'],
};

// Capitalize first letter of each word
const capitalize = (str) => {
  return str
    .trim()
    .toLowerCase()
    .replace(/(^|\s)\w/g, (letter) => letter.toUpperCase());
};

// GET /api/external/valid-params - Fetch valid commodities, states, markets, varieties
router.get('/valid-params', async (req, res) => {
  try {
    const apiKey = process.env.DATAGOV_API_KEY;
    if (!apiKey) {
      console.error('Valid Params Error: DATAGOV_API_KEY is not set in .env');
      console.log('Valid Params Response: Returning mock data', mockParams);
      return res.json(mockParams);
    }

    const url = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
    const params = {
      'api-key': apiKey,
      format: 'json',
      limit: 5000,
    };
    const response = await axios.get(url, { params });
    console.log('Valid Params Response:', {
      status: response.status,
      total_records: response.data.total,
      records_returned: response.data.records?.length || 0,
    });

    if (!response.data.records || response.data.records.length === 0) {
      console.warn('Valid Params Warning: No records returned from data.gov.in, using mock data');
      console.log('Valid Params Response: Returning mock data', mockParams);
      return res.json(mockParams);
    }

    const commodities = [...new Set(response.data.records.map(record => capitalize(record.commodity)))].sort();
    const states = [...new Set(response.data.records.map(record => capitalize(record.state)))].sort();
    const markets = [...new Set(response.data.records.map(record => capitalize(record.market)))].sort();
    const varieties = [...new Set(response.data.records.map(record => capitalize(record.variety)))].sort();

    console.log('Valid Params Response: Returning API data', { commodities, states, markets, varieties });
    res.json({ commodities, states, markets, varieties });
  } catch (err) {
    console.error('Valid Params Error:', err.response ? { status: err.response.status, data: err.response.data } : err.message);
    console.warn('Valid Params Fallback: Using mock data due to API error');
    console.log('Valid Params Response: Returning mock data', mockParams);
    res.json(mockParams);
  }
});

// GET /api/external/valid-markets - Fetch valid markets for state and commodity
router.get('/valid-markets', async (req, res) => {
  try {
    const { state, commodity } = req.query;
    const normalizedState = capitalize(state || '');
    const normalizedCommodity = capitalize(commodity || '');

    if (!normalizedState || !normalizedCommodity) {
      return res.status(400).json({ error: 'State and commodity are required' });
    }

    const apiKey = process.env.DATAGOV_API_KEY;
    if (!apiKey) {
      console.error('Valid Markets Error: DATAGOV_API_KEY is not set in .env');
      console.log('Valid Markets Response: Returning mock data', { markets: mockParams.markets });
      return res.json({ markets: mockParams.markets });
    }

    const url = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
    const params = {
      'api-key': apiKey,
      format: 'json',
      'filters[state]': normalizedState,
      'filters[commodity]': normalizedCommodity,
      limit: 5000,
    };

    const response = await axios.get(url, { params });
    console.log('Valid Markets Response for', normalizedState, normalizedCommodity, ':', {
      status: response.status,
      total_records: response.data.total,
      records_returned: response.data.records?.length || 0,
      sample_record: response.data.records?.[0] || 'No records',
    });

    if (!response.data.records || response.data.records.length === 0) {
      console.warn('Valid Markets Warning: No records returned, using mock data');
      console.log('Valid Markets Response: Returning mock data', { markets: mockParams.markets });
      return res.json({ markets: mockParams.markets });
    }

    const markets = [...new Set(response.data.records.map(record => capitalize(record.market)))].sort();
    console.log('Valid Markets Response: Returning API data', { markets });
    res.json({ markets });
  } catch (err) {
    console.error('Valid Markets Error:', err.response ? { status: err.response.status, data: err.response.data } : err.message);
    console.warn('Valid Markets Fallback: Using mock data due to API error');
    console.log('Valid Markets Response: Returning mock data', { markets: mockParams.markets });
    res.json({ markets: mockParams.markets });
  }
});

// GET /api/external/prices - Crop Prices from data.gov.in
router.get('/prices', async (req, res) => {
  try {
    const { commodity, state, market, variety, arrival_date, offset = 0, limit = 10 } = req.query;
    const normalizedParams = {
      commodity: capitalize(commodity || ''),
      state: capitalize(state || ''),
      market: capitalize(market || ''),
      variety: variety ? capitalize(variety) : undefined,
      arrival_date,
      offset: parseInt(offset),
      limit: parseInt(limit),
    };
    console.log('Price Query:', normalizedParams);

    if (!normalizedParams.commodity || !normalizedParams.state || !normalizedParams.market) {
      return res.status(400).json({ error: 'Commodity, state, and market are required' });
    }

    if (arrival_date && !/^\d{2}\/\d{2}\/\d{4}$/.test(arrival_date)) {
      return res.status(400).json({ error: 'Arrival date must be in DD/MM/YYYY format' });
    }

    const apiKey = process.env.DATAGOV_API_KEY;
    const mockResponse = {
      records: [{
        commodity: normalizedParams.commodity,
        state: normalizedParams.state,
        market: normalizedParams.market,
        variety: normalizedParams.variety || 'Local',
        arrival_date: normalizedParams.arrival_date || new Date().toLocaleDateString('en-GB'),
        min_price: 1000,
        max_price: 1500,
        modal_price: 1250,
      }],
      total: 1,
      offset: normalizedParams.offset,
      limit: normalizedParams.limit,
    };

    if (!apiKey) {
      console.error('Prices Error: DATAGOV_API_KEY is not set in .env');
      console.log('Prices Response: Returning mock data', mockResponse);
      return res.json(mockResponse);
    }

    const url = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
    const params = {
      'api-key': apiKey,
      format: 'json',
      'filters[commodity]': normalizedParams.commodity,
      'filters[state]': normalizedParams.state,
      'filters[market]': normalizedParams.market,
      offset: normalizedParams.offset,
      limit: normalizedParams.limit,
    };
    if (normalizedParams.variety) {
      params['filters[variety]'] = normalizedParams.variety;
    }
    if (normalizedParams.arrival_date) {
      params['filters[arrival_date]'] = normalizedParams.arrival_date;
    }

    const response = await axios.get(url, { params });
    console.log('Price Response:', {
      status: response.status,
      total_records: response.data.total,
      records_returned: response.data.records?.length || 0,
    });

    if (!response.data.records || response.data.records.length === 0) {
      console.warn('Prices Warning: No records returned from data.gov.in, using mock data');
      console.log('Prices Response: Returning mock data', mockResponse);
      return res.json(mockResponse);
    }

    console.log('Prices Response: Returning API data', {
      records: response.data.records,
      total: response.data.total,
      offset: normalizedParams.offset,
      limit: normalizedParams.limit,
    });
    res.json({
      records: response.data.records,
      total: response.data.total,
      offset: normalizedParams.offset,
      limit: normalizedParams.limit,
    });
  } catch (err) {
    console.error('Prices Error:', err.response ? { status: err.response.status, data: err.response.data } : err.message);
    console.warn('Prices Fallback: Using mock data due to API error');
    console.log('Prices Response: Returning mock data', mockResponse);
    res.json(mockResponse);
  }
});

// POST /api/external/identify - PlantNet for pest/plant ID
router.post('/identify', upload.single('photo'), async (req, res) => {
  try {
    const form = new FormData();
    form.append('images', fs.createReadStream(req.file.path));
    form.append('organs', 'auto');

    const response = await axios.post(`https://my-api.plantnet.org/v2/identify/all?api-key=${process.env.PLANTNET_API_KEY}`, form, {
      headers: form.getHeaders(),
    });

    fs.unlinkSync(req.file.path);
    res.json(response.data);
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/external/weather - Fetch weather data
router.get('/weather', async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Weather API key not configured' });
    }

    const url = 'https://api.openweathermap.org/data/2.5/weather';
    const params = {
      appid: apiKey,
      units: 'metric',
    };

    if (city) {
      params.q = city;
    } else if (lat && lon) {
      params.lat = lat;
      params.lon = lon;
    } else {
      return res.status(400).json({ error: 'City or latitude/longitude parameters are required' });
    }

    const response = await axios.get(url, { params });
    console.log('Weather Response:', {
      location: city || `${lat},${lon}`,
      status: response.status,
      temp: response.data.main.temp,
    });

    res.json(response.data);
  } catch (err) {
    console.error('Weather Error:', err.response ? { status: err.response.status, data: err.response.data } : err.message);
    if (err.response?.status === 404) {
      res.status(404).json({ error: 'Location not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  }
});

module.exports = router;