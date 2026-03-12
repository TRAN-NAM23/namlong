const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_URL = 'https://provinces.open-api.vn/api';

// Cache for reducing API calls
const cache = {
  provinces: null,
  districts: {},
  wards: {},
  expiresAt: 0
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// GET /api/addresses/provinces - Lấy danh sách tỉnh thành
router.get('/provinces', async (req, res) => {
  try {
    // Check cache
    if (cache.provinces && cache.expiresAt > Date.now()) {
      return res.json({
        success: true,
        provinces: cache.provinces,
        source: 'cache'
      });
    }

    const response = await axios.get(`${API_URL}/?depth=1`);
    
    if (response.status === 200) {
      // Transform data to add 'id' field for frontend compatibility
      const transformedData = response.data.map(prov => ({
        ...prov,
        id: prov.code
      }));
      cache.provinces = transformedData;
      cache.expiresAt = Date.now() + CACHE_DURATION;
      
      res.json({
        success: true,
        provinces: transformedData,
        source: 'api'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching provinces',
      error: error.message
    });
  }
});

// GET /api/addresses/districts/:provinceId - Lấy danh sách quận huyện theo tỉnh
router.get('/districts/:provinceId', async (req, res) => {
  try {
    const { provinceId } = req.params;

    // Check cache
    if (cache.districts[provinceId] && cache.expiresAt > Date.now()) {
      return res.json({
        success: true,
        districts: cache.districts[provinceId],
        source: 'cache'
      });
    }

    const response = await axios.get(`${API_URL}/p/${provinceId}?depth=2`);
    
    if (response.status === 200 && response.data.districts) {
      // Transform data to add 'id' field for frontend compatibility
      const transformedData = response.data.districts.map(dist => ({
        ...dist,
        id: dist.code
      }));
      cache.districts[provinceId] = transformedData;
      cache.expiresAt = Date.now() + CACHE_DURATION;

      res.json({
        success: true,
        districts: transformedData,
        source: 'api'
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Province not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching districts',
      error: error.message
    });
  }
});

// GET /api/addresses/wards/:provinceId/:districtId - Lấy danh sách phường xã
router.get('/wards/:provinceId/:districtId', async (req, res) => {
  try {
    const { provinceId, districtId } = req.params;
    const cacheKey = `${provinceId}_${districtId}`;

    // Check cache
    if (cache.wards[cacheKey] && cache.expiresAt > Date.now()) {
      return res.json({
        success: true,
        wards: cache.wards[cacheKey],
        source: 'cache'
      });
    }

    const response = await axios.get(`${API_URL}/d/${districtId}?depth=2`);

    if (response.status === 200 && response.data.wards) {
      // Transform data to add 'id' field for frontend compatibility
      const transformedData = response.data.wards.map(ward => ({
        ...ward,
        id: ward.code
      }));
      cache.wards[cacheKey] = transformedData;
      cache.expiresAt = Date.now() + CACHE_DURATION;

      res.json({
        success: true,
        wards: transformedData,
        source: 'api'
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'District not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching wards',
      error: error.message
    });
  }
});

module.exports = router;
