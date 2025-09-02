const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path'); // Add this

const sarvamApiKey = process.env.SARVAM_API_KEY;
if (!sarvamApiKey) {
  throw new Error('SARVAM_API_KEY is not set in .env');
}
const baseUrl = 'https://api.sarvam.ai';

async function speechToText(audioPath, language = 'hi-IN', model = 'saarika:v2.5') {
  try {
    const normalizedPath = path.normalize(audioPath); // Normalize path
    console.log('Normalized Audio Path:', normalizedPath);
    const form = new FormData();
    form.append('file', fs.createReadStream(normalizedPath));
    form.append('model', model);
    form.append('language_code', language);

    console.log('Sending STT request for:', normalizedPath);
    const response = await axios.post(`${baseUrl}/speech-to-text`, form, {
      headers: { ...form.getHeaders(), 'api-subscription-key': sarvamApiKey }
    });
    console.log('STT Response:', response.data);
    return response.data.transcript || '';
  } catch (err) {
    console.error('STT Error:', err.response ? err.response.data : err.message);
    throw err;
  }
}

async function textToSpeech(text, language = 'hi-IN') {
  if (!text || !language) throw new Error('Text and language are required');
  console.log('TTS Request:', { text, language });
  const response = await axios.post(`${baseUrl}/text-to-speech`, { text, lang: language }, {
    headers: { 'api-subscription-key': sarvamApiKey, 'Content-Type': 'application/json' },
    responseType: 'arraybuffer'
  }).catch(err => {
    console.error('TTS Error:', err.response ? Buffer.from(err.response.data).toString() : err.message);
    throw err;
  });
  console.log('TTS Response Size:', response.data.length, 'bytes');
  return response.data;
}

module.exports = { speechToText, textToSpeech };