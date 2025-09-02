const express = require("express");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const AdviceHistory = require("../models/AdviceHistory");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Language-specific responses
const responses = {
  "hi-IN": {
    default: "कोई विशिष्ट जानकारी नहीं मिली। कृपया फिर से प्रयास करें।",
    pests: "आपकी फसल में कीड़े हैं। सुझाव: जैविक कीटनाशक का उपयोग करें, जैसे नीम का तेल।",
    weather: (weatherData) => `मौसम पूर्वानुमान: ${weatherData.weather[0].description}, तापमान: ${(weatherData.main.temp - 273.15).toFixed(2)}°C`,
    soil: "मिट्टी की उर्वरता बढ़ाने के लिए जैविक खाद, जैसे गोबर की खाद, का उपयोग करें।",
    fertilizers: "नाइट्रोजन, फास्फोरस, और पोटाश युक्त उर्वरकों का संतुलित उपयोग करें।",
    diseases: "फसल रोगों के लिए, प्रभावित पौधों को हटाएं और फफूंदनाशक का उपयोग करें। रोग की पहचान के लिए स्थानीय कृषि विशेषज्ञ से संपर्क करें।",
    irrigation: "सिंचाई के लिए ड्रिप इरिगेशन सिस्टम का उपयोग करें ताकि पानी की बचत हो और फसल को सही मात्रा में पानी मिले।"
  },
  "kn-IN": {
    default: "ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಮಾಹಿತಿ ಸಿಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    pests: "ನಿಮ್ಮ ಬೆಳೆಯಲ್ಲಿ ಕೀಟಗಳಿವೆ. ಸಲಹೆ: ಸಾವಯವ ಕೀಟನಾಶಕವನ್ನು ಬಳಸಿ, ಉದಾಹರಣೆಗೆ ಕೀಟಾಮೃತ.",
    weather: (weatherData) => `ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ: ${weatherData.weather[0].description}, ತಾಪಮಾನ: ${(weatherData.main.temp - 273.15).toFixed(2)}°C`,
    soil: "ಫಲವತ್ತತೆಯನ್ನು ಹೆಚ್ಚಿಸಲು ಸಾವಯವ ಗೊಬ್ಬರವನ್ನು ಬಳಸಿ, ಉದಾಹರಣೆಗೆ ಗೋಮಯ.",
    fertilizers: "ನೈಟ್ರೋಜನ್, ಫಾಸ್ಫರಸ್ ಮತ್ತು ಪೊಟ್ಯಾಸಿಯಮ್ ಒಳಗೊಂಡ ರಸಗೊಬ್ಬರವನ್ನು ಸಮತೋಲನದಲ್ಲಿ ಬಳಸಿ.",
    diseases: "ಬೆಳೆ ರೋಗಗಳಿಗೆ, ರೋಗಗ್ರಸ್ತ ಸಸ್ಯಗಳನ್ನು ತೆಗೆದುಹಾಕಿ ಮತ್ತು ಶಿಲೀಂಧ್ರನಾಶಕವನ್ನು ಬಳಸಿ. ರೋಗದ ಗುರುತಿಸುವಿಕೆಗೆ ಸ್ಥಳೀಯ ಕೃಷಿ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    irrigation: "ನೀರಾವರಿಗಾಗಿ ತೊಟ್ಟಿಕ್ಕುವ ನೀರಾವರಿ ವ್ಯವಸ್ಥೆಯನ್ನು ಬಳಸಿ, ಇದರಿಂದ ನೀರು ಉಳಿತಾಯವಾಗುತ್ತದೆ ಮತ್ತು ಬೆಳೆಗೆ ಸರಿಯಾದ ಪ್ರಮಾಣದ ನೀರು ಸಿಗುತ್ತದೆ。"
  },
  "ta-IN": {
    default: "குறிப்பிட்ட தகவல் எதுவும் கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.",
    pests: "உங்கள் பயிரில் பூச்சிகள் உள்ளன. பரிந்துரை: இயற்கை பூச்சிக்கொல்லியைப் பயன்படுத்தவும், எடுத்துக்காட்டாக, வேப்ப எண்ணெய்.",
    weather: (weatherData) => `வானிலை முன்னறிவிப்பு: ${weatherData.weather[0].description}, வெப்பநிலை: ${(weatherData.main.temp - 273.15).toFixed(2)}°C`,
    soil: "மண்ணின் வளத்தை அதிகரிக்க இயற்கை உரங்களைப் பயன்படுத்தவும், எடுத்துக்காட்டாக, மாட்டு எரு.",
    fertilizers: "நைட்ரஜன், பாஸ்பரஸ் மற்றும் பொட்டாசியம் கொண்ட உரங்களை சமநிலையில் பயன்படுத்தவும்.",
    diseases: "பயிர் நோய்களுக்கு, பாதிக்கப்பட்ட தாவரங்களை அகற்றி, பூஞ்சாண நாசினியைப் பயன்படுத்தவும். நோயைக் கண்டறிய உள்ளூர் வேளாண் நிபுணரைத் தொடர்பு கொள்ளவும்。",
    irrigation: "நீர்ப்பாசனத்திற்கு ட்ரிப் நீர்ப்பாசன முறையைப் பயன்படுத்தவும், இதனால் தண்ணீர் மிச்சமாகும் மற்றும் பயிருக்கு சரியான அளவு தண்ணீர் கிடைக்கும்。"
  }
};

