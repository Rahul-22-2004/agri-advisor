const express = require('express');
const router = express.Router();
const FarmProfile = require('../models/FarmProfile');

// GET profile by userId
router.get('/:userId', async (req, res) => {
  try {
    const profile = await FarmProfile.findOne({ userId: req.params.userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create/update profile
router.post('/', async (req, res) => {
  try {
    const { userId, location, soilType, crops } = req.body;
    let profile = await FarmProfile.findOne({ userId });
    if (profile) {
      // Update existing
      profile.location = location || profile.location;
      profile.soilType = soilType || profile.soilType;
      profile.crops = crops || profile.crops;
      await profile.save();
    } else {
      // Create new
      profile = new FarmProfile({ userId, location, soilType, crops });
      await profile.save();
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;