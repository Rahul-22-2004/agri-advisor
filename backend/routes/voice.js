// const express = require('express');
// const multer = require('multer');
// const router = express.Router();
// const FarmProfile = require('../models/FarmProfile');
// const { speechToText, textToSpeech } = require('../utils/sarvam');
// const fs = require('fs');
// const axios = require('axios');

// const upload = multer({ dest: 'uploads/' });

// router.post('/', upload.single('audio'), async (req, res) => {
//   try {
//     const { userId, language = 'hi-IN' } = req.body; // Add language
//     console.log('Request Body:', req.body);
//     console.log('Audio File:', req.file);
//     if (!userId) return res.status(400).json({ error: 'userId is required' });
//     const profile = await FarmProfile.findOne({ userId });
//     if (!profile) return res.status(404).json({ message: 'Profile not found' });

//     if (!req.file) return res.status(400).json({ error: 'Audio file is required' });

//     const audioPath = req.file.path;
//     console.log('Processing Audio Path:', audioPath);
//     const query = await speechToText(audioPath, language);
//     console.log('Query from speechToText:', query);

//     if (!query) {
//       fs.unlinkSync(audioPath);
//       return res.status(400).json({ error: 'Empty transcript from STT', transcript: query });
//     }

//     let responseText = 'कोई विशिष्ट जानकारी नहीं मिली। कृपया फिर से प्रयास करें।';
//     if (/कीड़[ोंए-मकोड़े]*/i.test(query)) {
//       responseText = `आपकी ${profile.crops[0]} फसल में कीड़े हैं। सुझाव: जैविक कीटनाशक का उपयोग करें।`;
//     } else if (query.toLowerCase().includes('मौसम')) {
//       const weather = await axios.get(`http://localhost:5000/api/external/weather/${profile.location.split(',')[0]}`);
//       responseText = `मौसम पूर्वानुमान: ${weather.data.weather[0].description}, Temperature: ${(weather.data.main.temp - 273.15).toFixed(2)}°C`;
//     }
//     console.log('Response Text:', responseText);

//     profile.history.push({ query, response: responseText });
//     await profile.save();

//     const audio = await textToSpeech(responseText, language);
//     fs.unlinkSync(audioPath);

//     res.set('Content-Type', 'audio/mpeg');
//     res.send(audio);
//   } catch (err) {
//     console.error('Advice Endpoint Error:', err.message);
//     fs.unlinkSync(req.file?.path); // Clean up on error
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;

// // POST /api/voice/tts (ensure this is present)
// router.post('/tts', async (req, res) => {
//   try {
//     const { text, language = 'hi-IN' } = req.body;
//     if (!text) return res.status(400).json({ error: 'Text is required' });

//     const audio = await textToSpeech(text, language);
//     res.set('Content-Type', 'audio/mpeg');
//     res.send(audio);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const router = express.Router();
const FarmProfile = require('../models/FarmProfile');
const { speechToText, textToSpeech } = require('../utils/sarvam');

// ✅ Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Created uploads directory at: ${uploadDir}`);
}

// ✅ Configure Multer to store files in absolute path
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// 🎯 Main voice processing endpoint
router.post('/', upload.single('audio'), async (req, res) => {
  try {
    const { userId, language = 'hi-IN' } = req.body;
    console.log('Request Body:', req.body);
    console.log('Audio File:', req.file);

    // ✅ Validate userId
    if (!userId) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'userId is required' });
    }

    // ✅ Fetch user profile
    const profile = await FarmProfile.findOne({ userId });
    if (!profile) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Profile not found' });
    }

    // ✅ Validate audio file
    if (!req.file) return res.status(400).json({ error: 'Audio file is required' });

    const audioPath = req.file.path;
    console.log('🎧 Processing Audio Path:', audioPath);

    // 🎯 Convert speech to text
    const query = await speechToText(audioPath, language);
    console.log('📝 Query from speechToText:', query);

    if (!query || query.trim() === '') {
      fs.unlinkSync(audioPath);
      return res.status(400).json({ error: 'Empty transcript from STT', transcript: query });
    }

    // 🎯 Generate response based on query
    let responseText = 'कोई विशिष्ट जानकारी नहीं मिली। कृपया फिर से प्रयास करें।';
    if (/कीड़[ोंए-मकोड़े]*/i.test(query)) {
      responseText = `आपकी ${profile.crops[0]} फसल में कीड़े हैं। सुझाव: जैविक कीटनाशक का उपयोग करें।`;
    } else if (query.toLowerCase().includes('मौसम')) {
      try {
        const weather = await axios.get(`http://localhost:5000/api/external/weather/${profile.location.split(',')[0]}`);
        responseText = `मौसम पूर्वानुमान: ${weather.data.weather[0].description}, तापमान: ${(weather.data.main.temp - 273.15).toFixed(2)}°C`;
      } catch (err) {
        console.error('🌤 Weather API Error:', err.message);
        responseText = 'मौसम की जानकारी लोड करने में समस्या आई।';
      }
    }

    console.log('💬 Response Text:', responseText);

    // 🎯 Save query & response in history
    profile.history.push({ query, response: responseText });
    await profile.save();

    // 🎯 Convert response to speech
    const audio = await textToSpeech(responseText, language);

    // ✅ Cleanup uploaded file after TTS conversion
    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

    res.set('Content-Type', 'audio/mpeg');
    res.send(audio);
  } catch (err) {
    console.error('❌ Advice Endpoint Error:', err.message);
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

// 🎯 Separate TTS endpoint
router.post('/tts', async (req, res) => {
  try {
    const { text, language = 'hi-IN' } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const audio = await textToSpeech(text, language);

    res.set('Content-Type', 'audio/mpeg');
    res.send(audio);
  } catch (err) {
    console.error('TTS Endpoint Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