// Language-specific keywords
const keywords = {
  "hi-IN": {
    pests: [/कीट/, /पेस्ट/, /कीड़े/, /कीड़ा/, /insect/],
    weather: [/मौसम/, /weather/, /तापमान/, /temperature/],
    soil: [/मिट्टी/, /soil/, /उर्वरता/, /fertility/],
    fertilizers: [/उर्वरक/, /fertilizer/, /खाद/],
    diseases: [/रोग/, /disease/, /बीमारी/],
    irrigation: [/सिंचाई/, /irrigation/, /पानी/]
  },
  "kn-IN": {
    pests: [/ಕೀಟ/, /pest/, /ಕೀಡ/, /insect/],
    weather: [/ಹವಾಮಾನ/, /weather/, /ತಾಪಮಾನ/, /temperature/],
    soil: [/ಮಣ್ಣು/, /soil/, /ಫಲವತ್ತತೆ/, /fertility/],
    fertilizers: [/ರಸಗೊಬ್ಬರ/, /fertilizer/, /ಗೊಬ್ಬರ/],
    diseases: [/ರೋಗ/, /disease/, /ಬೇನೆ/],
    irrigation: [/ನೀರಾವರಿ/, /irrigation/, /ನೀರು/]
  },
  "ta-IN": {
    pests: [/பூச்சி/, /pest/, /insect/],
    weather: [/வானிலை/, /weather/, /வெப்பநிலை/, /temperature/],
    soil: [/மண்/, /soil/, /வளம்/, /fertility/],
    fertilizers: [/உரம்/, /fertilizer/],
    diseases: [/நோய்/, /disease/],
    irrigation: [/நீர்ப்பாசனம்/, /irrigation/, /தண்ணீர்/]
  }
};

// POST /api/advice - Process voice or text query
router.post("/", upload.single("audio"), async (req, res) => {
  let audioPath = req.file?.path;
  try {
    const { query, language = "en-IN" } = req.body;
    let adviceText = responses[language]?.default || "No specific information found. Please try again.";
    let transcript = query;

    // 1️⃣ Validate input
    if (!query && !req.file) {
      if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      return res.status(400).json({
        error: "Either text query or audio file is required",
      });
    }

    // 2️⃣ Speech-to-Text (if audio provided)
    if (req.file) {
      if (!["hi-IN", "kn-IN", "ta-IN"].includes(language)) {
        fs.unlinkSync(audioPath);
        return res.status(400).json({
          error: "Unsupported language. Use hi-IN, kn-IN, or ta-IN for voice queries",
        });
      }

      const form = new FormData();
      form.append("file", fs.createReadStream(audioPath));
      form.append("model", "saarika:v2.5"); // Fixed model
      form.append("prompt", "Provide agricultural advice.");

      const sttResponse = await axios.post(
        "https://api.sarvam.ai/speech-to-text",
        form,
        {
          headers: {
            "api-subscription-key": process.env.SARVAM_API_KEY,
            ...form.getHeaders(),
          },
        }
      );

      transcript = sttResponse.data.transcript;
      console.log("STT Transcript:", transcript);
    }

    // If no transcript or query, return default response
    if (!transcript) {
      if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      return res.status(400).json({
        error: "No valid query provided or audio could not be transcribed",
      });
    }

    // 3️⃣ Process query and generate advice
    const transcriptLower = transcript.toLowerCase().normalize("NFC");
    if (keywords[language]?.pests.some(regex => regex.test(transcriptLower))) {
      adviceText = responses[language].pests;
    } else if (keywords[language]?.weather.some(regex => regex.test(transcriptLower))) {
      const weatherResponse = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent("Bangalore")}&appid=${process.env.OPENWEATHER_API_KEY}`
      );
      adviceText = responses[language].weather(weatherResponse.data);
    } else if (keywords[language]?.soil.some(regex => regex.test(transcriptLower))) {
      adviceText = responses[language].soil;
    } else if (keywords[language]?.fertilizers.some(regex => regex.test(transcriptLower))) {
      adviceText = responses[language].fertilizers;
    } else if (keywords[language]?.diseases.some(regex => regex.test(transcriptLower))) {
      adviceText = responses[language].diseases;
    } else if (keywords[language]?.irrigation.some(regex => regex.test(transcriptLower))) {
      adviceText = responses[language].irrigation;
    }

    console.log("Advice Text:", adviceText);

    // 4️⃣ Save to AdviceHistory
    try {
      const history = new AdviceHistory({
        userId: req.user.id,
        query: transcript,
        response: adviceText
      });
      await history.save();
      console.log("Advice saved to history for user:", req.user.id);
    } catch (historyErr) {
      console.error("History Save Error:", historyErr.message);
      // Continue to respond even if history save fails
    }

    // 5️⃣ Text-to-Speech Conversion
    const ttsResponse = await axios.post(
      "https://api.sarvam.ai/text-to-speech",
      {
        text: adviceText,
        voice: "male",
        language: language,
      },
      {
        headers: {
          "api-subscription-key": process.env.SARVAM_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "json",
      }
    );

    const audioBase64 = ttsResponse.data.audios[0]; // Get base64 audio
    console.log("TTS Response received, audioBase64 length:", audioBase64.length);

    if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

    // Send JSON with advice text and base64 audio
    res.json({ adviceText, audioBase64 });
  } catch (err) {
    console.error("Advice API Error:", err.response?.data || err.message);
    if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    res.status(err.response?.status || 500).json({
      error: "Failed to fetch advice",
      details: err.response?.data || err.message,
    });
  }
});

module.exports = router;